import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { loadPdfLib } from '../core/lazy.js';

const PAGE = { width: 595.28, height: 841.89 };
const MARGIN = 48;

function localDateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return localDateString(next);
}

function cleanText(value) {
  return String(value || '').replace(/\r\n?/g, '\n').trim();
}

function pdfText(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '?');
}

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function money(value, symbol) {
  return `${symbol}${safeNumber(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function estimateFilename(number) {
  const safe = String(number || 'estimate').trim().replace(/[^a-z0-9-]+/gi, '-').replace(/^-+|-+$/g, '');
  return `${safe || 'estimate'}.pdf`;
}

function wrapText(text, maxWidth, font, size) {
  const words = pdfText(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function drawWrapped(page, text, x, y, maxWidth, font, size, color, lineGap = 4) {
  let cursor = y;
  for (const rawLine of pdfText(text).split('\n')) {
    for (const line of wrapText(rawLine, maxWidth, font, size)) {
      page.drawText(line, { x, y: cursor, size, font, color });
      cursor -= size + lineGap;
    }
  }
  return cursor;
}

function totals(items, taxRate, discount, depositRate) {
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const boundedDiscount = Math.min(Math.max(discount, 0), subtotal);
  const taxable = Math.max(subtotal - boundedDiscount, 0);
  const tax = taxable * Math.max(taxRate, 0) / 100;
  const total = taxable + tax;
  const deposit = total * Math.min(Math.max(depositRate, 0), 100) / 100;
  return { subtotal, discount: boundedDiscount, tax, total, deposit };
}

export default {
  init() {
    const fromEl = document.getElementById('quote-from');
    const clientEl = document.getElementById('quote-client');
    const numberEl = document.getElementById('quote-number');
    const dateEl = document.getElementById('quote-date');
    const validEl = document.getElementById('quote-valid');
    const currencyEl = document.getElementById('quote-currency');
    const projectEl = document.getElementById('quote-project');
    const itemEl = document.getElementById('quote-item');
    const qtyEl = document.getElementById('quote-qty');
    const priceEl = document.getElementById('quote-price');
    const taxEl = document.getElementById('quote-tax');
    const discountEl = document.getElementById('quote-discount');
    const depositEl = document.getElementById('quote-deposit');
    const notesEl = document.getElementById('quote-notes');
    const countEl = document.getElementById('quote-count');
    const totalEl = document.getElementById('quote-total');
    const depositTotalEl = document.getElementById('quote-deposit-total');
    const listEl = document.getElementById('quote-list');
    const btnPdf = document.getElementById('btn-quote-pdf');
    let items = [];

    dateEl.value = localDateString(new Date());
    validEl.value = addDays(new Date(), 30);
    numberEl.value = `EST-${new Date().getFullYear()}-001`;

    const calc = () => totals(items, safeNumber(taxEl.value), safeNumber(discountEl.value), safeNumber(depositEl.value));
    const render = () => {
      const symbol = currencyEl.value;
      const total = calc();
      countEl.textContent = String(items.length);
      totalEl.textContent = money(total.total, symbol);
      depositTotalEl.textContent = money(total.deposit, symbol);
      listEl.replaceChildren();
      if (!items.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'No estimate items added yet.';
        listEl.appendChild(empty);
        return;
      }
      items.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'invoice-row';
        const meta = document.createElement('div');
        const name = document.createElement('strong');
        name.textContent = item.name;
        const detail = document.createElement('span');
        detail.textContent = `${item.qty} x ${money(item.price, symbol)}`;
        meta.append(name, detail);
        const amount = document.createElement('strong');
        amount.textContent = money(item.qty * item.price, symbol);
        const remove = document.createElement('button');
        remove.className = 'btn btn-secondary';
        remove.textContent = 'Remove';
        remove.onclick = () => { items.splice(index, 1); render(); };
        row.append(meta, amount, remove);
        listEl.appendChild(row);
      });
    };

    const addItem = () => {
      const name = itemEl.value.trim();
      const qty = safeNumber(qtyEl.value, NaN);
      const price = safeNumber(priceEl.value, NaN);
      if (!name) return UI.showError('Enter an item name.');
      if (!Number.isFinite(qty) || qty <= 0) return UI.showError('Enter a valid quantity.');
      if (!Number.isFinite(price) || price < 0) return UI.showError('Enter a valid rate.');
      items.push({ name, qty, price });
      itemEl.value = '';
      qtyEl.value = '1';
      priceEl.value = '';
      itemEl.focus();
      render();
    };

    const sample = () => {
      fromEl.value = 'Northstar Studio\nhello@northstar.example\nBerlin, Germany';
      clientEl.value = 'Harbor & Co.\nprojects@harbor.example\nMarketing team';
      numberEl.value = `EST-${new Date().getFullYear()}-104`;
      projectEl.value = 'Website refresh including landing page design, responsive build, launch QA, and handoff notes.';
      notesEl.value = 'Estimate valid for 30 days. 40% deposit to start, balance due on delivery. Timeline begins after assets are received.';
      taxEl.value = '7';
      discountEl.value = '150';
      depositEl.value = '40';
      items = [
        { name: 'Discovery and content structure', qty: 1, price: 450 },
        { name: 'Landing page visual design', qty: 1, price: 1250 },
        { name: 'Responsive implementation', qty: 1, price: 1800 },
        { name: 'Launch QA and handoff', qty: 1, price: 500 },
      ];
      render();
      UI.showSuccess('Sample estimate loaded.');
    };

    const summary = () => {
      const symbol = currencyEl.value;
      const total = calc();
      return [
        `Estimate ${numberEl.value || ''}`.trim(),
        `Client: ${cleanText(clientEl.value).split('\n')[0] || '-'}`,
        `Valid until: ${validEl.value || '-'}`,
        '',
        ...items.map(item => `- ${item.name}: ${item.qty} x ${money(item.price, symbol)} = ${money(item.qty * item.price, symbol)}`),
        '',
        `Total: ${money(total.total, symbol)}`,
        `Deposit: ${money(total.deposit, symbol)}`,
      ].join('\n');
    };

    const generatePdf = async () => {
      if (!items.length) return UI.showError('Add at least one estimate item.');
      if (!cleanText(fromEl.value)) return UI.showError('Enter sender details.');
      if (!cleanText(clientEl.value)) return UI.showError('Enter client details.');
      UI.setLoading(btnPdf, true, 'Download Estimate PDF');
      try {
        const { PDFDocument, StandardFonts, rgb } = await loadPdfLib();
        const pdf = await PDFDocument.create();
        let page = pdf.addPage([PAGE.width, PAGE.height]);
        const regular = await pdf.embedFont(StandardFonts.Helvetica);
        const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
        const fg = rgb(0.11, 0.11, 0.13);
        const muted = rgb(0.38, 0.38, 0.43);
        const line = rgb(0.82, 0.82, 0.86);
        const accent = rgb(0.32, 0.27, 0.78);
        const symbol = currencyEl.value;
        const total = calc();

        page.drawText('ESTIMATE', { x: MARGIN, y: 770, size: 30, font: bold, color: fg });
        page.drawText(pdfText(numberEl.value.trim() || 'Estimate'), { x: MARGIN, y: 742, size: 11, font: regular, color: muted });
        page.drawText('Estimated Total', { x: 400, y: 772, size: 10, font: regular, color: muted });
        page.drawText(money(total.total, symbol), { x: 400, y: 746, size: 22, font: bold, color: accent });
        page.drawLine({ start: { x: MARGIN, y: 720 }, end: { x: 547, y: 720 }, thickness: 1, color: line });

        page.drawText('From', { x: MARGIN, y: 690, size: 10, font: bold, color: muted });
        drawWrapped(page, cleanText(fromEl.value), MARGIN, 672, 220, regular, 10, fg);
        page.drawText('Prepared For', { x: 320, y: 690, size: 10, font: bold, color: muted });
        drawWrapped(page, cleanText(clientEl.value), 320, 672, 220, regular, 10, fg);
        page.drawText(pdfText(`Estimate Date: ${dateEl.value || '-'}`), { x: MARGIN, y: 584, size: 10, font: regular, color: fg });
        page.drawText(pdfText(`Valid Until: ${validEl.value || '-'}`), { x: 320, y: 584, size: 10, font: regular, color: fg });

        let y = 548;
        const project = cleanText(projectEl.value);
        if (project) {
          page.drawText('Project Scope', { x: MARGIN, y, size: 10, font: bold, color: muted });
          y = drawWrapped(page, project, MARGIN, y - 18, 500, regular, 10, fg) - 12;
        }

        const drawTableHead = () => {
          page.drawLine({ start: { x: MARGIN, y: y + 18 }, end: { x: 547, y: y + 18 }, thickness: 1, color: line });
          page.drawText('Item', { x: MARGIN, y, size: 10, font: bold, color: muted });
          page.drawText('Qty', { x: 330, y, size: 10, font: bold, color: muted });
          page.drawText('Rate', { x: 390, y, size: 10, font: bold, color: muted });
          page.drawText('Amount', { x: 482, y, size: 10, font: bold, color: muted });
          page.drawLine({ start: { x: MARGIN, y: y - 8 }, end: { x: 547, y: y - 8 }, thickness: 1, color: line });
          y -= 28;
        };

        drawTableHead();
        for (const item of items) {
          if (y < 130) {
            page = pdf.addPage([PAGE.width, PAGE.height]);
            y = 760;
            drawTableHead();
          }
          const lines = wrapText(item.name, 250, regular, 10);
          const rowHeight = Math.max(22, lines.length * 14);
          lines.forEach((text, index) => page.drawText(pdfText(text), { x: MARGIN, y: y - index * 14, size: 10, font: regular, color: fg }));
          page.drawText(pdfText(String(item.qty)), { x: 330, y, size: 10, font: regular, color: fg });
          page.drawText(pdfText(money(item.price, symbol)), { x: 390, y, size: 10, font: regular, color: fg });
          page.drawText(pdfText(money(item.qty * item.price, symbol)), { x: 482, y, size: 10, font: regular, color: fg });
          y -= rowHeight;
          page.drawLine({ start: { x: MARGIN, y: y + 7 }, end: { x: 547, y: y + 7 }, thickness: 0.5, color: line });
        }

        y -= 12;
        const summaryX = 350;
        const amountX = 482;
        const drawSummary = (label, value, strong = false) => {
          page.drawText(pdfText(label), { x: summaryX, y, size: strong ? 12 : 10, font: strong ? bold : regular, color: strong ? fg : muted });
          page.drawText(pdfText(value), { x: amountX, y, size: strong ? 12 : 10, font: strong ? bold : regular, color: fg });
          y -= strong ? 20 : 16;
        };
        if (y < 160) {
          page = pdf.addPage([PAGE.width, PAGE.height]);
          y = 760;
        }
        drawSummary('Subtotal', money(total.subtotal, symbol));
        if (total.discount > 0) drawSummary('Discount', `-${money(total.discount, symbol)}`);
        if (total.tax > 0) drawSummary(`Tax (${safeNumber(taxEl.value).toFixed(2)}%)`, money(total.tax, symbol));
        page.drawLine({ start: { x: summaryX, y: y + 4 }, end: { x: 547, y: y + 4 }, thickness: 1, color: line });
        drawSummary('Estimate Total', money(total.total, symbol), true);
        if (total.deposit > 0) drawSummary(`Deposit (${safeNumber(depositEl.value).toFixed(2)}%)`, money(total.deposit, symbol));

        const notes = cleanText(notesEl.value);
        if (notes) {
          y -= 10;
          if (y < 120) {
            page = pdf.addPage([PAGE.width, PAGE.height]);
            y = 760;
          }
          page.drawText('Terms / Notes', { x: MARGIN, y, size: 10, font: bold, color: muted });
          drawWrapped(page, notes, MARGIN, y - 18, 500, regular, 10, fg);
        }

        const pdfBytes = await pdf.save();
        FileHelper.downloadBlob(estimateFilename(numberEl.value), new Blob([pdfBytes], { type: 'application/pdf' }));
        UI.showSuccess('Estimate PDF downloaded.');
      } catch (error) {
        console.error(error);
        UI.showError(error.message || 'Failed to generate estimate.');
      } finally {
        UI.setLoading(btnPdf, false, 'Download Estimate PDF');
      }
    };

    document.getElementById('btn-quote-add').onclick = addItem;
    document.getElementById('btn-quote-sample').onclick = sample;
    document.getElementById('btn-quote-clear-items').onclick = () => { items = []; render(); };
    document.getElementById('btn-quote-copy').onclick = () => {
      if (!items.length) return UI.showError('Add at least one item first.');
      navigator.clipboard.writeText(summary()).then(() => UI.showSuccess('Estimate summary copied.')).catch(() => UI.showError('Copy failed.'));
    };
    btnPdf.onclick = generatePdf;
    [itemEl, qtyEl, priceEl].forEach(el => {
      el.addEventListener('keydown', event => {
        if (event.key === 'Enter') addItem();
      });
    });
    [currencyEl, taxEl, discountEl, depositEl].forEach(el => el.addEventListener('input', render));
    render();
  },
};
