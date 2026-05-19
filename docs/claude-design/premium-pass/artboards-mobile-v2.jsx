/* PocketKit v2 — mobile artboards (390 wide, dark default). */

const MStatus2 = () => (
  <div className="pk2-statusbar">
    <span>9:41</span>
    <span className="dots"><span /><span /><span /><span /></span>
  </div>
);

const MTabbar2 = ({ active = 'home' }) => (
  <div className="pk2-tabbar">
    {[
      ['home', Icons2.homeT, 'Home'],
      ['pockets', Icons2.inbox, 'Pockets'],
      ['all', Icons2.grid, 'All'],
      ['settings', Icons2.cog, 'You'],
    ].map(([id, I, label]) => (
      <div key={id} className={"pk2-tab " + (active === id ? 'is-active' : '')}>
        <I />
        <span>{label}</span>
      </div>
    ))}
  </div>
);

const MTopbar2 = ({ title, back, right, brand }) => (
  <div className="pk2-mobile-bar">
    {back ? (
      <button className="pk2-btn pk2-btn-ghost pk2-btn-sm pk2-btn-icon" style={{ marginLeft: -8 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>
      </button>
    ) : brand ? (
      <div className="pk2-brand" style={{ fontSize: 14 }}>
        <div className="pk2-brand-mark" style={{ width: 22, height: 22, borderRadius: 6 }}><BrandMark /></div>
        <span>PocketKit</span>
      </div>
    ) : null}
    {title && <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</div>}
    <div className="pk2-spacer" />
    {right || (
      <>
        <button className="pk2-btn pk2-btn-ghost pk2-btn-sm pk2-btn-icon"><Icons2.search /></button>
        <button className="pk2-btn pk2-btn-ghost pk2-btn-sm pk2-btn-icon"><Icons2.more /></button>
      </>
    )}
  </div>
);

// —— Mobile · Landing v2 ——————————————————————————

const MLandingV2 = () => (
  <div className="pk2" style={{ height: '100%', position: 'relative', background: 'var(--bg)' }}>
    <MStatus2 />
    <MTopbar2 brand />

    {/* HERO */}
    <div style={{ padding: '22px 18px 16px' }}>
      <div className="pk2-mono" style={{ color: 'var(--ink-3)', marginBottom: 10 }}>v2.0 · 7 POCKETS</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.05, margin: '0 0 12px', textWrap: 'balance' }}>
        Small tools,<br/><em style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--ink-2)' }}>neatly packed.</em>
      </h1>
      <p style={{ fontSize: 14.5, color: 'var(--ink-2)', margin: '0 0 18px', lineHeight: 1.5 }}>
        Private utility app organized into pockets. Daily tools stay free.
      </p>
      <button className="pk2-btn pk2-btn-primary" style={{ width: '100%', height: 46, marginBottom: 8 }}>
        Open PocketKit Daily <Icons2.arrow />
      </button>
      <button className="pk2-btn" style={{ width: '100%', height: 46 }}>Browse all pockets</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, fontSize: 11.5, color: 'var(--ink-3)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icons2.shield /> Private</span>
        <span style={{ color: 'var(--line)' }}>·</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icons2.offline /> Offline</span>
        <span style={{ color: 'var(--line)' }}>·</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icons2.install2 /> Installs</span>
      </div>
    </div>

    {/* DAILY FEATURED CARD */}
    <div style={{ padding: '8px 18px 0' }}>
      <a className={"pk2-pocket pk2-acc-daily"} style={{ padding: 18 }}>
        <div className="pk2-pocket-aura"></div>
        <div className="pk2-pocket-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <PMark kind="daily" />
            <div>
              <div className="pk2-pocket-title" style={{ fontSize: 17 }}>Daily</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>FREE FOREVER</div>
            </div>
          </div>
          <Badge2 access="free" />
        </div>
        <div className="pk2-pocket-motif">
          {POCKETS2[0].featured.slice(0, 4).map(id => {
            const t = TOOLS2[id];
            const Icon = (t && Icons2[t.icon]) || Icons2.text;
            return <div key={id} className="chip"><Icon /></div>;
          })}
          <span className="more">+11</span>
        </div>
        <div className="pk2-pocket-foot">
          <span style={{ fontFamily: 'var(--font-mono)' }}>15 TOOLS</span>
          <span className="open">Open Daily <Icons2.arrow /></span>
        </div>
      </a>
    </div>

    {/* PRO POCKETS */}
    <div style={{ padding: '20px 18px 12px' }}>
      <SectionTitle>Pro pockets</SectionTitle>
      <div className="pk2-stack-v" style={{ gap: 10 }}>
        {POCKETS2.slice(1, 5).map(p => (
          <a key={p.id} className={"pk2-pocket pk2-acc-" + p.id}
             style={{ padding: 14, gap: 10, flexDirection: 'row', alignItems: 'center' }}>
            <PMark kind={p.id} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>{p.name}</div>
                <Badge2 access="pro" />
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.promise}
              </div>
            </div>
            <Icons2.arrow />
          </a>
        ))}
        <button className="pk2-btn pk2-btn-ghost" style={{ alignSelf: 'flex-start', marginLeft: -10 }}>
          Show 2 more pockets <Icons2.arrow />
        </button>
      </div>
    </div>

    {/* TRUST STRIP */}
    <div style={{ padding: '8px 18px 14px' }}>
      <div className="pk2-card" style={{ padding: 14 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>What you can trust</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--ink-2)' }}>
          {[
            ['shield','No uploads for local tools'],
            ['offline','Works offline whenever possible'],
            ['inbox','Organized in pockets, not lists'],
          ].map(([ic, t]) => {
            const I = Icons2[ic];
            return (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'var(--ink-2)' }}><I /></span> {t}
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* INSTALL */}
    <div style={{ padding: '0 18px 96px' }}>
      <div className="pk2-card pk2-card-raised" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <PMark kind="daily" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Install PocketKit</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>Add to home screen — opens like an app.</div>
        </div>
        <button className="pk2-btn pk2-btn-sm pk2-btn-primary">Install</button>
      </div>
    </div>

    <MTabbar2 active="home" />
  </div>
);

// —— Mobile · Pocket detail (Designer Pro) ——————————————

const MPocketProV2 = () => {
  const p = POCKETS2.find(x => x.id === 'designer');
  const tools = ['imgc','imgfmt','resize','crop','picker','palette','watermark','bw','contrast','type'];
  return (
    <div className="pk2" style={{ height: '100%', position: 'relative', background: 'var(--bg)' }}>
      <MStatus2 />
      <MTopbar2 back title="Designer" right={<button className="pk2-btn pk2-btn-ghost pk2-btn-sm pk2-btn-icon"><Icons2.more /></button>} />

      {/* Pocket header */}
      <div style={{ padding: '16px 18px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <PMark kind="designer" size="lg" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Designer</div>
              <Badge2 access="pro" />
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>
              Image, color, and type helpers — local.
            </div>
          </div>
        </div>

        {/* Pro banner — stacked */}
        <div className="pk2-pro-banner pk2-acc-designer" style={{ marginBottom: 14, padding: 14, gap: 10, alignItems: 'flex-start', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            <div className="pk2-mark pk2-mark-sm" style={{ background: 'transparent', borderColor: 'var(--pro-line)' }}>
              <Icons2.sparkle />
            </div>
            <div style={{ flex: 1, fontSize: 12.5, lineHeight: 1.45, color: 'var(--pro)' }}>
              <strong style={{ color: 'oklch(0.92 0.05 70)' }}>Preview Designer.</strong> Unlock opens 14 tools.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button className="pk2-btn pk2-btn-sm" style={{ flex: 1, background: 'transparent', borderColor: 'var(--pro-line)', color: 'var(--pro)' }}>What's inside</button>
            <button className="pk2-btn pk2-btn-primary pk2-btn-sm" style={{ flex: 1 }}>Unlock</button>
          </div>
        </div>

        <div className="pk2-search" style={{ width: '100%', marginBottom: 12 }}>
          <Icons2.search /><span>Search Designer</span>
        </div>

        <div className="pk2-chips" style={{ marginBottom: 14, flexWrap: 'nowrap', overflowX: 'hidden' }}>
          <button className="pk2-chip is-active">All <span className="count">14</span></button>
          <button className="pk2-chip">Image</button>
          <button className="pk2-chip">Color</button>
          <button className="pk2-chip">Type</button>
        </div>
      </div>

      <div style={{ padding: '0 18px 96px' }}>
        <div className="pk2-stack-v" style={{ gap: 8 }}>
          {tools.map(id => <Tool2 key={id} id={id} locked />)}
        </div>
      </div>

      <MTabbar2 active="pockets" />
    </div>
  );
};

// —— Mobile · Tool page (QR Generator, Daily/Free) ——————

const MToolPageV2 = () => (
  <div className="pk2" style={{ height: '100%', position: 'relative', background: 'var(--bg)' }}>
    <MStatus2 />
    <MTopbar2 back title="QR Code" right={
      <>
        <button className="pk2-btn pk2-btn-ghost pk2-btn-sm pk2-btn-icon"><Icons2.pin /></button>
        <button className="pk2-btn pk2-btn-ghost pk2-btn-sm pk2-btn-icon"><Icons2.more /></button>
      </>
    } />

    <div style={{ padding: '14px 18px 0' }}>
      <div className="pk2-crumbs" style={{ marginBottom: 10 }}>
        <a>DAILY</a><span className="sep">/</span><span style={{ color: 'var(--ink)' }}>QR CODE GENERATOR</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <PMark kind="daily" size="lg" />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 600, letterSpacing: '-0.018em' }}>QR Code Generator</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Badge2 access="free" />
            <span className="pk2-badge"><Icons2.offline /> Offline</span>
          </div>
        </div>
      </div>
    </div>

    {/* Tool workspace */}
    <div style={{ padding: '0 18px 96px' }}>
      {/* Preview */}
      <div className="pk2-card pk2-card-raised" style={{ padding: 24, display: 'grid', placeItems: 'center', marginBottom: 10 }}>
        <div style={{
          width: 200, height: 200, background: 'white', borderRadius: 12,
          backgroundImage:
            'radial-gradient(circle at 25% 25%, black 22%, transparent 23%),' +
            'radial-gradient(circle at 75% 25%, black 22%, transparent 23%),' +
            'radial-gradient(circle at 25% 75%, black 22%, transparent 23%),' +
            'repeating-conic-gradient(black 0% 25%, white 0% 50%)',
          backgroundSize: '60px 60px, 60px 60px, 60px 60px, 14px 14px',
          backgroundPosition: '8px 8px, 158px 8px, 8px 158px, 0 0',
          backgroundRepeat: 'no-repeat, no-repeat, no-repeat, repeat',
          backgroundClip: 'padding-box',
          padding: 8,
        }}></div>
        <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-3)' }}>256 × 256 · PNG · Local</div>
      </div>

      <div className="pk2-card" style={{ padding: 14, marginBottom: 10 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 8 }}>CONTENT</div>
        <div style={{ padding: '10px 12px', background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--ink)' }}>
          https://pocketkit.app
        </div>
      </div>

      <div className="pk2-card" style={{ padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 10 }}>SIZE</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['256', '512', '1024'].map((s, i) => (
            <button key={s} className={"pk2-chip " + (i === 0 ? 'is-active' : '')} style={{ flex: 1, justifyContent: 'center' }}>{s}px</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="pk2-btn pk2-btn-lg" style={{ flex: 1 }}><Icons2.copy /> Copy</button>
        <button className="pk2-btn pk2-btn-primary pk2-btn-lg" style={{ flex: 1.4 }}><Icons2.download /> Download PNG</button>
      </div>

      {/* Related */}
      <div style={{ marginTop: 22 }}>
        <SectionTitle>More from Daily</SectionTitle>
        <div className="pk2-stack-v" style={{ gap: 8 }}>
          {['pwd', 'imgc', 'pomo'].map(id => <Tool2 key={id} id={id} />)}
        </div>
      </div>

      <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 10, fontSize: 12, color: 'var(--ink-3)', display: 'flex', gap: 8 }}>
        <Icons2.shield />
        <span>Generated in your browser. Nothing is uploaded.</span>
      </div>
    </div>

    <MTabbar2 active="all" />
  </div>
);

Object.assign(window, { MLandingV2, MPocketProV2, MToolPageV2 });
