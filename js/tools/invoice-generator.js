import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { loadPdfLib } from '../core/lazy.js';

const PAGE = { width: 595.28, height: 841.89 };
const MARGIN = 48;

function today() {
  return localDateString(new Date());
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return localDateString(next);
}

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

function invoiceFilename(number) {
  const safe = String(number || 'invoice').trim().replace(/[^a-z0-9-]+/gi, '-').replace(/^-+|-+$/g, '');
  return `${safe || 'invoice'}.pdf`;
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
      if (font.widthOfTextAtSize(word, size) <= maxWidth) {
        line = word;
      } else {
        let chunk = '';
        for (const char of word) {
          const nextChunk = chunk + char;
          if (font.widthOfTextAtSize(nextChunk, size) <= maxWidth) {
            chunk = nextChunk;
          } else {
            if (chunk) lines.push(chunk);
            chunk = char;
          }
        }
        line = chunk;
      }
    }
  }

  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function drawWrapped(page, text, x, y, maxWidth, font, size, color, lineGap = 4) {
  const rawLines = pdfText(text).split('\n');
  let cursor = y;
  for (const rawLine of rawLines) {
    const lines = wrapText(rawLine, maxWidth, font, size);
    for (const line of lines) {
      page.drawText(line, { x, y: cursor, size, font, color });
      cursor -= size + lineGap;
    }
  }
  return cursor;
}

function totals(items, taxRate, discount) {
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const boundedDiscount = Math.min(Math.max(discount, 0), subtotal);
  const taxable = Math.max(subtotal - boundedDiscount, 0);
  const tax = taxable * Math.max(taxRate, 0) / 100;
  return { subtotal, discount: boundedDiscount, tax, total: taxable + tax };
}

export default {
  init() {
    const companyEl = document.getElementById('inv-company');
    const clientEl = document.getElementById('inv-client');
    const numberEl = document.getElementById('inv-number');
    const dateEl = document.getElementById('inv-date');
    const dueEl = document.getElementById('inv-due');
    const currencyEl = document.getElementById('inv-currency');
    const itemEl = document.getElementById('inv-item');
    const qtyEl = document.getElementById('inv-qty');
    const priceEl = document.getElementById('inv-price');
    const taxEl = document.getElementById('inv-tax');
    const discountEl = document.getElementById('inv-discount');
    const notesEl = document.getElementById('inv-notes');
    const btnAdd = document.getElementById('inv-add');
    const btnClear = document.getElementById('inv-clear');
    const btnGenerate = document.getElementById('inv-generate');
    const countEl = document.getElementById('inv-count');
    const subtotalEl = document.getElementById('inv-subtotal');
    const totalEl = document.getElementById('inv-total');
    const listEl = document.getElementById('inv-list');

    dateEl.value = today();
    dueEl.value = addDays(new Date(), 14);
    numberEl.value = `INV-${new Date().getFullYear()}-001`;

    let items = [];

    const render = () => {
      const symbol = currencyEl.value;
      const calc = totals(items, safeNumber(taxEl.value), safeNumber(discountEl.value));
      countEl.textContent = String(items.length);
      subtotalEl.textContent = money(calc.subtotal, symbol);
      totalEl.textContent = money(calc.total, symbol);

      listEl.replaceChildren();
      if (!items.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'No invoice items added yet.';
        listEl.appendChild(empty);
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
        remove.onclick = () => {
          items.splice(index, 1);
          render();
        };

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

    const generatePdf = async () => {
      if (!items.length) return UI.showError('Add at least one invoice item.');
      if (!cleanText(companyEl.value)) return UI.showError('Enter sender details.');
      if (!cleanText(clientEl.value)) return UI.showError('Enter client details.');

      UI.setLoading(btnGenerate, true, 'Download Invoice PDF');
      try {
        const { PDFDocument, StandardFonts, rgb } = await loadPdfLib();
        const pdf = await PDFDocument.create();
        let page = pdf.addPage([PAGE.width, PAGE.height]);
        const regular = await pdf.embedFont(StandardFonts.Helvetica);
        const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
        const fg = rgb(0.11, 0.11, 0.13);
        const muted = rgb(0.38, 0.38, 0.43);
        const line = rgb(0.82, 0.82, 0.86);
        const accent = rgb(0.05, 0.45, 0.55);
        const symbol = currencyEl.value;
        const taxRate = safeNumber(taxEl.value);
        const discount = safeNumber(discountEl.value);
        const calc = totals(items, taxRate, discount);

        const drawHeader = () => {
          page.drawText('INVOICE', { x: MARGIN, y: 770, size: 30, font: bold, color: fg });
          page.drawText(pdfText(numberEl.value.trim() || 'Invoice'), { x: MARGIN, y: 742, size: 11, font: regular, color: muted });
          page.drawText('Total Due', { x: 420, y: 772, size: 10, font: regular, color: muted });
          page.drawText(money(calc.total, symbol), { x: 420, y: 746, size: 22, font: bold, color: accent });
          page.drawLine({ start: { x: MARGIN, y: 720 }, end: { x: 547, y: 720 }, thickness: 1, color: line });
        };

        drawHeader();
        page.drawText('From', { x: MARGIN, y: 690, size: 10, font: bold, color: muted });
        drawWrapped(page, cleanText(companyEl.value), MARGIN, 672, 220, regular, 10, fg);
        page.drawText('Bill To', { x: 320, y: 690, size: 10, font: bold, color: muted });
        drawWrapped(page, cleanText(clientEl.value), 320, 672, 220, regular, 10, fg);

        page.drawText(pdfText(`Invoice Date: ${dateEl.value || '-'}`), { x: MARGIN, y: 584, size: 10, font: regular, color: fg });
        page.drawText(pdfText(`Due Date: ${dueEl.value || '-'}`), { x: 320, y: 584, size: 10, font: regular, color: fg });

        let y = 540;
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
          if (y < 120) {
            page = pdf.addPage([PAGE.width, PAGE.height]);
            y = 760;
            drawTableHead();
          }

          const nameLines = wrapText(item.name, 250, regular, 10);
          const rowHeight = Math.max(22, nameLines.length * 14);
          nameLines.forEach((text, i) => {
            page.drawText(pdfText(text), { x: MARGIN, y: y - i * 14, size: 10, font: regular, color: fg });
          });
          page.drawText(pdfText(String(item.qty)), { x: 330, y, size: 10, font: regular, color: fg });
          page.drawText(pdfText(money(item.price, symbol)), { x: 390, y, size: 10, font: regular, color: fg });
          page.drawText(pdfText(money(item.qty * item.price, symbol)), { x: 482, y, size: 10, font: regular, color: fg });
          y -= rowHeight;
          page.drawLine({ start: { x: MARGIN, y: y + 7 }, end: { x: 547, y: y + 7 }, thickness: 0.5, color: line });
        }

        y -= 10;
        const summaryX = 365;
        const amountX = 482;
        const drawSummary = (label, value, strong = false) => {
          page.drawText(pdfText(label), { x: summaryX, y, size: strong ? 12 : 10, font: strong ? bold : regular, color: strong ? fg : muted });
          page.drawText(pdfText(value), { x: amountX, y, size: strong ? 12 : 10, font: strong ? bold : regular, color: strong ? fg : fg });
          y -= strong ? 20 : 16;
        };

        if (y < 150) {
          page = pdf.addPage([PAGE.width, PAGE.height]);
          y = 760;
        }

        drawSummary('Subtotal', money(calc.subtotal, symbol));
        if (calc.discount > 0) drawSummary('Discount', `-${money(calc.discount, symbol)}`);
        if (calc.tax > 0) drawSummary(`Tax (${Math.max(taxRate, 0).toFixed(2)}%)`, money(calc.tax, symbol));
        page.drawLine({ start: { x: summaryX, y: y + 4 }, end: { x: 547, y: y + 4 }, thickness: 1, color: line });
        drawSummary('Total', money(calc.total, symbol), true);

        const notes = cleanText(notesEl.value);
        if (notes) {
          y -= 12;
          if (y < 120) {
            page = pdf.addPage([PAGE.width, PAGE.height]);
            y = 760;
          }
          page.drawText('Notes', { x: MARGIN, y, size: 10, font: bold, color: muted });
          drawWrapped(page, notes, MARGIN, y - 18, 500, regular, 10, fg);
        }

        const pdfBytes = await pdf.save();
        FileHelper.downloadBlob(invoiceFilename(numberEl.value), new Blob([pdfBytes], { type: 'application/pdf' }));
        UI.showSuccess('Invoice PDF downloaded.');
      } catch (err) {
        console.error(err);
        UI.showError(err.message || 'Failed to generate invoice.');
      } finally {
        UI.setLoading(btnGenerate, false, 'Download Invoice PDF');
      }
    };

    btnAdd.onclick = addItem;
    btnClear.onclick = () => { items = []; render(); };
    btnGenerate.onclick = generatePdf;

    [itemEl, qtyEl, priceEl].forEach(el => {
      el.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') addItem();
      });
    });
    [currencyEl, taxEl, discountEl].forEach(el => el.addEventListener('input', render));

    render();
  },
};
