#!/usr/bin/env node
'use strict';

/**
 * pnpm can resolve the same RN header via two paths (`"SchedulerPriorityUtils.h"`
 * vs `<react/renderer/runtimescheduler/SchedulerPriorityUtils.h>`), so #pragma once
 * does not dedupe and Xcode reports redefinition errors in React-runtimescheduler.
 */
const fs = require('fs');
const path = require('path');

const MARKER = 'PATCHED_PROSTO_RUNTIMESCHEDULER_INCLUDES';

const reactNativeRoot = path.join(__dirname, '..', 'node_modules', 'react-native');
if (!fs.existsSync(reactNativeRoot)) {
  process.exit(0);
}

const filesToPatch = [
  'ReactCommon/react/renderer/runtimescheduler/RuntimeScheduler_Legacy.cpp',
  'ReactCommon/react/renderer/runtimescheduler/RuntimeSchedulerBinding.cpp',
];

for (const relativePath of filesToPatch) {
  const filePath = path.join(reactNativeRoot, relativePath);
  if (!fs.existsSync(filePath)) {
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(MARKER)) {
    continue;
  }

  const next = content.replace(
    /\n#include "SchedulerPriorityUtils.h"/,
    `\n// ${MARKER}: already included via RuntimeScheduler.h`,
  );

  if (next === content) {
    continue;
  }

  fs.writeFileSync(filePath, next, 'utf8');
}
