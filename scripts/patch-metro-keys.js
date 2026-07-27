#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const MARKER = 'PATCHED_PROSTO_PLATFORM_KEYS';
const targetFile = path.join(
  __dirname,
  '../node_modules/@react-native/community-cli-plugin/dist/commands/start/attachKeyHandlers.js',
);

if (!fs.existsSync(targetFile)) {
  process.exit(0);
}

let content = fs.readFileSync(targetFile, 'utf8');
if (content.includes(MARKER)) {
  process.exit(0);
}

if (!content.includes('var _child_process = require("child_process");')) {
  content = content.replace(
    'var _util = require("util");',
    'var _util = require("util");\nvar _child_process = require("child_process");',
  );
}

content = content.replace(
  'function attachKeyHandlers({ devServerUrl, messageSocket, reporter }) {',
  `// ${MARKER}
function runNativePlatform(platform) {
  const command = platform === "ios" ? "run-ios" : "run-android";
  _child_process.spawn("npx", ["react-native", command], {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: true,
    detached: true,
  }).unref();
}
function attachKeyHandlers({ devServerUrl, messageSocket, reporter }) {`,
);

content = content.replace(
  '      case "j":\n        void openDebuggerKeyboardHandler.handleOpenDebugger();\n        break;\n      case CTRL_C:',
  `      case "j":
        void openDebuggerKeyboardHandler.handleOpenDebugger();
        break;
      case "i":
        reporter.update({
          type: "unstable_server_log",
          level: "info",
          data: "Running on iOS simulator...",
        });
        runNativePlatform("ios");
        break;
      case "a":
        reporter.update({
          type: "unstable_server_log",
          level: "info",
          data: "Running on Android emulator...",
        });
        runNativePlatform("android");
        break;
      case CTRL_C:`,
);

content = content.replace(
  '  ${(0, _util.styleText)(["bold", "inverse"], " j ")} - open DevTools\n`,',
  '  ${(0, _util.styleText)(["bold", "inverse"], " j ")} - open DevTools\n  ${(0, _util.styleText)(["bold", "inverse"], " i ")} - run on iOS\n  ${(0, _util.styleText)(["bold", "inverse"], " a ")} - run on Android\n`,',
);

fs.writeFileSync(targetFile, content);
