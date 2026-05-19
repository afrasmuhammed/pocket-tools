/* PocketKit atoms: icons, data, small components.
 * Exports to window so artboard scripts can use them. */

// —— Icons (line, 18px) ——————————————————————————————————

const SvgIcon = ({ d, size = 16, stroke = 1.5, fill = "none", children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
       stroke="currentColor" strokeWidth={stroke}
       strokeLinecap="round" strokeLinejoin="round">
    {children || <path d={d} />}
  </svg>
);

const Icons = {
  qr: () => (<SvgIcon><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v1"/></SvgIcon>),
  image: () => (<SvgIcon><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/></SvgIcon>),
  pdf: () => (<SvgIcon><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></SvgIcon>),
  text: () => (<SvgIcon><path d="M4 6h16M4 12h10M4 18h16"/></SvgIcon>),
  timer: () => (<SvgIcon><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/></SvgIcon>),
  calendar: () => (<SvgIcon><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></SvgIcon>),
  key: () => (<SvgIcon><circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M16 7l3 3"/></SvgIcon>),
  ruler: () => (<SvgIcon><path d="M3 17 17 3l4 4L7 21l-4-4z"/><path d="M7 13l2 2M11 9l2 2M15 5l2 2"/></SvgIcon>),
  percent: () => (<SvgIcon><path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/></SvgIcon>),
  split: () => (<SvgIcon><path d="M6 3v6a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3M12 15v6"/></SvgIcon>),
  dice: () => (<SvgIcon><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/></SvgIcon>),
  signature: () => (<SvgIcon><path d="M3 18s2-1 4-3 3-5 5-5 2 4 4 4 5-3 5-3"/><path d="M3 21h18"/></SvgIcon>),
  merge: () => (<SvgIcon><path d="M8 3v6M16 3v6M5 9h14M12 9v12"/></SvgIcon>),
  compress: () => (<SvgIcon><path d="M9 9 4 4M4 9V4h5M15 9l5-5M20 9V4h-5M9 15l-5 5M4 15v5h5M15 15l5 5M20 15v5h-5"/></SvgIcon>),
  lock: () => (<SvgIcon><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></SvgIcon>),
  unlock: () => (<SvgIcon><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7-2"/></SvgIcon>),
  rotate: () => (<SvgIcon><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></SvgIcon>),
  hash: () => (<SvgIcon><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/></SvgIcon>),
  braces: () => (<SvgIcon><path d="M8 3H6a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2M16 3h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2"/></SvgIcon>),
  code: () => (<SvgIcon><path d="m9 18-6-6 6-6M15 6l6 6-6 6"/></SvgIcon>),
  regex: () => (<SvgIcon><path d="M17 3v8M13 5l8 4M13 9l8-4"/><circle cx="6" cy="18" r="2"/><path d="M3 14h6"/></SvgIcon>),
  link: () => (<SvgIcon><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2"/></SvgIcon>),
  globe: () => (<SvgIcon><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18"/></SvgIcon>),
  meta: () => (<SvgIcon><path d="M4 4h16v6H4zM4 14h10v6H4z"/></SvgIcon>),
  cart: () => (<SvgIcon><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l2.5 11h10L20 7H6"/></SvgIcon>),
  receipt: () => (<SvgIcon><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2zM9 8h6M9 12h6M9 16h4"/></SvgIcon>),
  invoice: () => (<SvgIcon><rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 8h6M9 12h6M9 16h3"/></SvgIcon>),
  vat: () => (<SvgIcon><path d="M5 12h14M12 5v14"/></SvgIcon>),
  user: () => (<SvgIcon><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></SvgIcon>),
  uuid: () => (<SvgIcon><path d="M3 7h18M3 12h18M3 17h18" strokeDasharray="3 2"/></SvgIcon>),
  bug: () => (<SvgIcon><rect x="6" y="8" width="12" height="12" rx="6"/><path d="M9 6 7 4M15 6l2-2M3 12h3M18 12h3M3 18h3M18 18h3"/></SvgIcon>),
  search: () => (<SvgIcon><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></SvgIcon>),
  arrow: () => (<SvgIcon><path d="M5 12h14M13 6l6 6-6 6"/></SvgIcon>),
  pin: () => (<SvgIcon><path d="M12 2v8M8 10h8l-2 5h-4zM12 15v6"/></SvgIcon>),
  copy: () => (<SvgIcon><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></SvgIcon>),
  download: () => (<SvgIcon><path d="M12 3v12M6 11l6 6 6-6M4 21h16"/></SvgIcon>),
  install: () => (<SvgIcon><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v6M9 12l3 3 3-3"/></SvgIcon>),
  offline: () => (<SvgIcon><path d="M3 12a9 9 0 0 1 18 0M7 16a5 5 0 0 1 10 0M11 20h2"/></SvgIcon>),
  shield: () => (<SvgIcon><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/></SvgIcon>),
  bolt: () => (<SvgIcon><path d="M13 3 4 14h7l-1 7 9-11h-7z"/></SvgIcon>),
  layers: () => (<SvgIcon><path d="m12 3 9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5"/></SvgIcon>),
  yaml: () => (<SvgIcon><path d="M4 6h6l2 4-2 4H4M20 6h-6v12"/></SvgIcon>),
  csv: () => (<SvgIcon><path d="M4 4h16v16H4zM4 9h16M9 4v16M14 4v16"/></SvgIcon>),
  jwt: () => (<SvgIcon><path d="M12 2v6M16 4l-2 4M8 4l2 4M2 12h6M4 8l4 2M4 16l4-2M22 12h-6M20 8l-4 2M20 16l-4-2M12 22v-6M16 20l-2-4M8 20l2-4"/></SvgIcon>),
  cron: () => (<SvgIcon><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></SvgIcon>),
  md: () => (<SvgIcon><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 15V9l2 3 2-3v6M14 9v6M14 13l3 3 3-3"/></SvgIcon>),
  palette: () => (<SvgIcon><path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-3 1-2 2-2h2a4 4 0 0 0 4-4 9 9 0 0 0-9-7"/><circle cx="7" cy="11" r="1" fill="currentColor"/><circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/></SvgIcon>),
  crop: () => (<SvgIcon><path d="M6 2v16h16M22 6H8v14"/></SvgIcon>),
  brush: () => (<SvgIcon><path d="M9 11 19 1l4 4-10 10zM4 16l4 4M3 21l5-5"/></SvgIcon>),
  watermark: () => (<SvgIcon><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 14h10M7 17h6"/></SvgIcon>),
  sticker: () => (<SvgIcon><path d="M3 3h12l6 6v12H3zM15 3v6h6"/></SvgIcon>),
  bw: () => (<SvgIcon><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/></SvgIcon>),
  resize: () => (<SvgIcon><rect x="3" y="3" width="14" height="14" rx="1"/><path d="M21 9v12H9M17 17l4 4"/></SvgIcon>),
  rename: () => (<SvgIcon><path d="M14 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2M10 4 4 4v16h6M7 8v8M9 8l-4 4 4 4"/></SvgIcon>),
  picker: () => (<SvgIcon><path d="M15 5 9 11l-4 1-1 4 4-1 6-6zM14 6l4 4M16 4l4 4-2 2-4-4z"/></SvgIcon>),
  shop: () => (<SvgIcon><path d="M3 9 5 4h14l2 5M3 9v10h18V9M3 9h18M9 13h6"/></SvgIcon>),
  external: () => (<SvgIcon><path d="M7 17 17 7M9 7h8v8"/></SvgIcon>),
  check: () => (<SvgIcon><path d="m5 12 5 5L20 7"/></SvgIcon>),
  plus: () => (<SvgIcon><path d="M12 5v14M5 12h14"/></SvgIcon>),
  more: () => (<SvgIcon><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/></SvgIcon>),
  star: () => (<SvgIcon><path d="m12 3 2.8 6 6.6.8-4.9 4.6 1.4 6.6L12 17.8 6.1 21l1.4-6.6L2.6 9.8 9.2 9z"/></SvgIcon>),
  sparkle: () => (<SvgIcon><path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3"/></SvgIcon>),
  homeT: () => (<SvgIcon><path d="M3 11 12 3l9 8v10H3z"/><path d="M9 21V12h6v9"/></SvgIcon>),
  grid: () => (<SvgIcon><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></SvgIcon>),
  inbox: () => (<SvgIcon><path d="M3 12h6l2 3h2l2-3h6M3 12l3-8h12l3 8v8H3z"/></SvgIcon>),
  cog: () => (<SvgIcon><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M22 12h-3M5 12H2M19 5l-2 2M7 17l-2 2M19 19l-2-2M7 7 5 5"/></SvgIcon>),
};

// —— Pocket marks (small geometric, one per pocket) ——————————

const PocketMark = ({ kind, size = 18 }) => {
  const s = size;
  switch (kind) {
    case 'daily':
      return (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="4" r="1.6"/><circle cx="12" cy="20" r="1.6"/><circle cx="4" cy="12" r="1.6"/><circle cx="20" cy="12" r="1.6"/></svg>);
    case 'pdf':
      return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v3h3"/><path d="M9 12h6M9 16h4"/></svg>);
    case 'image':
      return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2" fill="currentColor"/><path d="m21 16-5-5-9 9"/></svg>);
    case 'developer':
      return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18-6-6 6-6M15 6l6 6-6 6"/></svg>);
    case 'qa':
      return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m4 13 4 4 12-12"/></svg>);
    case 'seo':
      return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>);
    case 'shop':
      return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="M4 8h16l-1.5 12H5.5zM8 8V6a4 4 0 0 1 8 0v2"/></svg>);
  }
  return null;
};

// —— Data —————————————————————————————————————————

const POCKETS = [
  {
    id: 'daily', name: 'PocketKit Daily', access: 'free',
    desc: 'Everyday tools for quick private work.',
    accent: 'oklch(0.55 0.06 165)',
    featured: ['QR code', 'Image compressor', 'Password generator', 'Merge PDF', 'Pomodoro'],
    count: 15,
  },
  {
    id: 'pdf', name: 'PocketKit PDF', access: 'pro',
    desc: 'Document workflows. Compress, merge, split, protect.',
    accent: 'oklch(0.5 0.08 30)',
    featured: ['Compress PDF', 'Merge PDF', 'Split PDF', 'Password protect', 'Page numberer'],
    count: 12,
  },
  {
    id: 'image', name: 'PocketKit Image', access: 'pro',
    desc: 'Processing and resizing for creators and stores.',
    accent: 'oklch(0.5 0.09 280)',
    featured: ['Compressor', 'Social resizer', 'Aspect crop', 'Watermark', 'Bulk rename'],
    count: 9,
  },
  {
    id: 'developer', name: 'PocketKit Developer', access: 'pro',
    desc: 'Format, encode, decode, hash, debug — all in the browser.',
    accent: 'oklch(0.5 0.08 240)',
    featured: ['JSON formatter', 'Base64', 'JWT decoder', 'Hash generator', 'Cron explainer'],
    count: 16,
  },
  {
    id: 'qa', name: 'PocketKit QA', access: 'pro',
    desc: 'Daily testing utilities for QA people and teams.',
    accent: 'oklch(0.5 0.08 200)',
    featured: ['Dummy users', 'UUID', 'Regex tester', 'API beautifier', 'Bug report formatter'],
    count: 11,
  },
  {
    id: 'seo', name: 'PocketKit SEO', access: 'pro',
    desc: 'Offline SEO preparation and previews for content shipping.',
    accent: 'oklch(0.5 0.08 120)',
    featured: ['Meta tags', 'OG preview', 'Slug generator', 'Robots.txt', 'Sitemap formatter'],
    count: 7,
  },
  {
    id: 'shop', name: 'PocketKit Shop', access: 'pro',
    desc: 'Small business utilities — invoices, receipts, VAT.',
    accent: 'oklch(0.5 0.08 60)',
    featured: ['Invoice', 'Receipt enhancer', 'VAT', 'Grocery calc', 'QR code'],
    count: 5,
  },
];

const TOOL_LIB = {
  // Daily
  qr:        { name: 'QR Code Generator',     icon: 'qr',        cat: 'Generators',  pocket: 'daily', access: 'free' },
  imgc:      { name: 'Image Compressor',      icon: 'image',     cat: 'Images',      pocket: 'daily', access: 'free' },
  imgfmt:    { name: 'Image Format Converter',icon: 'image',     cat: 'Images',      pocket: 'daily', access: 'free' },
  mergepdf:  { name: 'Merge PDF',             icon: 'merge',     cat: 'PDF',         pocket: 'daily', access: 'free' },
  comppdf:   { name: 'Compress PDF',          icon: 'compress',  cat: 'PDF',         pocket: 'daily', access: 'free' },
  wc:        { name: 'Word & Char Counter',   icon: 'text',      cat: 'Text',        pocket: 'daily', access: 'free' },
  cc:        { name: 'Character Counter',     icon: 'text',      cat: 'Text',        pocket: 'daily', access: 'free' },
  pomo:      { name: 'Pomodoro Timer',        icon: 'timer',     cat: 'Time',        pocket: 'daily', access: 'free' },
  daysbtw:   { name: 'Days Between Dates',    icon: 'calendar',  cat: 'Time',        pocket: 'daily', access: 'free' },
  pwd:       { name: 'Password Generator',    icon: 'key',       cat: 'Generators',  pocket: 'daily', access: 'free' },
  units:     { name: 'Unit Converter',        icon: 'ruler',     cat: 'Math',        pocket: 'daily', access: 'free' },
  discount:  { name: 'Discount Calculator',   icon: 'percent',   cat: 'Math',        pocket: 'daily', access: 'free' },
  split:     { name: 'Bill Splitter',         icon: 'split',     cat: 'Math',        pocket: 'daily', access: 'free' },
  random:    { name: 'Random Decision',       icon: 'dice',      cat: 'Generators',  pocket: 'daily', access: 'free' },
  sig:       { name: 'Signature to PNG',      icon: 'signature', cat: 'Images',      pocket: 'daily', access: 'free' },

  // PDF Pro extras
  splitpdf:  { name: 'Split PDF',             icon: 'split',     cat: 'PDF', pocket: 'pdf', access: 'pro' },
  pwdpdf:    { name: 'Password Protect PDF',  icon: 'lock',      cat: 'PDF', pocket: 'pdf', access: 'pro' },
  unpwdpdf:  { name: 'Unprotect PDF',         icon: 'unlock',    cat: 'PDF', pocket: 'pdf', access: 'pro' },
  rotpdf:    { name: 'Rotate PDF',            icon: 'rotate',    cat: 'PDF', pocket: 'pdf', access: 'pro' },
  pagepdf:   { name: 'PDF Page Numberer',     icon: 'hash',      cat: 'PDF', pocket: 'pdf', access: 'pro' },
  extrpdf:   { name: 'Extract PDF Text',      icon: 'text',      cat: 'PDF', pocket: 'pdf', access: 'pro' },
  idmask:    { name: 'ID Masker',             icon: 'shield',    cat: 'PDF', pocket: 'pdf', access: 'pro' },
  inv:       { name: 'Invoice Generator',     icon: 'invoice',   cat: 'PDF', pocket: 'pdf', access: 'pro' },
  rcpt:      { name: 'Receipt Enhancer',      icon: 'receipt',   cat: 'PDF', pocket: 'pdf', access: 'pro' },
  phtopdf:   { name: 'Photo to PDF',          icon: 'pdf',       cat: 'PDF', pocket: 'pdf', access: 'pro' },

  // Developer
  json:      { name: 'JSON Formatter',        icon: 'braces',    cat: 'Format',  pocket: 'developer', access: 'pro' },
  xml:       { name: 'XML Formatter',         icon: 'code',      cat: 'Format',  pocket: 'developer', access: 'pro' },
  yaml:      { name: 'YAML ⇄ JSON',           icon: 'yaml',      cat: 'Format',  pocket: 'developer', access: 'pro' },
  csv:       { name: 'CSV ⇄ JSON',            icon: 'csv',       cat: 'Format',  pocket: 'developer', access: 'pro' },
  b64:       { name: 'Base64 Encode/Decode',  icon: 'code',      cat: 'Encode',  pocket: 'developer', access: 'pro' },
  urle:      { name: 'URL Encode/Decode',     icon: 'link',      cat: 'Encode',  pocket: 'developer', access: 'pro' },
  htmle:     { name: 'HTML Entities',         icon: 'code',      cat: 'Encode',  pocket: 'developer', access: 'pro' },
  hash:      { name: 'Hash Generator',        icon: 'hash',      cat: 'Crypto',  pocket: 'developer', access: 'pro' },
  hmac:      { name: 'HMAC Generator',        icon: 'shield',    cat: 'Crypto',  pocket: 'developer', access: 'pro' },
  jwt:       { name: 'JWT Decoder',           icon: 'jwt',       cat: 'Crypto',  pocket: 'developer', access: 'pro' },
  cron:      { name: 'Cron Explainer',        icon: 'cron',      cat: 'Format',  pocket: 'developer', access: 'pro' },
  md:        { name: 'Markdown Previewer',    icon: 'md',        cat: 'Text',    pocket: 'developer', access: 'pro' },
  lorem:     { name: 'Lorem Ipsum Generator', icon: 'text',      cat: 'Text',    pocket: 'developer', access: 'pro' },
  palette:   { name: 'Color Palette Extract', icon: 'palette',   cat: 'Design',  pocket: 'developer', access: 'pro' },

  // QA
  dummy:     { name: 'Dummy User Generator',  icon: 'user',      cat: 'Mock', pocket: 'qa', access: 'pro' },
  addr:      { name: 'Random Address',        icon: 'globe',     cat: 'Mock', pocket: 'qa', access: 'pro' },
  uuid:      { name: 'UUID Generator',        icon: 'uuid',      cat: 'Mock', pocket: 'qa', access: 'pro' },
  regex:     { name: 'Regex Tester',          icon: 'regex',     cat: 'Test', pocket: 'qa', access: 'pro' },
  api:       { name: 'API Response Beautify', icon: 'braces',    cat: 'Test', pocket: 'qa', access: 'pro' },
  ts:        { name: 'Timestamp Converter',   icon: 'cron',      cat: 'Test', pocket: 'qa', access: 'pro' },
  bug:       { name: 'Bug Report Formatter',  icon: 'bug',       cat: 'Test', pocket: 'qa', access: 'pro' },
  testcase:  { name: 'Test Case Formatter',   icon: 'text',      cat: 'Test', pocket: 'qa', access: 'pro' },

  // SEO
  metat:     { name: 'Meta Tag Generator',    icon: 'meta',      cat: 'SEO', pocket: 'seo', access: 'pro' },
  og:        { name: 'OpenGraph Preview',     icon: 'image',     cat: 'SEO', pocket: 'seo', access: 'pro' },
  slug:      { name: 'Slug Generator',        icon: 'link',      cat: 'SEO', pocket: 'seo', access: 'pro' },
  kw:        { name: 'Keyword Density',       icon: 'hash',      cat: 'SEO', pocket: 'seo', access: 'pro' },
  sm:        { name: 'Sitemap Formatter',     icon: 'globe',     cat: 'SEO', pocket: 'seo', access: 'pro' },
  rob:       { name: 'Robots.txt Generator',  icon: 'shield',    cat: 'SEO', pocket: 'seo', access: 'pro' },
  canon:     { name: 'Canonical URL',         icon: 'link',      cat: 'SEO', pocket: 'seo', access: 'pro' },

  // Shop
  vat:       { name: 'VAT Calculator',        icon: 'percent',   cat: 'Shop', pocket: 'shop', access: 'pro' },
  groc:      { name: 'Grocery Calculator',    icon: 'cart',      cat: 'Shop', pocket: 'shop', access: 'pro' },
};

// —— Small atoms ——————————————————————————————————

const Tool = ({ id, locked }) => {
  const t = TOOL_LIB[id];
  if (!t) return null;
  const Icon = Icons[t.icon] || Icons.text;
  return (
    <div className={"pk-tool" + (locked ? " pk-tool-locked" : "")}>
      <div className="pk-tool-icon"><Icon /></div>
      <div className="pk-tool-body">
        <div className="pk-tool-name">{t.name}</div>
        <div className="pk-tool-meta">{t.cat}</div>
      </div>
      {locked && <div style={{color: 'var(--ink-3)'}}><Icons.lock /></div>}
    </div>
  );
};

const Badge = ({ access }) => {
  if (access === 'free') return <span className="pk-badge pk-badge-free">Free</span>;
  if (access === 'pro')  return <span className="pk-badge pk-badge-pro">Pro</span>;
  return null;
};

const Topbar = ({ active = 'home', search = true }) => (
  <div className="pk-topbar">
    <div className="pk-brand">
      <div className="pk-brand-mark"></div>
      <span>PocketKit</span>
    </div>
    <div className="pk-nav">
      <a className={active === 'home' ? 'is-active' : ''}>Home</a>
      <a className={active === 'pockets' ? 'is-active' : ''}>Pockets</a>
      <a className={active === 'all' ? 'is-active' : ''}>All tools</a>
    </div>
    <div className="pk-topbar-right">
      {search && (
        <div className="pk-search">
          <Icons.search />
          <span>Search tools</span>
          <kbd>⌘ K</kbd>
        </div>
      )}
      <button className="pk-btn pk-btn-sm"><Icons.install /> Install</button>
    </div>
  </div>
);

Object.assign(window, {
  Icons, PocketMark, POCKETS, TOOL_LIB, Tool, Badge, Topbar,
});
