#!/usr/bin/env node
// 把 docs/ 下跨章节目录链接的数字前缀剥掉：
//   ../06-engineering/ → /engineering/
//   ../05-cases/        → /cases/
// 不动同目录文件链接（./xx-yy.md 或 ./）和单文件跨章节链接（../NN-xxx/file.md）。
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DOCS = new URL('../docs/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

const PREFIX_MAP = {
  '00-preface': 'preface',
  '01-basics': 'basics',
  '02-installation': 'installation',
  '03-core-features': 'core-features',
  '04-providers': 'providers',
  '05-cases': 'cases',
  '06-engineering': 'engineering',
  '07-troubleshooting': 'troubleshooting',
  '99-appendix': 'appendix',
};

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (name.endsWith('.md')) files.push(p);
  }
  return files;
}

const files = walk(DOCS);
let changed = 0;

for (const file of files) {
  let src = readFileSync(file, 'utf8');
  const orig = src;

  // 仅 ](../NN-name/) 这种结尾斜杠的目录链接
  src = src.replace(/\]\(\.\.\/(0[0-9]|99)-([a-z-]+)\/\)/g, (_, num, name) => {
    const slug = PREFIX_MAP[`${num}-${name}`];
    return slug ? `](/${slug}/)` : _;
  });

  if (src !== orig) {
    writeFileSync(file, src);
    changed++;
    console.log(`  modified: ${relative(DOCS, file)}`);
  }
}

console.log(`\nfixed ${changed} files`);
