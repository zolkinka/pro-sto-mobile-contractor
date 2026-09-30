#!/usr/bin/env node
/**
 * Create a dev booking for the signed-in contractor and open its QR.
 *
 *   npm run booking:qr
 *   npm run booking:qr -- --minutes 30
 *
 * Defaults: API from .env, admin +79999800425, code 1234.
 * Override with --api, --phone, --code, --client-phone, --minutes, --no-open.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_PHONE = '+79999800425';
const DEFAULT_CODE = '1234';
const DEFAULT_CLIENT_PHONE = '+79990000421';
const DEFAULT_CLIENT_NAME = 'Проверка QR';
const DEFAULT_MINUTES = 20;

function readDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const values = {};

  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separator = trimmed.indexOf('=');

    if (separator === -1) {
      continue;
    }

    values[trimmed.slice(0, separator).trim()] = trimmed.slice(separator + 1).trim();
  }

  return values;
}

function parseArgs(argv) {
  const args = { open: true };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--no-open') {
      args.open = false;
      continue;
    }

    if (!arg.startsWith('--')) {
      continue;
    }

    const key = arg.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

async function api(baseUrl, requestPath, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${baseUrl}${requestPath}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data = {};

  if (text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const error = new Error(data.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

function pickService(services, serviceCenterUuid) {
  const own = services.filter(
    (service) => service.service_center_uuid === serviceCenterUuid && !service.deleted_at,
  );
  const main = own.filter((service) => service.service_type === 'main');
  const pool = main.length > 0 ? main : own;
  const active = pool.filter((service) => service.is_active !== false);
  const candidates = active.length > 0 ? active : pool;

  return candidates
    .slice()
    .sort((left, right) => (left.duration_minutes || 999) - (right.duration_minutes || 999))[0];
}

function isSlotConflict(error) {
  return /слот|занят|пересеч/i.test(error.message || '');
}

function formatMoscow(iso) {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function writeQr(payload, filePath) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'npx',
      ['--yes', 'qrcode', '-o', filePath, '-w', '480', payload],
      { cwd: os.tmpdir(), stdio: 'inherit' },
    );

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`qrcode exited with ${code}`));
    });
  });
}

async function main() {
  const args = parseArgs(process.argv);
  const envFile = readDotEnv(path.join(ROOT, '.env'));
  const baseUrl = String(args.api || process.env.API_BASE_URL || envFile.API_BASE_URL || 'https://dev.prosto-app.ru').replace(
    /\/$/,
    '',
  );
  const phone = String(args.phone || process.env.BOOKING_QR_PHONE || DEFAULT_PHONE);
  const code = String(args.code || process.env.BOOKING_QR_CODE || DEFAULT_CODE);
  const clientPhone = String(args['client-phone'] || DEFAULT_CLIENT_PHONE);
  const leadMinutes = Number(args.minutes || DEFAULT_MINUTES);

  if (!Number.isFinite(leadMinutes) || leadMinutes < 1) {
    throw new Error('--minutes должен быть положительным числом');
  }

  await api(baseUrl, '/api/admin-auth/send-code', {
    method: 'POST',
    body: { phone },
  });
  const login = await api(baseUrl, '/api/admin-auth/login', {
    method: 'POST',
    body: { phone, code },
  });
  const token = login.accessToken;
  const serviceCenterUuid = login.user?.service_center_uuid;

  if (!token || !serviceCenterUuid) {
    throw new Error('У аккаунта нет сервисного центра');
  }

  const services = await api(baseUrl, '/api/admin/services', { token });
  const serviceList = Array.isArray(services) ? services : services.data || services.items || [];
  const service = pickService(serviceList, serviceCenterUuid);

  if (!service) {
    throw new Error('У сервиса нет услуги, на которую можно создать запись');
  }

  const client = await api(baseUrl, '/api/admin/clients/find-or-create', {
    method: 'POST',
    token,
    body: { phone: clientPhone, name: DEFAULT_CLIENT_NAME },
  });

  let created = null;
  let lastError = null;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const start = new Date(Date.now() + (leadMinutes + attempt * 15) * 60 * 1000);
    start.setSeconds(0, 0);

    try {
      created = await api(baseUrl, '/api/admin/bookings', {
        method: 'POST',
        token,
        body: {
          service_center_uuid: serviceCenterUuid,
          client_uuid: client.uuid,
          service_uuid: service.uuid,
          start_time: start.toISOString(),
          payment_method: 'cash',
          admin_comment: DEFAULT_CLIENT_NAME,
        },
      });
      break;
    } catch (error) {
      lastError = error;

      if (error.status === 400 && isSlotConflict(error) && attempt < 3) {
        continue;
      }

      throw error;
    }
  }

  if (!created) {
    throw lastError || new Error('Не удалось создать запись');
  }

  const details = await api(baseUrl, `/api/admin/bookings/${created.uuid}`, { token });
  const payload = details.qr_payload;

  if (!payload || !details.confirmation_code) {
    throw new Error('Сервер не вернул код подтверждения для QR');
  }

  const qrPath = path.join(os.tmpdir(), 'prosto-booking-qr.png');
  await writeQr(payload, qrPath);

  if (args.open && process.platform === 'darwin') {
    spawn('open', [qrPath], { stdio: 'ignore', detached: true }).unref();
  }

  console.log('');
  console.log(details.serviceCenterName || 'Сервис');
  console.log(`${details.service?.name || service.name}, ${formatMoscow(details.start_time)}`);
  console.log(`Клиент: ${client.name} ${client.phone}`);
  console.log(`Код: ${details.confirmation_code}`);
  console.log(`QR: ${payload}`);
  console.log(`Файл: ${qrPath}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
