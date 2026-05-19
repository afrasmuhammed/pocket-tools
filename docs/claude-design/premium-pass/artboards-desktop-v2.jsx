/* PocketKit v2 — desktop artboards (dark mode default). */

// —— Pocket Stack (hero visual) ————————————————————

const PocketStack = () => (
  <div className="pk2-stack">
    {/* Back layer — peek of 3 cards */}
    {[
      { id: 'shop',      top: 56,  rot: 4,   z: 1 },
      { id: 'designer',  top: 36,  rot: -3,  z: 2 },
      { id: 'developer', top: 18,  rot: 2,   z: 3 },
    ].map(c => {
      const p = POCKETS2.find(x => x.id === c.id);
      return (
        <div key={c.id} className={"pk2-stack-card pk2-acc-" + c.id}
             style={{ top: c.top, height: 70, transform: `rotate(${c.rot}deg)`, zIndex: c.z, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <PMark kind={c.id} size="sm" />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{p.count} TOOLS · PRO</div>
            </div>
            <span className="pk2-badge pk2-badge-pro">Pro</span>
          </div>
        </div>
      );
    })}

    {/* Front card — fully drawn Daily */}
    <div className={"pk2-stack-card pk2-acc-daily"}
         style={{ top: 80, paddingBottom: 18, zIndex: 5, transform: 'rotate(-1deg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <PMark kind="daily" size="lg" />
        <span className="pk2-badge pk2-badge-free">Free</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 4 }}>
        Daily
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 16 }}>
        Quick everyday tools. Open and use.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Tool2 id="qr"        shortcut="⌘1" />
        <Tool2 id="imgc"      shortcut="⌘2" />
        <Tool2 id="pwd"       shortcut="⌘3" />
      </div>
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--line-soft)',
                    display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
        <span>15 TOOLS</span>
        <span>OPEN  →</span>
      </div>
    </div>
  </div>
);

// —— 1) Landing v2 —————————————————————————————————

const LandingV2 = () => (
  <div className="pk2 pk2-app">
    <Topbar2 active="home" />

    {/* HERO */}
    <div style={{ padding: '64px 64px 56px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 64, alignItems: 'center' }}>
      <div className="pk2-hero">
        <div className="pk2-mono" style={{ color: 'var(--ink-3)' }}>
          v2.0 · 7 pockets · 76 tools
        </div>
        <h1>
          Small tools,<br/>
          <em>neatly packed.</em>
        </h1>
        <p>
          PocketKit is a private utility app, organized into pockets you can actually find later. Daily tools stay free. Open a Pro pocket when the day demands one.
        </p>
        <div className="pk2-hero-ctas">
          <button className="pk2-btn pk2-btn-primary pk2-btn-lg">Open PocketKit Daily <Icons2.arrow /></button>
          <button className="pk2-btn pk2-btn-lg">Browse all pockets</button>
        </div>
        <div className="pk2-trust-inline">
          <span><Icons2.shield /> Private by default</span>
          <span style={{ color: 'var(--line)' }}>·</span>
          <span><Icons2.offline /> Works offline</span>
          <span style={{ color: 'var(--line)' }}>·</span>
          <span><Icons2.install2 /> Installs in a click</span>
        </div>
      </div>
      <PocketStack />
    </div>

    {/* POCKETS RAIL */}
    <div style={{ padding: '20px 64px 24px' }}>
      <SectionTitle action={<a className="pk2-btn pk2-btn-ghost pk2-btn-sm">View all pockets <Icons2.arrow /></a>}>
        Open the pocket you need
      </SectionTitle>

      <div className="pk2-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {/* Featured Daily card — spans 2 cols */}
        <a className={"pk2-pocket pk2-acc-daily"} style={{ gridColumn: 'span 2', padding: 24 }}>
          <div className="pk2-pocket-aura"></div>
          <div className="pk2-pocket-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <PMark kind="daily" size="lg" />
              <div>
                <div className="pk2-pocket-title" style={{ fontSize: 20 }}>Daily</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  FREE FOREVER · NO ACCOUNT
                </div>
              </div>
            </div>
            <Badge2 access="free" />
          </div>
          <div className="pk2-pocket-desc" style={{ fontSize: 14, maxWidth: 380 }}>
            Quick everyday tools — QR codes, image compression, passwords, basic PDFs, timers, calculators. Open one and use it.
          </div>
          <div className="pk2-pocket-motif" style={{ gap: 8 }}>
            {POCKETS2[0].featured.map(id => {
              const t = TOOLS2[id];
              const Icon = Icons2[t?.icon] || Icons2.text;
              return <div key={id} className="chip" style={{ width: 36, height: 36 }} title={t?.name}><Icon /></div>;
            })}
            <span className="more">+10 more</span>
          </div>
          <div className="pk2-pocket-foot">
            <span style={{ fontFamily: 'var(--font-mono)' }}>15 TOOLS</span>
            <span className="open">Open Daily <Icons2.arrow /></span>
          </div>
        </a>

        {/* Two regular cards on row 1 */}
        {[POCKETS2[1], POCKETS2[2]].map(p => <PocketCard key={p.id} pocket={p} />)}

        {/* Row 2 — 4 cards */}
        {[POCKETS2[3], POCKETS2[4], POCKETS2[5], POCKETS2[6]].map(p => <PocketCard key={p.id} pocket={p} />)}
      </div>
    </div>

    {/* BUILT FOR THE MOMENT */}
    <div style={{ padding: '36px 64px 24px' }}>
      <SectionTitle>Built for the moment</SectionTitle>
      <div className="pk2-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          ['shield', 'Private by default', 'Local tools run in your browser. Nothing uploads. No accounts for free Daily.'],
          ['offline','Works offline',      'PocketKit is installable. Most tools keep working on planes, trains, and bad WiFi.'],
          ['inbox',  'Organized in pockets', 'No wall of 76 tools. Open the pocket that matches the work in front of you.'],
        ].map(([ic, t, d]) => {
          const I = Icons2[ic];
          return (
            <div key={t} className="pk2-card" style={{ padding: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-2)',
                            border: '1px solid var(--line-2)', display: 'grid', placeItems: 'center',
                            color: 'var(--ink-2)', marginBottom: 14 }}>
                <I />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>{t}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.55 }}>{d}</div>
            </div>
          );
        })}
      </div>
    </div>

    {/* PRICING */}
    <div style={{ padding: '36px 64px 24px' }}>
      <SectionTitle action={<a className="pk2-btn pk2-btn-ghost pk2-btn-sm">See all plans <Icons2.arrow /></a>}>
        Daily stays free. Pro unlocks the rest.
      </SectionTitle>
      <div className="pk2-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Free card */}
        <div className="pk2-price-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Badge2 access="free" />
            <span className="pk2-mono" style={{ color: 'var(--ink-3)' }}>NO SIGN-IN</span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>PocketKit Daily</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, letterSpacing: '-0.025em' }}>Free</span>
              <span style={{ color: 'var(--ink-3)', fontSize: 13 }}>forever</span>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
            Everyday tools available without an account. Install to your device and use offline. Always.
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--ink-2)' }}>
            {['15 Daily tools', 'Install as PWA', 'Works offline', 'No uploads for local tools'].map(t => (
              <li key={t} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ color: 'var(--free)' }}><Icons2.check /></span> {t}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
            <button className="pk2-btn" style={{ flex: 1 }}>Open Daily</button>
          </div>
        </div>

        {/* Pro card — featured */}
        <div className="pk2-price-card is-featured">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Badge2 access="pro" />
            <span className="pk2-mono" style={{ color: 'var(--pro)' }}>EARLY ACCESS</span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>All Pro pockets</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, letterSpacing: '-0.025em' }}>$24</span>
              <span style={{ color: 'var(--ink-3)', fontSize: 13 }}>/year · launch price</span>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
            Unlock six specialized pockets — Developer, Designer, SEO, QA, Student, Shop. One small price, one click.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {POCKETS2.filter(p => p.access === 'pro').map(p => (
              <span key={p.id} className={"pk2-badge pk2-badge-soft pk2-acc-" + p.id} style={{ color: 'var(--accent-color)' }}>
                <PocketMarkV2 kind={p.id} size={11} /> {p.name}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
            <button className="pk2-btn pk2-btn-primary" style={{ flex: 1 }}>Unlock all pockets</button>
            <button className="pk2-btn">Notify me</button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, fontSize: 12, color: 'var(--ink-3)', textAlign: 'center' }}>
        One-time and individual pocket unlocks coming with launch. No subscriptions hidden behind toggles.
      </div>
    </div>

    {/* INSTALL */}
    <div style={{ padding: '36px 64px 32px' }}>
      <div className="pk2-card pk2-card-raised" style={{ padding: 22, display: 'flex', alignItems: 'center', gap: 22 }}>
        <PMark kind="daily" size="lg" />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, letterSpacing: '-0.012em' }}>
            Install PocketKit on this device
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
            Add to Dock, taskbar, or home screen. Opens like any other app. Frequently-used pockets show up as shortcuts.
          </div>
        </div>
        <button className="pk2-btn"><Icons2.apple /> Install on macOS</button>
        <button className="pk2-btn pk2-btn-primary"><Icons2.install2 /> Install</button>
      </div>
    </div>

    {/* FOOTER */}
    <div style={{ padding: '20px 64px 28px', borderTop: '1px solid var(--line-2)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-3)' }}>
      <div className="pk2-mono">© 2026 POCKETKIT · POCKETKIT.APP</div>
      <div style={{ display: 'flex', gap: 18 }}>
        <a style={{ color: 'inherit' }}>Privacy</a>
        <a style={{ color: 'inherit' }}>Changelog</a>
        <a style={{ color: 'inherit' }}>Open source</a>
        <a style={{ color: 'inherit' }}>Status</a>
      </div>
    </div>
  </div>
);

// —— PocketCard helper (used in rail) ————————————————

const PocketCard = ({ pocket: p }) => (
  <a className={"pk2-pocket pk2-acc-" + p.id}>
    <div className="pk2-pocket-aura"></div>
    <div className="pk2-pocket-head">
      <PMark kind={p.id} />
      <Badge2 access={p.access} />
    </div>
    <div>
      <div className="pk2-pocket-title">{p.name}</div>
      <div className="pk2-pocket-desc" style={{ marginTop: 4 }}>{p.desc}</div>
    </div>
    <div className="pk2-pocket-motif">
      {p.featured.slice(0, 4).map(id => {
        const t = TOOLS2[id];
        const Icon = (t && Icons2[t.icon]) || Icons2.text;
        return <div key={id} className="chip" title={t?.name}><Icon /></div>;
      })}
      <span className="more">+{p.count - 4}</span>
    </div>
    <div className="pk2-pocket-foot">
      <span style={{ fontFamily: 'var(--font-mono)' }}>{p.count} TOOLS</span>
      <span className="open">Open <Icons2.arrow /></span>
    </div>
  </a>
);

// —— 2) All pockets index page ————————————————————————

const PocketsIndex = () => (
  <div className="pk2 pk2-app">
    <Topbar2 active="pockets" />
    <div style={{ padding: '40px 64px 16px' }}>
      <div className="pk2-crumbs" style={{ marginBottom: 14 }}>
        <a>HOME</a><span className="sep">/</span><span style={{ color: 'var(--ink)' }}>POCKETS</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, letterSpacing: '-0.025em', margin: '0 0 6px' }}>
            All pockets
          </h1>
          <div style={{ fontSize: 14, color: 'var(--ink-2)', maxWidth: 540 }}>
            Seven focused workspaces. Daily is free. The rest unlock together with one Pro pass.
          </div>
        </div>
        <div className="pk2-search" style={{ width: 280 }}>
          <Icons2.search /><span>Search pockets &amp; tools</span><kbd>⌘ K</kbd>
        </div>
      </div>

      <div className="pk2-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {POCKETS2.map(p => <PocketCard key={p.id} pocket={p} />)}
      </div>
    </div>

    <div style={{ padding: '24px 64px 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--ink-3)', fontSize: 12 }}>
      <Icons2.shield /> All pockets run locally. Pro unlocks the workflow, not your privacy.
    </div>
  </div>
);

// —— 3) Pocket detail · Daily (free) —————————————————

const PocketDailyV2 = () => {
  const p = POCKETS2[0];
  const tools = ['qr','imgc','pwd','mergepdf','comppdf','pomo','daysbtw','units','discount','split','random','wc','sig','imgfmt','cc'];
  return (
    <div className="pk2 pk2-app">
      <Topbar2 active="pockets" />
      <div style={{ padding: '36px 56px 0' }}>
        <div className="pk2-crumbs" style={{ marginBottom: 18 }}>
          <a>HOME</a><span className="sep">/</span><a>POCKETS</a><span className="sep">/</span>
          <span style={{ color: 'var(--ink)' }}>DAILY</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 22 }}>
          <PMark kind="daily" size="lg" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600, letterSpacing: '-0.022em', margin: 0 }}>Daily</h1>
              <Badge2 access="free" />
              <span className="pk2-badge"><Icons2.offline /> Offline</span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--ink-2)', maxWidth: 620 }}>
              Useful common tools for everyone. No account, no uploads — open and use.
            </div>
          </div>
          <button className="pk2-btn pk2-btn-sm"><Icons2.pin /> Pin pocket</button>
          <button className="pk2-btn pk2-btn-sm"><Icons2.copy /> Copy link</button>
          <button className="pk2-btn pk2-btn-sm pk2-btn-primary"><Icons2.install2 /> Install</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <div className="pk2-search" style={{ width: 340 }}>
            <Icons2.search /><span>Search in Daily</span><kbd>/</kbd>
          </div>
          <div className="pk2-chips">
            <button className="pk2-chip is-active">All <span className="count">15</span></button>
            <button className="pk2-chip">Generators <span className="count">3</span></button>
            <button className="pk2-chip">Images <span className="count">3</span></button>
            <button className="pk2-chip">PDF <span className="count">2</span></button>
            <button className="pk2-chip">Text <span className="count">2</span></button>
            <button className="pk2-chip">Math <span className="count">3</span></button>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 56px 16px' }}>
        <SectionTitle>Recently used</SectionTitle>
        <div className="pk2-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 26 }}>
          {['qr','pwd','imgc','pomo'].map((id, i) => (
            <Tool2 key={id} id={id} shortcut={i === 0 ? '⌘1' : i === 1 ? '⌘2' : i === 2 ? '⌘3' : '⌘4'} />
          ))}
        </div>

        <SectionTitle>All tools in Daily</SectionTitle>
        <div className="pk2-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {tools.map(id => <Tool2 key={id} id={id} />)}
        </div>
      </div>

      <div style={{ padding: '28px 56px 28px', display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ink-3)', fontSize: 12 }}>
        <Icons2.shield /> Local tools run in your browser. Nothing leaves your device.
      </div>
    </div>
  );
};

// —— 4) Pocket detail · Designer (Pro locked) ——————————

const PocketDesignerPro = () => {
  const p = POCKETS2.find(x => x.id === 'designer');
  const tools = ['imgc','imgfmt','resize','crop','picker','palette','watermark','bw','sticker','rename','type','contrast','gradient','framer'];
  return (
    <div className="pk2 pk2-app">
      <Topbar2 active="pockets" />
      <div style={{ padding: '36px 56px 0' }}>
        <div className="pk2-crumbs" style={{ marginBottom: 18 }}>
          <a>HOME</a><span className="sep">/</span><a>POCKETS</a><span className="sep">/</span>
          <span style={{ color: 'var(--ink)' }}>DESIGNER</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 18 }}>
          <PMark kind="designer" size="lg" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600, letterSpacing: '-0.022em', margin: 0 }}>Designer</h1>
              <Badge2 access="pro" />
              <span className="pk2-badge"><Icons2.offline /> Offline</span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--ink-2)', maxWidth: 640 }}>
              Image, color, type, and layout helpers — all locally. From bulk renames to contrast checks.
            </div>
          </div>
          <button className="pk2-btn pk2-btn-sm"><Icons2.pin /> Pin pocket</button>
          <button className="pk2-btn pk2-btn-sm pk2-btn-primary"><Icons2.unlock /> Unlock Designer</button>
        </div>

        {/* Soft Pro banner */}
        <div className="pk2-pro-banner pk2-acc-designer" style={{ marginBottom: 22 }}>
          <div className="pk2-mark pk2-mark-sm" style={{ background: 'transparent', borderColor: 'var(--pro-line)' }}>
            <Icons2.sparkle />
          </div>
          <div className="pk2-pro-banner-body">
            <strong>Preview Designer.</strong> Tools below are visible so you can plan your workflow. Unlocking opens them all at once. Designer is included in <strong>All Pro pockets</strong>.
          </div>
          <button className="pk2-btn pk2-btn-sm" style={{ background: 'transparent', borderColor: 'var(--pro-line)', color: 'var(--pro)' }}>What's included</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div className="pk2-search" style={{ width: 340 }}>
            <Icons2.search /><span>Search in Designer</span>
          </div>
          <div className="pk2-chips">
            <button className="pk2-chip is-active">All <span className="count">14</span></button>
            <button className="pk2-chip">Image <span className="count">7</span></button>
            <button className="pk2-chip">Color <span className="count">4</span></button>
            <button className="pk2-chip">Type <span className="count">2</span></button>
            <button className="pk2-chip">Layout <span className="count">1</span></button>
          </div>
        </div>
      </div>

      <div style={{ padding: '4px 56px 16px' }}>
        <SectionTitle>Preview · {tools.length} tools</SectionTitle>
        <div className="pk2-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {tools.map(id => <Tool2 key={id} id={id} locked />)}
        </div>
      </div>

      <div style={{ padding: '22px 56px 28px', display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ink-3)', fontSize: 12 }}>
        <Icons2.shield /> Pro pockets run in your browser like Daily. Pro unlocks the workflow, not the privacy.
      </div>
    </div>
  );
};

// —— 5) All Tools v2 ————————————————————————————————

const AllToolsV2 = () => {
  const recent = ['qr','json','pwd','vat','og','imgc'];
  const lib = ['qr','imgc','pwd','mergepdf','comppdf','json','regex','b64','jwt','md','metat','og',
               'inv','rcpt','vat','units','split','pomo','hash','uuid','bug','slug','xml','palette',
               'type','cite','flash','gpa','focus','margin'];
  return (
    <div className="pk2 pk2-app">
      <Topbar2 active="all" />
      <div style={{ padding: '36px 56px 0' }}>
        <div className="pk2-crumbs" style={{ marginBottom: 14 }}>
          <a>HOME</a><span className="sep">/</span><span style={{ color: 'var(--ink)' }}>ALL TOOLS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600, letterSpacing: '-0.022em', margin: '0 0 6px' }}>
              All tools
            </h1>
            <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>76 tools across 7 pockets · Use ⌘K to jump to any one</div>
          </div>
          <div className="pk2-search" style={{ width: 380 }}>
            <Icons2.search /><span>Search all tools</span><kbd>⌘ K</kbd>
          </div>
        </div>

        <div className="pk2-chips" style={{ marginBottom: 12 }}>
          <button className="pk2-chip is-active">All <span className="count">76</span></button>
          {POCKETS2.map(p => (
            <button key={p.id} className={"pk2-chip pk2-acc-" + p.id}>
              <span style={{ color: 'var(--accent-color)' }}><PocketMarkV2 kind={p.id} size={12} /></span>
              {p.name} <span className="count">{p.count}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0 18px' }}>
          <span className="pk2-mono" style={{ color: 'var(--ink-3)' }}>SORT</span>
          <div className="pk2-chips">
            <button className="pk2-chip is-active">A–Z</button>
            <button className="pk2-chip">Recently used</button>
            <button className="pk2-chip">Most used</button>
            <button className="pk2-chip">By pocket</button>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 56px 16px' }}>
        <SectionTitle>Recently used</SectionTitle>
        <div className="pk2-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 26 }}>
          {recent.map(id => <Tool2 key={id} id={id} showPocket />)}
        </div>

        <SectionTitle>Library</SectionTitle>
        <div className="pk2-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {lib.map(id => <Tool2 key={id} id={id} showPocket />)}
        </div>
      </div>

      <div style={{ padding: '20px 56px 24px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 12 }}>
        Showing 30 of 76 · <a style={{ color: 'var(--ink-2)' }}>Show all</a>
      </div>
    </div>
  );
};

// —— 6) Tool page — Color Picker (Designer Pro) —————————

const ToolPageV2 = () => (
  <div className="pk2 pk2-app">
    <Topbar2 active="all" />
    <div style={{ padding: '32px 56px 0' }}>
      <div className="pk2-crumbs" style={{ marginBottom: 14 }}>
        <a>HOME</a><span className="sep">/</span>
        <a>POCKETS</a><span className="sep">/</span>
        <a style={{ color: 'var(--ink-2)' }}>DESIGNER</a><span className="sep">/</span>
        <span style={{ color: 'var(--ink)' }}>COLOR PALETTE EXTRACTOR</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
        <PMark kind="designer" size="lg" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, letterSpacing: '-0.022em', margin: 0 }}>
              Color Palette Extractor
            </h1>
            <Badge2 access="pro" />
            <span className="pk2-badge"><Icons2.offline /> Offline</span>
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>
            Drop an image, get a palette in HEX, OKLCH and Tailwind tokens. Works entirely in your browser.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="pk2-btn pk2-btn-sm"><Icons2.pin /> Pin this tool</button>
          <button className="pk2-btn pk2-btn-sm"><Icons2.copy /> Copy link</button>
          <button className="pk2-btn pk2-btn-sm pk2-btn-icon"><Icons2.more /></button>
        </div>
      </div>

      {/* In-pocket nav (sibling tools) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--line-2)' }}>
        <span className="pk2-mono" style={{ color: 'var(--ink-3)' }}>DESIGNER:</span>
        <div className="pk2-chips">
          <button className="pk2-chip">Compressor</button>
          <button className="pk2-chip">Crop</button>
          <button className="pk2-chip">Picker</button>
          <button className="pk2-chip is-active">Palette</button>
          <button className="pk2-chip">Contrast</button>
          <button className="pk2-chip">Type scale</button>
          <button className="pk2-chip" style={{ color: 'var(--ink-3)' }}>+8</button>
        </div>
      </div>
    </div>

    {/* Tool body — two-column workspace */}
    <div style={{ padding: '20px 56px 24px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 18 }}>
      <div className="pk2-card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Source image</div>
          <button className="pk2-btn pk2-btn-sm"><Icons2.download /> Replace</button>
        </div>
        <div style={{
          aspectRatio: '4/3', borderRadius: 12, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, oklch(0.45 0.16 30), oklch(0.35 0.13 280) 40%, oklch(0.4 0.1 200) 70%, oklch(0.55 0.12 90))',
          border: '1px solid var(--line)'
        }}>
          <div style={{ position: 'absolute', bottom: 10, left: 10, fontSize: 11, color: 'rgba(255,255,255,.8)', fontFamily: 'var(--font-mono)' }}>
            beach-sunset.jpg · 1920×1080
          </div>
        </div>
      </div>
      <div className="pk2-card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Extracted palette</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="pk2-btn pk2-btn-sm">HEX</button>
            <button className="pk2-btn pk2-btn-sm" style={{ background: 'var(--surface-2)', borderColor: 'var(--line)' }}>OKLCH</button>
            <button className="pk2-btn pk2-btn-sm"><Icons2.copy /></button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            ['oklch(0.45 0.16 30)',  '#a14629', '32%'],
            ['oklch(0.35 0.13 280)', '#3a3082', '24%'],
            ['oklch(0.55 0.12 90)',  '#a98a4f', '18%'],
            ['oklch(0.4 0.1 200)',   '#2c5d70', '14%'],
            ['oklch(0.78 0.08 90)',  '#c9b88c', '12%'],
          ].map(([oklch, hex, pct]) => (
            <div key={hex} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: oklch, border: '1px solid var(--line)' }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)' }}>{hex}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-3)' }}>{oklch}</div>
              </div>
              <span className="pk2-mono" style={{ color: 'var(--ink-3)' }}>{pct}</span>
              <button className="pk2-btn pk2-btn-sm pk2-btn-icon" style={{ color: 'var(--ink-3)' }}><Icons2.copy /></button>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Related — same pocket */}
    <div style={{ padding: '0 56px 28px' }}>
      <SectionTitle>More from Designer</SectionTitle>
      <div className="pk2-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {['picker','contrast','gradient','imgc'].map(id => <Tool2 key={id} id={id} />)}
      </div>
    </div>
  </div>
);

Object.assign(window, {
  LandingV2, PocketsIndex, PocketDailyV2, PocketDesignerPro, AllToolsV2, ToolPageV2,
  PocketStack, PocketCard,
});
