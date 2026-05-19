const SAMPLE = {
  title: 'Pocket Tools - Everyday tools, done right.',
  description: 'A focused workspace for images, documents, text, dates, and everyday calculations.',
  url: 'https://afrasmuhammed.github.io/pocket-tools/',
  image: 'https://afrasmuhammed.github.io/pocket-tools/assets/og-image.png',
};

function domainFromUrl(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return value.trim() ? value.trim().replace(/^https?:\/\//, '').split('/')[0] : 'example.com';
  }
}

export default {
  init() {
    const titleEl = document.getElementById('og-title');
    const descEl = document.getElementById('og-description');
    const urlEl = document.getElementById('og-url');
    const imageEl = document.getElementById('og-image');
    const imagePreview = document.getElementById('og-image-preview');
    const domainEl = document.getElementById('og-domain');
    const titlePreview = document.getElementById('og-title-preview');
    const descPreview = document.getElementById('og-description-preview');
    const titleCount = document.getElementById('og-title-count');
    const descCount = document.getElementById('og-desc-count');

    const render = () => {
      const title = titleEl.value.trim();
      const desc = descEl.value.trim();
      const image = imageEl.value.trim();

      titlePreview.textContent = title || 'Preview title';
      descPreview.textContent = desc || 'Preview description will appear here.';
      domainEl.textContent = domainFromUrl(urlEl.value);
      titleCount.textContent = String(title.length);
      descCount.textContent = String(desc.length);

      imagePreview.textContent = image ? '' : 'Image preview';
      imagePreview.style.backgroundImage = image ? `url("${image.replace(/"/g, '%22')}")` : '';
    };

    document.getElementById('btn-og-sample').onclick = () => {
      titleEl.value = SAMPLE.title;
      descEl.value = SAMPLE.description;
      urlEl.value = SAMPLE.url;
      imageEl.value = SAMPLE.image;
      render();
    };

    document.getElementById('btn-og-clear').onclick = () => {
      [titleEl, descEl, urlEl, imageEl].forEach(el => { el.value = ''; });
      render();
    };

    [titleEl, descEl, urlEl, imageEl].forEach(el => el.addEventListener('input', render));
    render();
  },
};
