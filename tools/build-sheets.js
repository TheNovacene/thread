// Builds the OneThread paper sheets as A4 PDFs from the same data the site uses.
// Usage: node build-sheets.js <path to site html> <output dir>
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const [,, siteHtml, outDir] = process.argv;
fs.mkdirSync(outDir, { recursive: true });

// Pull the data constants straight out of the site's script so paper and screen never drift.
const src = fs.readFileSync(siteHtml, 'utf8');
const start = src.indexOf('const ROLES=');
const end = src.indexOf('const SEED_LOG=');
const data = new Function(src.slice(start, end) + '\nreturn {ROLES,STD,GROUPS,FIELDS,EMERGENCY_FIELDS,DEFAULT_PERMS,SITUATIONS};')();
const { ROLES, GROUPS, FIELDS, DEFAULT_PERMS, SITUATIONS } = data;

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtD = iso => { if (!iso) return ''; const d = new Date(iso + 'T00:00:00'); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const font = f => 'data:font/woff2;base64,' + fs.readFileSync(path.resolve(__dirname, 'node_modules/@fontsource', f)).toString('base64');

const RECORD_REF = 'THREAD-7K2M-QD4A';
const HOLDER = 'Sam Reid, 16';
const ident = { dob: '2 June 2010', nhs: '999 123 4567' };
const STORY_ID = 'story';
const signLabel = r => (r.signin.indexOf('CIS2') >= 0 ? 'Registration' : r.id === 'school' || r.id === 'send' || r.id === 'coach' ? 'Role' : 'Organisation');

const logo = `<svg class="logo" viewBox="0 0 214 40" role="img" aria-label="OneThread"><text x="0" y="30" font-family="Bricolage Grotesque" font-size="32" letter-spacing="-0.5"><tspan font-weight="500" fill="#B9121B">One</tspan><tspan font-weight="700" fill="#1B2430">Thread</tspan></text><path d="M-4 30 C 22 24, 46 36, 72 30 S 122 24, 152 30 S 178 36, 188 31 c 4 -4, 2 -9, -3 -8 c -5 1, -4 7, 1 8 c 6 1, 15 -1, 24 -5" fill="none" stroke="#B9121B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const css = `
@font-face{font-family:'Atkinson Hyperlegible';src:url('${font('atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-normal.woff2')}') format('woff2');font-weight:400}
@font-face{font-family:'Atkinson Hyperlegible';src:url('${font('atkinson-hyperlegible/files/atkinson-hyperlegible-latin-700-normal.woff2')}') format('woff2');font-weight:700}
@font-face{font-family:'Atkinson Hyperlegible';src:url('${font('atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-italic.woff2')}') format('woff2');font-weight:400;font-style:italic}
@font-face{font-family:'Bricolage Grotesque';src:url('${font('bricolage-grotesque/files/bricolage-grotesque-latin-500-normal.woff2')}') format('woff2');font-weight:500}
@font-face{font-family:'Bricolage Grotesque';src:url('${font('bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff2')}') format('woff2');font-weight:700}
@font-face{font-family:'IBM Plex Mono';src:url('${font('ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2')}') format('woff2');font-weight:400}
@page{size:A4;margin:14mm 14mm 18mm}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:'Atkinson Hyperlegible',system-ui,sans-serif;font-size:9.9pt;line-height:1.36;color:#1B2430}
.sheet{page-break-after:always}
.sheet:last-child{page-break-after:auto}
.top{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #B9121B;padding-bottom:6px;margin-bottom:10px}
.logo{height:26px;width:auto}
.top .num{font-family:'Bricolage Grotesque',sans-serif;font-weight:500;font-size:9pt;color:#5C6672;text-transform:uppercase;letter-spacing:.08em;text-align:right}
h1{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:19pt;line-height:1.1;margin:0 0 4px;letter-spacing:-.01em}
h2{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:11pt;margin:9px 0 3px;padding-top:5px;border-top:2px solid #D9DAD5}
.who{font-size:10.5pt;margin:0 0 2px}
.who b{font-weight:700}
.given{font-family:'IBM Plex Mono',monospace;font-size:8.6pt;color:#5C6672;margin:0 0 8px}
.intro{margin:0 0 8px;max-width:100%}
table{width:100%;border-collapse:collapse;font-size:9.4pt}
th{text-align:left;font-size:7.8pt;text-transform:uppercase;letter-spacing:.06em;color:#5C6672;padding:4px 6px 4px 0;border-bottom:1px solid #D9DAD5;font-weight:700}
td{vertical-align:top;padding:5px 8px 5px 0;border-bottom:1px solid #E6E6E2}
td.item{font-weight:700;width:21%}
td.src{width:21%;color:#5C6672;font-size:8.6pt}
td.rv{width:12%;font-family:'IBM Plex Mono',monospace;font-size:8.2pt;white-space:nowrap}
tr.crit td.detail{font-weight:700}
.gnote{font-size:8.8pt;color:#5C6672;margin:0 0 4px}
.sit{margin:0 0 5px}
.sit b{font-weight:700}
.pill{display:inline-block;font-size:7.4pt;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:1px 6px;border-radius:999px;margin-left:4px;vertical-align:middle}
.high{background:#F9E2E0;color:#B0271F}.medium{background:#F7EACF;color:#8A5800}.low{background:#DCF0E3;color:#2A7A4A}
.told{background:#F4EBDD;color:#6A4B27;padding:8px 10px;border-radius:6px;font-family:'Bricolage Grotesque',sans-serif;font-weight:500;font-size:10.5pt;margin:10px 0 0}
.story{font-family:'Bricolage Grotesque',sans-serif;font-weight:500;font-size:13pt;line-height:1.45;margin:8px 0}
.sign{margin-top:10px;padding-top:7px;border-top:1px solid #D9DAD5;font-size:9.2pt;page-break-inside:avoid}
.told,.sit,tr{page-break-inside:avoid}
.foot{margin-top:14px;padding-top:6px;border-top:1px solid #E6E6E2;font-size:7.6pt;color:#5C6672;display:flex;justify-content:space-between}
.small{font-size:8.8pt;color:#5C6672}
ul,ol{margin:4px 0 8px;padding-left:18px}
li{margin:0 0 3px}
.track td{height:22px}
.rule{height:2px;background:#B9121B;width:36px;margin:2px 0 8px;border-radius:2px}
`;

function fieldRows(fields) {
  return fields.map(f => `<tr class="${f.crit ? 'crit' : ''}"><td class="item">${esc(f.l)}</td><td class="detail">${esc(f.v)}</td><td class="src">${f.k === 'ver' ? 'Confirmed: ' + esc(f.s) : 'Sam wrote this' + esc(f.s.replace(/^Sam/, ''))}</td><td class="rv">${fmtD(f.r)}</td></tr>`).join('');
}
function groupsHtml(fields) {
  return GROUPS.filter(([gid]) => fields.some(f => f.g === gid)).map(([gid, gname, gnote]) =>
    `<h2>${esc(gname)}</h2>${gnote ? `<p class="gnote">${esc(gnote)}</p>` : ''}<table><thead><tr><th>Item</th><th>Detail</th><th>Source</th><th>Review by</th></tr></thead><tbody>${fieldRows(fields.filter(f => f.g === gid))}</tbody></table>`
  ).join('');
}
function situationsHtml(roleId) {
  const list = SITUATIONS.filter(s => s.roles.indexOf(roleId) >= 0);
  if (!list.length) return '';
  return `<h2>Situations for your role</h2>` + list.map(s => `<p class="sit"><b>${esc(s.name)}</b><span class="pill ${s.level}">${s.level}</span><br>${esc(s.need)}</p>`).join('');
}
function header(num, title) {
  return `<div class="top">${logo}<div class="num">Sheet ${num}<br>${esc(title)}</div></div>`;
}
const footer = '';
const pdfOpts = { format: 'A4', printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: `<div style="width:100%;font-size:7pt;color:#5C6672;font-family:Helvetica,Arial,sans-serif;padding:0 14mm;display:flex;justify-content:space-between"><span>OneThread paper sheets. Example record; Sam is invented. onethread.uk</span><span>Record ${RECORD_REF} · page <span class="pageNumber"></span></span></div>` };

const roleSheets = ROLES.filter(r => r.id !== 'send' || true); // all roles, in site order
const sheets = [];

// Sheet 0: how to use + tracking table
sheets.push({ file: 'onethread-sheet-00-how-to-use.pdf', title: 'How to use these sheets', html: `
${header(0, 'How to use these sheets')}
<h1>One sheet per role. The young person decides who gets one.</h1>
<div class="rule"></div>
<p class="intro">Each sheet holds only what that person needs to do their job. Hand over the sheet for their role and nothing else. The full record stays with the young person.</p>
<ul>
<li>The young person decides who gets a sheet. A parent may act for them when they agree.</li>
<li>Write the date given and a review date on every sheet, and log it in the table below. That table is the paper version of the access log.</li>
<li>Every line says where it came from. <b>Confirmed</b> means a clinician or the school signed it off. <b>Sam wrote this</b> means the young person did.</li>
<li>Anything a professional might act on (allergies, medication, restrictions) carries a review date. Once it has passed, the line is out of date and the reader should check before acting.</li>
<li>The account of what happened is a separate sheet (Sheet 12), given only to the people the young person has chosen. Every other sheet says so, so nobody needs to ask.</li>
<li>When a sheet is no longer needed, ask for it back or for it to be destroyed, and note that in the table.</li>
<li>This set is example data about a fictional young person. Replace it with the real record before any sheet is given out.</li>
</ul>
<h2>Who has a sheet</h2>
<p class="small">Fill a row each time a sheet is handed over. Keep this page with the full record.</p>
<table class="track"><thead><tr><th style="width:30%">Sheet</th><th>Given to (name)</th><th style="width:14%">Given on</th><th style="width:14%">Review by</th><th style="width:18%">Returned on</th></tr></thead><tbody>
${ROLES.map((r, i) => `<tr><td class="item">${i + 1}. ${esc(r.name)}</td><td></td><td></td><td></td><td></td></tr>`).join('')}
<tr><td class="item">${ROLES.length + 1}. What happened, told once</td><td></td><td></td><td></td><td></td></tr>
<tr><td class="item">${ROLES.length + 1}. What happened, told once</td><td></td><td></td><td></td><td></td></tr>
</tbody></table>
${footer}` });

ROLES.forEach((r, i) => {
  const num = i + 1;
  const allowed = (DEFAULT_PERMS[r.id] || []);
  const fields = FIELDS.filter(f => allowed.indexOf(f.id) >= 0 && f.id !== STORY_ID);
  const hasStory = allowed.indexOf(STORY_ID) >= 0;
  const hasDob = allowed.indexOf('dob') >= 0, hasNhs = allowed.indexOf('nhs') >= 0;
  const body = fields.filter(f => f.g !== 'identity');
  const slug = r.name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  sheets.push({ file: `onethread-sheet-${String(num).padStart(2, '0')}-${slug}.pdf`, title: r.name, html: `
${header(num, r.name)}
<h1>${esc(r.name)}</h1>
<p class="who"><b>${HOLDER}</b>${hasDob ? ` · Date of birth ${ident.dob}` : ''}${hasNhs ? ` · NHS number ${ident.nhs}` : ''}</p>
<p class="given">Given by Sam on ____________ · Review by ____________ · Record ${RECORD_REF}</p>
<p class="intro">This sheet holds only what this role needs. ${hasStory ? 'Sam has chosen to share the account of what happened with you: it is Sheet ' + (ROLES.length + 1) + ', attached separately. ' : ''}A line whose review date has passed is out of date: check before acting on it.</p>
${groupsHtml(body)}
${situationsHtml(r.id)}
${hasStory ? '' : `<p class="told">Sam has written an account of what happened and chosen who can read it. It is not on this sheet, and you do not need to ask.</p>`}
<p class="sign">I have read this sheet. Name: ____________________ ${signLabel(r)}: ____________________ Date: ____________</p>
${footer}` });
});

const story = FIELDS.find(f => f.id === STORY_ID);
sheets.push({ file: `onethread-sheet-${ROLES.length + 1}-what-happened-told-once.pdf`, title: 'What happened, told once', html: `
${header(ROLES.length + 1, 'What happened, told once')}
<h1>What happened, told once</h1>
<p class="who"><b>${HOLDER}</b></p>
<p class="given">Given by Sam on ____________ · Given only to ____________ · Record ${RECORD_REF}</p>
<p class="intro">This sheet exists so that Sam never has to tell it twice. Sam chose who receives it. Do not copy it, do not pass it on, and do not read it aloud to Sam. Return it to Sam when you no longer need it.</p>
<h2>In my words</h2>
<p class="story">${esc(story.v)}</p>
<p class="small">Written by ${esc(story.s)} 2026.</p>
<p class="intro"><b>If you need more than this</b> for your work, say so to Sam or Sara, and say why. Sam will decide. Nothing here is a statement for the police or an insurer; that is handled separately and is not part of this record.</p>
<p class="sign">I have read this sheet and will return it. Name: ____________________ Role: ____________________ Date: ____________</p>
${footer}` });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const wrap = inner => `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><style>${css}</style></head><body>${inner}</body></html>`;
  const index = [];
  for (const s of sheets) {
    await page.setContent(wrap(`<div class="sheet">${s.html}</div>`), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf(Object.assign({ path: path.join(outDir, s.file) }, pdfOpts));
    const pages = await countPages(path.join(outDir, s.file));
    index.push({ file: s.file, title: s.title, pages });
  }
  await page.setContent(wrap(sheets.map(s => `<div class="sheet">${s.html}</div>`).join('')), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf(Object.assign({ path: path.join(outDir, 'onethread-paper-sheets-all.pdf') }, pdfOpts));
  await browser.close();
  fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2));
  console.log(index.map(i => `${i.pages}p  ${i.file}`).join('\n'));
})();

async function countPages(file) {
  const buf = fs.readFileSync(file, 'latin1');
  const m = buf.match(/\/Type\s*\/Page[^s]/g);
  return m ? m.length : 0;
}
