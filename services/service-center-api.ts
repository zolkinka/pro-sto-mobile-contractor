import { apiClient } from '@/services/api-client';

type ServiceCenterNameResponse = {
  name?: string | null;
  legal_name?: string | null;
  legal_full_name?: string | null;
};

function pickName(data: ServiceCenterNameResponse | undefined): string | null {
  const name = data?.name?.trim() || data?.legal_name?.trim() || data?.legal_full_name?.trim();
  return name || null;
}

async function readName(url: string): Promise<string | null> {
  try {
    const response = await apiClient.get<ServiceCenterNameResponse>(url);
    return pickName(response.data);
  } catch {
    return null;
  }
}

export async function fetchServiceCenterName(uuid: string): Promise<string | null> {
  const publishedName = await readName(`/api/service-centers/${uuid}`);
  if (publishedName) {
    return publishedName;
  }

  const adminName = await readName(`/api/superadmin/service-centers/${uuid}`);
  if (adminName) {
    return adminName;
  }

  return readName(`/api/admin/service-centers/${uuid}/legal-data`);
}
