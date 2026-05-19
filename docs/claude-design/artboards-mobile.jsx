/* PocketKit mobile artboards (390 wide). */

const MStatus = () => (
  <div className="pk-mobile-statusbar">
    <span>9:41</span>
    <span className="dots"><span /><span /><span /><span /></span>
  </div>
);

const MTabbar = ({ active = 'home' }) => (
  <div className="pk-tabbar">
    {[
      ['home', Icons.homeT, 'Home'],
      ['pockets', Icons.inbox, 'Pockets'],
      ['all', Icons.grid, 'All'],
      ['settings', Icons.cog, 'Settings'],
    ].map(([id, I, label]) => (
      <div key={id} className={"pk-tab " + (active === id ? 'is-active' : '')}>
        <I />
        <span>{label}</span>
      </div>
    ))}
  </div>
);

const MTopbar = ({ title, back, right }) => (
  <div className="pk-mobile-bar">
    {back ? (
      <button className="pk-btn pk-btn-ghost pk-btn-sm" style={{ marginLeft: -8, width: 32, padding: 0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>
      </button>
    ) : (
      <div className="pk-brand">
        <div className="pk-brand-mark" />
        <span>PocketKit</span>
      </div>
    )}
    {title && <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>}
    <div className="pk-spacer" />
    {right || (
      <button className="pk-btn pk-btn-ghost pk-btn-sm" style={{ width: 32, padding: 0 }}><Icons.search /></button>
    )}
  </div>
);

// —— 6) Mobile · Landing —————————————————————————————————

const MLanding = () => (
  <div className="pk" style={{ height: '100%', position: 'relative', background: 'var(--bg)' }}>
    <MStatus />
    <MTopbar />

    <div style={{ padding: '20px 18px 12px' }}>
      <div className="pk-mono" style={{ color: 'var(--ink-3)', marginBottom: 8 }}>v2.0 · PocketKit</div>
      <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.018em', lineHeight: 1.15, margin: '0 0 10px', textWrap: 'balance' }}>
        Private everyday tools, installed like an app.
      </h1>
      <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 16px', lineHeight: 1.5 }}>
        Quick tools for PDFs, images, text, QA, SEO, development, and shop work. PocketKit Daily is free.
      </p>
      <button className="pk-btn pk-btn-primary" style={{ width: '100%', height: 44, marginBottom: 8 }}>
        Open PocketKit Daily <Icons.arrow />
      </button>
      <button className="pk-btn" style={{ width: '100%', height: 44 }}>Browse all pockets</button>
      <div className="pk-hero-trust" style={{ marginTop: 12 }}>
        <span className="dot"></span>
        Works offline · No uploads for local tools
      </div>
    </div>

    <div style={{ padding: '10px 18px 0' }}><div className="pk-divider" /></div>

    <div style={{ padding: '20px 18px 8px' }}>
      <div className="pk-section-title">Pockets</div>
      <div className="pk-stack" style={{ gap: 10 }}>
        {POCKETS.slice(0, 4).map(p => (
          <div key={p.id} className="pk-pocket" style={{ padding: 14, gap: 8, flexDirection: 'row', alignItems: 'center' }}>
            <div className="pk-mark" style={{ color: p.accent, width: 36, height: 36 }}>
              <PocketMark kind={p.id} size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name.replace('PocketKit ', '')}</div>
                <Badge access={p.access} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.featured.slice(0, 3).join(' · ')} · {p.count} tools
              </div>
            </div>
            <Icons.arrow />
          </div>
        ))}
        <button className="pk-btn pk-btn-ghost" style={{ alignSelf: 'flex-start', marginLeft: -10 }}>
          View 3 more pockets <Icons.arrow />
        </button>
      </div>
    </div>

    <div style={{ padding: '12px 18px 24px' }}>
      <div className="pk-section-title">Why PocketKit</div>
      <div className="pk-stack" style={{ gap: 10 }}>
        {[
          ['shield', 'Private by default — no uploads for local tools.'],
          ['offline','Works offline whenever possible.'],
          ['inbox', 'Organized into focused pockets, not a giant list.'],
        ].map(([ic, t]) => {
          const I = Icons[ic];
          return (
            <div key={t} className="pk-card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ color: 'var(--ink-2)' }}><I /></div>
              <div style={{ fontSize: 13, color: 'var(--ink)' }}>{t}</div>
            </div>
          );
        })}
      </div>
    </div>

    <div style={{ padding: '0 18px 96px' }}>
      <div className="pk-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="pk-mark" style={{ color: 'var(--ink)' }}><Icons.install /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Add to home screen</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>Opens like a regular app.</div>
        </div>
        <button className="pk-btn pk-btn-sm">Install</button>
      </div>
    </div>

    <MTabbar active="home" />
  </div>
);

// —— 7) Mobile · Pocket detail (Image, Pro) —————————————————

const MPocketPro = () => {
  const p = POCKETS.find(x => x.id === 'image');
  const tools = ['imgc','imgfmt','resize','crop','picker','watermark','bw','sticker','rename'];
  return (
    <div className="pk" style={{ height: '100%', position: 'relative', background: 'var(--bg)' }}>
      <MStatus />
      <MTopbar back title="Image" right={<button className="pk-btn pk-btn-ghost pk-btn-sm" style={{ width: 32, padding: 0 }}><Icons.more /></button>} />

      <div style={{ padding: '16px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div className="pk-mark pk-mark-lg" style={{ color: p.accent }}>
            <PocketMark kind="image" size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.012em' }}>PocketKit Image</div>
              <Badge access="pro" />
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>
              Compress, resize, crop, and watermark — locally.
            </div>
          </div>
        </div>

        <div className="pk-pro-banner" style={{ marginBottom: 14, padding: 12, gap: 10, alignItems: 'flex-start', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            <div className="pk-mark" style={{ color: 'var(--pro-ink)', background: 'transparent', border: '1px solid var(--pro-line)', width: 28, height: 28 }}>
              <Icons.sparkle />
            </div>
            <div style={{ flex: 1, fontSize: 12.5, lineHeight: 1.45 }}>
              <strong>Image is a Pro pocket.</strong> Preview tools below.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button className="pk-btn pk-btn-sm" style={{ flex: 1, background: 'transparent', borderColor: 'var(--pro-line)' }}>Notify me</button>
            <button className="pk-btn pk-btn-primary pk-btn-sm" style={{ flex: 1 }}>Unlock</button>
          </div>
        </div>

        <div className="pk-search" style={{ width: '100%', marginBottom: 12 }}>
          <Icons.search />
          <span>Search in Image</span>
        </div>

        <div className="pk-chips" style={{ marginBottom: 14, flexWrap: 'nowrap', overflowX: 'hidden' }}>
          <button className="pk-chip is-active">All <span className="count">9</span></button>
          <button className="pk-chip">Resize</button>
          <button className="pk-chip">Edit</button>
          <button className="pk-chip">Convert</button>
        </div>
      </div>

      <div style={{ padding: '0 18px 96px' }}>
        <div className="pk-stack" style={{ gap: 8 }}>
          {tools.map(id => {
            const t = TOOL_LIB[id] || { name: id, icon: 'image', cat: 'Images' };
            const Icon = Icons[t.icon] || Icons.image;
            return (
              <div key={id} className="pk-tool pk-tool-locked" style={{ padding: '11px 12px' }}>
                <div className="pk-tool-icon"><Icon /></div>
                <div className="pk-tool-body">
                  <div className="pk-tool-name">{t.name}</div>
                  <div className="pk-tool-meta">{t.cat || 'Image'}</div>
                </div>
                <div style={{ color: 'var(--ink-3)' }}><Icons.lock /></div>
              </div>
            );
          })}
        </div>
      </div>

      <MTabbar active="pockets" />
    </div>
  );
};

// —— Add a tools we referenced above ————————————————

TOOL_LIB.resize     = { name: 'Social Media Resizer', icon: 'resize',    cat: 'Image', pocket: 'image', access: 'pro' };
TOOL_LIB.crop       = { name: 'Aspect Ratio Cropper', icon: 'crop',      cat: 'Image', pocket: 'image', access: 'pro' };
TOOL_LIB.picker     = { name: 'Image Color Picker',   icon: 'picker',    cat: 'Image', pocket: 'image', access: 'pro' };
TOOL_LIB.watermark  = { name: 'Text Watermark',       icon: 'watermark', cat: 'Image', pocket: 'image', access: 'pro' };
TOOL_LIB.bw         = { name: 'Black & White',        icon: 'bw',        cat: 'Image', pocket: 'image', access: 'pro' };
TOOL_LIB.sticker    = { name: 'Sticker Maker',        icon: 'sticker',   cat: 'Image', pocket: 'image', access: 'pro' };
TOOL_LIB.rename     = { name: 'Bulk Photo Renamer',   icon: 'rename',    cat: 'Image', pocket: 'image', access: 'pro' };

// —— 8) Mobile · Tool page (Compress PDF, free in Daily) ————

const MToolPage = () => (
  <div className="pk" style={{ height: '100%', position: 'relative', background: 'var(--bg)' }}>
    <MStatus />
    <MTopbar back title="Compress PDF" right={<button className="pk-btn pk-btn-ghost pk-btn-sm" style={{ width: 32, padding: 0 }}><Icons.more /></button>} />

    <div style={{ padding: '14px 18px 8px' }}>
      <div className="pk-crumbs" style={{ marginBottom: 10 }}>
        <a>Daily</a><span className="sep">/</span><span style={{ color: 'var(--ink)' }}>Compress PDF</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div className="pk-mark pk-mark-lg" style={{ color: 'var(--ink)' }}><Icons.compress /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.012em' }}>Compress PDF</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Badge access="free" />
            <span className="pk-badge"><Icons.offline /> Offline</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className="pk-btn pk-btn-sm" style={{ flex: 1 }}><Icons.pin /> Pin this tool</button>
        <button className="pk-btn pk-btn-sm" style={{ flex: 1 }}><Icons.copy /> Copy link</button>
      </div>
    </div>

    <div style={{ padding: '0 18px 96px' }}>
      <div className="pk-card" style={{ padding: 14 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>1 · Choose a PDF</div>
        <div style={{ border: '1.5px dashed var(--line)', borderRadius: 10, padding: '24px 14px', textAlign: 'center', background: 'var(--surface-2)' }}>
          <div style={{ color: 'var(--ink-3)', marginBottom: 8 }}><Icons.download /></div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Tap to choose or drop a PDF</div>
          <div className="pk-mono" style={{ color: 'var(--ink-3)', marginTop: 4 }}>stays on this device</div>
        </div>
      </div>

      <div className="pk-card" style={{ padding: 14, marginTop: 10 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>2 · Quality</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Lower', 'Recommended', 'Higher'].map((s, i) => (
            <button key={s} className={"pk-chip " + (i === 1 ? 'is-active' : '')} style={{ flex: 1, justifyContent: 'center' }}>{s}</button>
          ))}
        </div>
      </div>

      <button className="pk-btn pk-btn-primary" style={{ width: '100%', height: 46, marginTop: 12 }} disabled>
        Compress
      </button>

      <div style={{ marginTop: 14, padding: 12, background: 'var(--surface-2)', border: '1px solid var(--line-2)', borderRadius: 10, fontSize: 12, color: 'var(--ink-3)', display: 'flex', gap: 8 }}>
        <Icons.shield />
        <span>Runs in your browser. Your file is never uploaded.</span>
      </div>
    </div>

    <MTabbar active="all" />
  </div>
);

Object.assign(window, { MLanding, MPocketPro, MToolPage });
