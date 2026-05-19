/* PocketKit v2 atoms — premium pocket marks, new POCKETS data,
 * updated tool library (adds Designer & Student pockets). Reuses
 * Icons from v1 atoms.jsx, adds a few new ones. */

// —— Extra icons —————————————————————————————————

const Icons2 = Object.assign({}, window.Icons || {}, {
  book: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2zM8 3v18"/></svg>),
  type: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6V4h16v2M9 4v16M9 20h6"/></svg>),
  contrast: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 3v18" fill="currentColor"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>),
  gradient: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="15" r="2"/><circle cx="15" cy="9" r="2"/></svg>),
  flash: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M8 14h8"/></svg>),
  gpa: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9 12 4l10 5-10 5z"/><path d="M6 11v5a6 4 0 0 0 12 0v-5"/></svg>),
  formula: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3 5 21M16 3l3 18M5 12h14"/></svg>),
  focus: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>),
  cite: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7v6a4 4 0 0 1-4 4M17 7v6a4 4 0 0 1-4 4"/></svg>),
  bag: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M4 8h16l-1.5 12H5.5zM8 8V6a4 4 0 0 1 8 0v2"/></svg>),
  install2: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 11l4 4 4-4M12 5v10"/></svg>),
  apple: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 12.5c0-2.6 2.1-3.8 2.2-3.9-1.2-1.7-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2.1-.9-3.4-.9-1.8 0-3.4 1-4.3 2.6-1.8 3.2-.5 7.9 1.3 10.5.9 1.3 1.9 2.7 3.3 2.7 1.3 0 1.8-.9 3.4-.9 1.6 0 2 .9 3.4.9 1.4 0 2.3-1.3 3.2-2.6.9-1.2 1.3-2.4 1.4-2.5-.1 0-2.9-1.1-2.9-4.4zM15 5.4c.7-.9 1.2-2.1 1.1-3.4-1 .1-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.3 1.2 0 2.3-.6 3-1.5z"/></svg>),
});

// —— Pocket marks (refined, each unique) ——————————————

const PocketMarkV2 = ({ kind, size = 18 }) => {
  const s = size;
  const sw = 1.7;
  switch (kind) {
    case 'daily':
      return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
        <circle cx="12" cy="4" r="1.4"/>
        <circle cx="12" cy="20" r="1.4"/>
        <circle cx="4" cy="12" r="1.4"/>
        <circle cx="20" cy="12" r="1.4"/>
        <circle cx="6" cy="6" r="1.1"/>
        <circle cx="18" cy="6" r="1.1"/>
        <circle cx="6" cy="18" r="1.1"/>
        <circle cx="18" cy="18" r="1.1"/>
      </svg>);
    case 'developer':
      return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 4 3 12l5 8M16 4l5 8-5 8"/>
        <path d="M14 4l-4 16" strokeOpacity=".55"/>
      </svg>);
    case 'designer':
      return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
        <circle cx="9" cy="9" r="5" fill="currentColor" fillOpacity=".22"/>
        <circle cx="15" cy="11" r="5" fill="currentColor" fillOpacity=".22"/>
        <circle cx="12" cy="16" r="5" fill="currentColor" fillOpacity=".22"/>
      </svg>);
    case 'seo':
      return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="6"/>
        <path d="m20 20-5-5"/>
        <path d="M7 11h2v2H7zM10 8h2v5h-2zM13 6h2v7h-2z" fill="currentColor" stroke="none"/>
      </svg>);
    case 'qa':
      return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="3"/>
        <path d="m7 12 3 3 7-7"/>
      </svg>);
    case 'student':
      return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6a2 2 0 0 1 2-2h6v17H5a2 2 0 0 1-2-2zM21 6a2 2 0 0 0-2-2h-6v17h6a2 2 0 0 0 2-2z"/>
        <path d="M6 8h2M6 11h2M16 8h2M16 11h2"/>
      </svg>);
    case 'shop':
      return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
        <path d="M5 8h14l-1.5 12h-11zM8 8V6a4 4 0 0 1 8 0v2"/>
        <circle cx="10" cy="13" r="1" fill="currentColor" stroke="none"/>
        <circle cx="14" cy="13" r="1" fill="currentColor" stroke="none"/>
      </svg>);
  }
  return null;
};

// —— Pockets v2 —————————————————————————————————

const POCKETS2 = [
  {
    id: 'daily', name: 'Daily', full: 'PocketKit Daily', access: 'free',
    desc: 'Everyday tools for quick private work.',
    promise: 'QR · compress · count · convert · calculate',
    featured: ['qr', 'imgc', 'pwd', 'mergepdf', 'pomo'],
    count: 15,
  },
  {
    id: 'developer', name: 'Developer', full: 'PocketKit Developer', access: 'pro',
    desc: 'Format, encode, decode, hash, debug — all locally.',
    promise: 'JSON · Base64 · JWT · regex · cron',
    featured: ['json', 'b64', 'jwt', 'regex', 'hash'],
    count: 15,
  },
  {
    id: 'designer', name: 'Designer', full: 'PocketKit Designer', access: 'pro',
    desc: 'Image, color, type and layout utilities for makers.',
    promise: 'Compress · crop · palette · contrast · scale',
    featured: ['imgc', 'crop', 'picker', 'palette', 'type'],
    count: 14,
  },
  {
    id: 'seo', name: 'SEO', full: 'PocketKit SEO', access: 'pro',
    desc: 'Offline SEO preparation and previews for content.',
    promise: 'Meta · OG · slug · sitemap · robots',
    featured: ['metat', 'og', 'slug', 'sm', 'rob'],
    count: 7,
  },
  {
    id: 'qa', name: 'QA', full: 'PocketKit QA', access: 'pro',
    desc: 'Daily testing utilities for QA people and teams.',
    promise: 'Mock users · UUID · regex · bug reports',
    featured: ['dummy', 'uuid', 'regex', 'bug', 'ts'],
    count: 11,
  },
  {
    id: 'student', name: 'Student', full: 'PocketKit Student', access: 'pro',
    desc: 'Focus, study and writing aids that respect your time.',
    promise: 'Cite · flashcards · GPA · focus timer · count',
    featured: ['cite', 'flash', 'gpa', 'focus', 'wc'],
    count: 10,
  },
  {
    id: 'shop', name: 'Shop', full: 'PocketKit Shop', access: 'pro',
    desc: 'Invoices, VAT, receipts — small business essentials.',
    promise: 'Invoice · receipt · VAT · QR · margin',
    featured: ['inv', 'rcpt', 'vat', 'qr', 'groc'],
    count: 8,
  },
];

// —— Tool library v2 ———————————————————————————————

const TOOLS2 = Object.assign({}, window.TOOL_LIB || {}, {
  // Designer pocket extras (some reused from v1 image pocket)
  type:      { name: 'Type Scale Builder',     icon: 'type',      cat: 'Type',   pocket: 'designer', access: 'pro' },
  contrast:  { name: 'Contrast Checker',       icon: 'contrast',  cat: 'Color',  pocket: 'designer', access: 'pro' },
  gradient:  { name: 'Gradient Maker',         icon: 'gradient',  cat: 'Color',  pocket: 'designer', access: 'pro' },
  framer:    { name: 'Mockup Framer',          icon: 'image',     cat: 'Image',  pocket: 'designer', access: 'pro' },

  // Student
  cite:      { name: 'Citation Generator',     icon: 'cite',      cat: 'Writing', pocket: 'student', access: 'pro' },
  flash:     { name: 'Flashcard Maker',        icon: 'flash',     cat: 'Study',   pocket: 'student', access: 'pro' },
  gpa:       { name: 'GPA Calculator',         icon: 'gpa',       cat: 'Math',    pocket: 'student', access: 'pro' },
  focus:     { name: 'Focus Timer',            icon: 'focus',     cat: 'Time',    pocket: 'student', access: 'pro' },
  formula:   { name: 'Formula Sheet',          icon: 'formula',   cat: 'Math',    pocket: 'student', access: 'pro' },
  outline:   { name: 'Outline Builder',        icon: 'text',      cat: 'Writing', pocket: 'student', access: 'pro' },
  rdtime:    { name: 'Reading Time',           icon: 'timer',     cat: 'Time',    pocket: 'student', access: 'pro' },

  // Shop additions
  margin:    { name: 'Margin Calculator',      icon: 'percent',   cat: 'Shop', pocket: 'shop', access: 'pro' },
  glabel:    { name: 'Product Label',          icon: 'invoice',   cat: 'Shop', pocket: 'shop', access: 'pro' },
});

// Patch the v1 image tools that are now in Designer
['imgc','imgfmt','crop','picker','palette','watermark','bw','sticker','rename','resize'].forEach(id => {
  if (TOOLS2[id]) TOOLS2[id] = Object.assign({}, TOOLS2[id], { pocket: 'designer' });
});
// resize was added in v1; make sure it has a designer pocket
TOOLS2.resize = TOOLS2.resize || { name: 'Social Media Resizer', icon: 'resize', cat: 'Image', pocket: 'designer', access: 'pro' };

// —— Atoms —————————————————————————————————————————

const PMark = ({ kind, size = 'md' }) => {
  const cls = "pk2-mark" + (size === 'lg' ? ' pk2-mark-lg' : size === 'sm' ? ' pk2-mark-sm' : '') + ` pk2-acc-${kind}`;
  const glyphSize = size === 'lg' ? 24 : size === 'sm' ? 14 : 18;
  return <div className={cls}><PocketMarkV2 kind={kind} size={glyphSize} /></div>;
};

const Badge2 = ({ access, soft, children }) => {
  if (children) return <span className={"pk2-badge " + (soft ? 'pk2-badge-soft' : '')}>{children}</span>;
  if (access === 'free') return <span className="pk2-badge pk2-badge-free">Free</span>;
  if (access === 'pro')  return <span className="pk2-badge pk2-badge-pro">Pro</span>;
  return null;
};

const Tool2 = ({ id, locked, shortcut, showPocket }) => {
  const t = TOOLS2[id];
  if (!t) return <div className="pk2-tool" style={{opacity: .4}}>{id}</div>;
  const Icon = Icons2[t.icon] || Icons2.text;
  const pocket = POCKETS2.find(p => p.id === t.pocket);
  return (
    <div className={"pk2-tool" + (locked ? " pk2-tool-locked" : "")}>
      <div className="pk2-tool-icon"><Icon /></div>
      <div className="pk2-tool-body">
        <div className="pk2-tool-name">{t.name}</div>
        <div className="pk2-tool-meta">
          {showPocket && pocket && (
            <>
              <span className={`pk2-acc-${pocket.id}`} style={{color: 'var(--accent-color)'}}>
                <PocketMarkV2 kind={pocket.id} size={10} />
              </span>
              <span>{pocket.name}</span>
              <span style={{ color: 'var(--line)' }}>·</span>
            </>
          )}
          <span>{t.cat}</span>
        </div>
      </div>
      {locked ? (
        <div style={{color: 'var(--ink-3)'}}><Icons2.lock /></div>
      ) : shortcut ? (
        <span className="pk2-kbd">{shortcut}</span>
      ) : (
        <span className="pk2-tool-affordance">↵</span>
      )}
    </div>
  );
};

const BrandMark = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>
  </svg>
);

const Topbar2 = ({ active = 'home', search = true, install = true }) => (
  <div className="pk2-topbar">
    <div className="pk2-brand">
      <div className="pk2-brand-mark"><BrandMark /></div>
      <span>PocketKit</span>
    </div>
    <div className="pk2-nav">
      <a className={active === 'home' ? 'is-active' : ''}>Home</a>
      <a className={active === 'pockets' ? 'is-active' : ''}>Pockets</a>
      <a className={active === 'all' ? 'is-active' : ''}>All tools</a>
      <a className={active === 'pricing' ? 'is-active' : ''}>Pricing</a>
    </div>
    <div className="pk2-topbar-right">
      {search && (
        <div className="pk2-search">
          <Icons2.search />
          <span>Search tools</span>
          <kbd>⌘ K</kbd>
        </div>
      )}
      {install && <button className="pk2-btn pk2-btn-sm"><Icons2.install2 /> Install</button>}
    </div>
  </div>
);

const SectionTitle = ({ children, action }) => (
  <div className="pk2-rule">
    <span className="pk2-section-title">{children}</span>
    <div className="pk2-rule-line"></div>
    {action}
  </div>
);

Object.assign(window, {
  Icons2, PocketMarkV2, POCKETS2, TOOLS2,
  PMark, Badge2, Tool2, Topbar2, SectionTitle, BrandMark,
});
