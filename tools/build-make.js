// Builds make/index.html (the family's own sheet-maker) from the site's data and the template.
// Usage: node build-make.js <site index.html> <make-template.html> <output make/index.html>
'use strict';
const fs = require('fs');
const [,, siteHtml, template, out] = process.argv;
const src = fs.readFileSync(siteHtml, 'utf8');
const start = src.indexOf('const ROLES=');
const end = src.indexOf('const SEED_LOG=');
const data = new Function(src.slice(start, end) + '\nreturn {ROLES,STD,GROUPS,FIELDS,DEFAULT_PERMS,SITUATIONS};')();
const json = JSON.stringify(data).replace(/</g, '\\u003c');
const html = fs.readFileSync(template, 'utf8').replace('/*__DATA__*/', 'const DATA=' + json + ';');
fs.mkdirSync(require('path').dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log('wrote', out, html.length, 'bytes');
