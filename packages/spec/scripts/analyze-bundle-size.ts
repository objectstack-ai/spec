// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Bundle Size Analyzer for @objectstack/spec
 *
 * Analyzes and documents the bundle sizes for all subpath exports.
 * Run with: tsx scripts/analyze-bundle-size.ts
 */

import fs from 'fs';
import path from 'path';

const SPEC_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(SPEC_DIR, 'dist');
const PKG_JSON = JSON.parse(fs.readFileSync(path.join(SPEC_DIR, 'package.json'), 'utf-8'));

interface SizeEntry {
  subpath: string;
  esm: number;
  cjs: number;
  dts: number;
  total: number;
}

function getFileSize(filePath: string): number {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function analyzeExports(): SizeEntry[] {
  const entries: SizeEntry[] = [];
  const exports = PKG_JSON.exports || {};

  for (const [subpath, targets] of Object.entries(exports)) {
    if (typeof targets !== 'object' || targets === null) continue;

    const t = targets as Record<string, string>;
    const esmPath = t.import ? path.join(SPEC_DIR, t.import) : '';
    const cjsPath = t.require ? path.join(SPEC_DIR, t.require) : '';
    const dtsPath = t.types ? path.join(SPEC_DIR, t.types) : '';

    const esm = esmPath ? getFileSize(esmPath) : 0;
    const cjs = cjsPath ? getFileSize(cjsPath) : 0;
    const dts = dtsPath ? getFileSize(dtsPath) : 0;

    entries.push({
      subpath,
      esm,
      cjs,
      dts,
      total: esm + cjs + dts,
    });
  }

  return entries.sort((a, b) => b.total - a.total);
}

function analyzeDistDirectory(): { totalFiles: number; totalSize: number; byExtension: Record<string, { count: number; size: number }> } {
  if (!fs.existsSync(DIST_DIR)) {
    return { totalFiles: 0, totalSize: 0, byExtension: {} };
  }

  const byExtension: Record<string, { count: number; size: number }> = {};
  let totalFiles = 0;
  let totalSize = 0;

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        const ext = path.extname(entry.name);
        const size = getFileSize(full);
        totalFiles++;
        totalSize += size;
        if (!byExtension[ext]) byExtension[ext] = { count: 0, size: 0 };
        byExtension[ext].count++;
        byExtension[ext].size += size;
      }
    }
  }

  walk(DIST_DIR);
  return { totalFiles, totalSize, byExtension };
}

// ─── Execution ──────────────────────────────────────────────────────

console.log('📦 @objectstack/spec Bundle Size Analysis');
console.log('='.repeat(60));

// 1. Check if dist exists
if (!fs.existsSync(DIST_DIR)) {
  console.log('\n⚠️  dist/ directory not found. Run `pnpm build` first.\n');
  process.exit(0);
}

// 2. Analyze dist directory
const distInfo = analyzeDistDirectory();
console.log(`\n📁 dist/ Overview`);
console.log(`  Total files: ${distInfo.totalFiles}`);
console.log(`  Total size:  ${formatBytes(distInfo.totalSize)}`);
console.log('');
console.log('  By extension:');
for (const [ext, info] of Object.entries(distInfo.byExtension).sort((a, b) => b[1].size - a[1].size)) {
  console.log(`    ${(ext || '(no ext)').padEnd(8)} ${String(info.count).padStart(5)} files  ${formatBytes(info.size).padStart(10)}`);
}

// 3. Analyze subpath exports
const entries = analyzeExports();
console.log(`\n📊 Subpath Export Sizes`);
console.log('-'.repeat(60));
console.log(`  ${'Subpath'.padEnd(20)} ${'ESM'.padStart(10)} ${'CJS'.padStart(10)} ${'DTS'.padStart(10)} ${'Total'.padStart(10)}`);
console.log('-'.repeat(60));

let grandTotal = 0;
for (const entry of entries) {
  console.log(`  ${entry.subpath.padEnd(20)} ${formatBytes(entry.esm).padStart(10)} ${formatBytes(entry.cjs).padStart(10)} ${formatBytes(entry.dts).padStart(10)} ${formatBytes(entry.total).padStart(10)}`);
  grandTotal += entry.total;
}
console.log('-'.repeat(60));
console.log(`  ${'TOTAL'.padEnd(20)} ${' '.repeat(30)} ${formatBytes(grandTotal).padStart(10)}`);

// 4. JSON Schema sizes
const jsonSchemaDir = path.join(SPEC_DIR, 'json-schema');
if (fs.existsSync(jsonSchemaDir)) {
  let jsonTotal = 0;
  let jsonCount = 0;
  
  function walkJson(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkJson(full);
      } else if (entry.name.endsWith('.json')) {
        jsonTotal += getFileSize(full);
        jsonCount++;
      }
    }
  }
  
  walkJson(jsonSchemaDir);
  console.log(`\n📋 JSON Schemas`);
  console.log(`  Files: ${jsonCount}`);
  console.log(`  Total: ${formatBytes(jsonTotal)}`);
}

// 5. Write report as JSON
const report = {
  version: PKG_JSON.version,
  timestamp: new Date().toISOString(),
  dist: {
    totalFiles: distInfo.totalFiles,
    totalSize: distInfo.totalSize,
    byExtension: distInfo.byExtension,
  },
  exports: entries,
  grandTotal,
};

const reportPath = path.join(SPEC_DIR, 'bundle-size-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n💾 Report saved to: bundle-size-report.json`);
console.log('');
