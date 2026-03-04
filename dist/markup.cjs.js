'use strict';
/* markup-lang v1.0.0 | MIT License */

Object.defineProperty(exports, '__esModule', { value: true });

// ── HELPERS ──────────────────────────────────────────────────────────────────

function esc(t) {
  return t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderInline(text) {
  text = esc(text);
  text = text.replace(/\*\*(.+?)\*\*/g, '<span class="mu-bold">$1</span>');
  text = text.replace(/\/\/(.+?)\/\//g, '<em class="mu-italic">$1</em>');
  text = text.replace(/~~(.+?)~~/g, '<span class="mu-strike">$1</span>');
  text = text.replace(/==(.+?)==/g, '<span class="mu-highlight">$1</span>');
  text = text.replace(/`(.+?)`/g, '<code class="mu-code">$1</code>');
  text = text.replace(/\[\[(.+?)\]\]/g, '<kbd class="mu-kbd">$1</kbd>');
  text = text.replace(
    /\[\^(\w+)\](?!:)/g,
    '<sup class="mu-sup"><a href="#fn-$1" style="color:inherit;text-decoration:none">[$1]</a></sup>'
  );
  text = text.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<div class="mu-img-wrap"><img class="mu-img" src="$2" alt="$1"><div class="mu-img-caption">$1</div></div>'
  );
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a class="mu-link" href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  return text;
}

function miniParse(text) {
  return text
    .trim()
    .split('\n')
    .map(l =>
      l.trim()
        ? `<p style="margin-bottom:8px;color:#c8c4bc;font-size:14px">${renderInline(l)}</p>`
        : ''
    )
    .join('');
}

function parse(raw) {
  const lines = raw.split('\n');
  let html = '';

  const footnotes = {};
  for (const line of lines) {
    const fnDef = line.match(/^\[\^(\w+)\]:\s+(.+)/);
    if (fnDef) footnotes[fnDef[1]] = fnDef[2];
  }

  let olCounter = 0;
  let inCodeBlock = false;
  let codeLines = [];
  let inCollapse = false;
  let collapseTitle = '';
  let collapseBody = '';
  let tableRows = [];
  let inTable = false;
  let collapseId = 0;

  function flushTable() {
    if (!tableRows.length) return;
    let t = '<table class="mu-table">';
    tableRows.forEach((row, idx) => {
      const cells = row.split('|').slice(1, -1).map(c => c.trim());
      if (idx === 0) {
        t += '<thead><tr>' + cells.map(c => `<th>${renderInline(c)}</th>`).join('') + '</tr></thead><tbody>';
      } else {
        t += '<tr>' + cells.map(c => `<td>${renderInline(c)}</td>`).join('') + '</tr>';
      }
    });
    t += '</tbody></table>';
    html += t;
    tableRows = [];
    inTable = false;
  }

  const calloutMap = { '[INFO]': 'info', '[SUCCESS]': 'success', '[WARNING]': 'warning', '[ERROR]': 'error' };
  const calloutIcon = { info: 'ℹ', success: '✓', warning: '⚠', error: '✕' };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('    ')) {
      if (inTable) flushTable();
      if (!inCodeBlock) { inCodeBlock = true; codeLines = []; }
      codeLines.push(esc(line.slice(4)));
      olCounter = 0;
      continue;
    } else if (inCodeBlock) {
      html += `<code class="mu-codeblock">${codeLines.join('\n')}</code>`;
      inCodeBlock = false; codeLines = [];
    }

    if (line.startsWith('[? ')) {
      if (inTable) flushTable();
      inCollapse = true;
      collapseTitle = line.slice(3).trim();
      collapseBody = '';
      olCounter = 0;
      continue;
    }
    if (inCollapse) {
      if (line.trim() === '?]') {
        const cid = 'mu-cl' + ++collapseId;
        html +=
          `<div class="mu-details" id="${cid}">` +
          `<div class="mu-summary" onclick="(function(el){el.classList.toggle('open');var b=el.querySelector('.mu-details-body');b.style.display=el.classList.contains('open')?'block':'none'})(this.parentElement)">` +
          `<span>${renderInline(collapseTitle)}</span><span class="arrow">▶</span></div>` +
          `<div class="mu-details-body" style="display:none">${miniParse(collapseBody)}</div></div>`;
        inCollapse = false;
      } else {
        collapseBody += line + '\n';
      }
      continue;
    }

    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true; tableRows.push(line.trim()); olCounter = 0; continue;
    } else if (inTable) { flushTable(); }

    if (/^\[\^\w+\]:\s+/.test(line)) continue;
    if (line.trim() === '---') { html += '<hr class="mu-hr">'; olCounter = 0; continue; }

    if (line.startsWith('### ')) { html += `<h3 class="mu-h3">${renderInline(line.slice(4))}</h3>`; olCounter = 0; continue; }
    if (line.startsWith('## '))  { html += `<h2 class="mu-h2">${renderInline(line.slice(3))}</h2>`; olCounter = 0; continue; }
    if (line.startsWith('# '))   { html += `<div class="mu-h1">${renderInline(line.slice(2))}</div>`; olCounter = 0; continue; }

    let matched = false;
    for (const [tag, cls] of Object.entries(calloutMap)) {
      if (line.startsWith(tag)) {
        html += `<div class="mu-callout ${cls}"><span class="icon">${calloutIcon[cls]}</span><span>${renderInline(line.slice(tag.length).trim())}</span></div>`;
        matched = true; olCounter = 0; break;
      }
    }
    if (matched) continue;

    if (line.startsWith('> ')) { html += `<blockquote class="mu-quote">${renderInline(line.slice(2))}</blockquote>`; olCounter = 0; continue; }

    const cbm = line.match(/^\[(x| )\] (.+)/i);
    if (cbm) {
      const checked = cbm[1].toLowerCase() === 'x';
      html += `<label class="mu-check${checked ? ' checked' : ''}" onclick="this.classList.toggle('checked')"><span class="mu-check-box"></span><span class="mu-check-label">${renderInline(cbm[2])}</span></label>`;
      olCounter = 0; continue;
    }

    const olm = line.match(/^(\d+)\.\s+(.+)/);
    if (olm) { olCounter++; html += `<div class="mu-oli"><span class="num">${olCounter}.</span><span>${renderInline(olm[2])}</span></div>`; continue; }
    else { olCounter = 0; }

    if (line.startsWith('- ')) { html += `<div class="mu-li">${renderInline(line.slice(2))}</div>`; continue; }
    if (line.trim() === '') continue;

    html += `<p>${renderInline(line)}</p>`;
  }

  if (inCodeBlock) html += `<code class="mu-codeblock">${codeLines.join('\n')}</code>`;
  if (inTable) flushTable();

  const fkeys = Object.keys(footnotes);
  if (fkeys.length) {
    html += '<div class="mu-footnotes"><div class="fn-title">Footnotes</div>';
    for (const k of fkeys) {
      html += `<div class="mu-fn-entry" id="fn-${k}"><span class="fn-num">[${k}]</span><span>${renderInline(footnotes[k])}</span></div>`;
    }
    html += '</div>';
  }

  return html;
}

exports.parse = parse;
exports.renderInline = renderInline;
