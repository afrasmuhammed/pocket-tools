/* PocketKit desktop artboards.
 * Each renders inside a fixed-width DCArtboard. */

// —— 1) Landing page —————————————————————————————————————

const Landing = () => (
  <div className="pk pk-app">
    <Topbar active="home" />

    {/* HERO */}
    <div style={{ padding: '64px 56px 28px' }}>
      <div className="pk-hero">
        <div className="pk-mono" style={{ color: 'var(--ink-3)' }}>v2.0 · PocketKit</div>
        <h1>Private everyday tools, installed like an app.</h1>
        <p>Use quick tools for PDFs, images, text, QA, SEO, development, and shop work. PocketKit Daily is free. Advanced pockets are available when you need more.</p>
        <div className="pk-hero-ctas">
          <button className="pk-btn pk-btn-primary">Open PocketKit Daily <Icons.arrow /></button>
          <button className="pk-btn">Browse all pockets</button>
        </div>
        <div className="pk-hero-trust">
          <span className="dot"></span>
          Works offline whenever possible · No uploads for local tools
        </div>
      </div>
    </div>

    <div style={{ padding: '0 56px' }}><div className="pk-divider" /></div>

    {/* POCKETS */}
    <div style={{ padding: '36px 56px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div className="pk-section-title" style={{ marginBottom: 6 }}>Pockets</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Focused workspaces. Open one, get to work.</div>
        </div>
        <a className="pk-btn pk-btn-ghost pk-btn-sm">View all pockets <Icons.arrow /></a>
      </div>

      <div className="pk-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {POCKETS.map(p => (
          <a key={p.id} className="pk-pocket">
            <div className="pk-pocket-head">
              <div className="pk-mark" style={{ color: p.accent }}>
                <PocketMark kind={p.id} />
              </div>
              <Badge access={p.access} />
            </div>
            <div>
              <div className="pk-pocket-title">{p.name}</div>
              <div className="pk-pocket-desc" style={{ marginTop: 4 }}>{p.desc}</div>
            </div>
            <div className="pk-pocket-tools">
              {p.featured.map((t, i) => (
                <React.Fragment key={t}>
                  <span>{t}</span>
                  {i < p.featured.length - 1 && <span className="sep">·</span>}
                </React.Fragment>
              ))}
            </div>
            <div className="pk-pocket-foot">
              <span>{p.count} tools</span>
              <span className="pk-arrow">Open →</span>
            </div>
          </a>
        ))}
      </div>
    </div>

    {/* WHY */}
    <div style={{ padding: '36px 56px 16px' }}>
      <div className="pk-section-title">Why PocketKit</div>
      <div className="pk-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          ['shield', 'Private by default', 'Local tools never upload your files. Your work stays on your device.'],
          ['install', 'Installable PWA', 'Add to Dock, taskbar, or home screen. Opens like any other app.'],
          ['offline', 'Works offline', 'Most tools keep working without a connection. No spinners on takeoff.'],
          ['inbox',   'Organized in pockets', 'No wall of 76 tools. Open the pocket for the job at hand.'],
        ].map(([ic, t, d]) => {
          const I = Icons[ic];
          return (
            <div key={t} className="pk-card" style={{ padding: 16 }}>
              <div style={{ width: 24, height: 24, color: 'var(--ink-2)', marginBottom: 12 }}><I /></div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{t}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.5 }}>{d}</div>
            </div>
          );
        })}
      </div>
    </div>

    {/* INSTALL strip */}
    <div style={{ padding: '20px 56px 28px' }}>
      <div className="pk-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div className="pk-mark pk-mark-lg" style={{ color: 'var(--ink)' }}><Icons.install /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Install PocketKit on this device</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>
            Add to Dock, taskbar, or home screen. Some platforms support direct pocket shortcuts.
          </div>
        </div>
        <button className="pk-btn">Add to home screen</button>
        <button className="pk-btn pk-btn-primary">Install on desktop</button>
      </div>
    </div>

    {/* FREE vs PRO */}
    <div style={{ padding: '0 56px 36px' }}>
      <div className="pk-section-title">Free and Pro</div>
      <div className="pk-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="pk-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span className="pk-badge pk-badge-free">Free</span>
            <span className="pk-mono" style={{ color: 'var(--ink-3)' }}>no account needed</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>PocketKit Daily</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.5 }}>
            Everyday tools — QR codes, image compression, passwords, PDFs, timers, calculators. Open and use immediately.
          </div>
          <div style={{ marginTop: 14 }}>
            <button className="pk-btn pk-btn-sm">Open Daily</button>
          </div>
        </div>
        <div className="pk-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span className="pk-badge pk-badge-pro">Pro</span>
            <span className="pk-mono" style={{ color: 'var(--ink-3)' }}>specialized workflows</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Pro pockets</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.5 }}>
            PDF, Image, Developer, QA, SEO, and Shop. Unlock when you need deeper workflows for a specific kind of work.
          </div>
          <div style={{ marginTop: 14 }}>
            <button className="pk-btn pk-btn-sm">See Pro pockets</button>
          </div>
        </div>
      </div>
    </div>

    {/* FOOTER */}
    <div style={{ padding: '20px 56px 28px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-3)' }}>
      <div>© 2026 PocketKit · pocketkit.app</div>
      <div style={{ display: 'flex', gap: 18 }}>
        <a style={{ color: 'inherit' }}>Privacy</a>
        <a style={{ color: 'inherit' }}>Changelog</a>
        <a style={{ color: 'inherit' }}>Source</a>
      </div>
    </div>
  </div>
);

// —— 2) Pocket detail — Daily (free) —————————————————————————

const PocketDaily = () => {
  const p = POCKETS[0];
  const tools = ['qr','imgc','pwd','mergepdf','comppdf','pomo','daysbtw','units','discount','split','random','wc','sig','imgfmt','cc'];
  return (
    <div className="pk pk-app">
      <Topbar active="pockets" />
      <div style={{ padding: '28px 48px 0' }}>
        <div className="pk-crumbs" style={{ marginBottom: 18 }}>
          <a>Pockets</a><span className="sep">/</span><span style={{ color: 'var(--ink)' }}>Daily</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 22 }}>
          <div className="pk-mark pk-mark-lg" style={{ color: p.accent }}>
            <PocketMark kind="daily" size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.015em', margin: 0 }}>PocketKit Daily</h1>
              <Badge access="free" />
              <span className="pk-badge"><Icons.offline /> Works offline</span>
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-2)', maxWidth: 620 }}>
              Useful common tools for everyone. No account, no uploads — open and use.
            </div>
          </div>
          <button className="pk-btn pk-btn-sm"><Icons.pin /> Pin pocket</button>
          <button className="pk-btn pk-btn-sm"><Icons.install /> Install</button>
        </div>

        {/* Search within pocket */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div className="pk-search" style={{ width: 320 }}>
            <Icons.search />
            <span>Search in Daily</span>
          </div>
          <div className="pk-chips">
            <button className="pk-chip is-active">All <span className="count">15</span></button>
            <button className="pk-chip">Generators <span className="count">3</span></button>
            <button className="pk-chip">Images <span className="count">3</span></button>
            <button className="pk-chip">PDF <span className="count">2</span></button>
            <button className="pk-chip">Text <span className="count">2</span></button>
            <button className="pk-chip">Time <span className="count">2</span></button>
            <button className="pk-chip">Math <span className="count">3</span></button>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 48px 12px' }}>
        <div className="pk-section-title">Recently used</div>
        <div className="pk-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 22 }}>
          {['qr','pwd','imgc'].map(id => <Tool key={id} id={id} />)}
        </div>

        <div className="pk-section-title">All tools in Daily</div>
        <div className="pk-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {tools.map(id => <Tool key={id} id={id} />)}
        </div>
      </div>

      <div style={{ padding: '24px 48px 24px', display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ink-3)', fontSize: 12 }}>
        <Icons.shield /> Local tools run in your browser. Nothing leaves your device.
      </div>
    </div>
  );
};

// —— 3) Pocket detail — Developer (Pro locked) ————————————————

const PocketDeveloperPro = () => {
  const p = POCKETS.find(x => x.id === 'developer');
  const tools = ['json','xml','yaml','csv','b64','urle','htmle','hash','hmac','jwt','cron','md','lorem','palette','regex','api'];
  return (
    <div className="pk pk-app">
      <Topbar active="pockets" />
      <div style={{ padding: '28px 48px 0' }}>
        <div className="pk-crumbs" style={{ marginBottom: 18 }}>
          <a>Pockets</a><span className="sep">/</span><span style={{ color: 'var(--ink)' }}>Developer</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
          <div className="pk-mark pk-mark-lg" style={{ color: p.accent }}>
            <PocketMark kind="developer" size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.015em', margin: 0 }}>PocketKit Developer</h1>
              <Badge access="pro" />
              <span className="pk-badge"><Icons.offline /> Works offline</span>
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-2)', maxWidth: 640 }}>
              Format, encode, decode, hash and debug — all locally in your browser. No data is sent anywhere.
            </div>
          </div>
        </div>

        {/* Soft Pro banner */}
        <div className="pk-pro-banner" style={{ marginBottom: 20 }}>
          <div className="pk-mark" style={{ color: 'var(--pro-ink)', background: 'transparent', border: '1px solid var(--pro-line)' }}>
            <Icons.sparkle />
          </div>
          <div className="pk-pro-banner-body">
            <strong>PocketKit Developer is a Pro pocket.</strong> Preview the tools below — unlocking will be added with accounts and payments. Tools you also have in <a style={{color:'inherit', textDecoration:'underline'}}>Daily</a> stay free.
          </div>
          <button className="pk-btn pk-btn-sm">Notify me</button>
          <button className="pk-btn pk-btn-primary pk-btn-sm"><Icons.unlock /> Unlock Developer</button>
        </div>

        {/* Pocket-only search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div className="pk-search" style={{ width: 320 }}>
            <Icons.search />
            <span>Search in Developer</span>
          </div>
          <div className="pk-chips">
            <button className="pk-chip is-active">All <span className="count">16</span></button>
            <button className="pk-chip">Format <span className="count">5</span></button>
            <button className="pk-chip">Encode <span className="count">3</span></button>
            <button className="pk-chip">Crypto <span className="count">3</span></button>
            <button className="pk-chip">Text <span className="count">2</span></button>
            <button className="pk-chip">Design <span className="count">1</span></button>
          </div>
        </div>
      </div>

      <div style={{ padding: '4px 48px 12px' }}>
        <div className="pk-section-title">Preview · {tools.length} tools</div>
        <div className="pk-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {tools.map(id => <Tool key={id} id={id} locked />)}
        </div>
      </div>

      <div style={{ padding: '20px 48px 24px', display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ink-3)', fontSize: 12 }}>
        <Icons.shield /> Pro pockets run in your browser like Daily. Pro unlocks the workflow, not the privacy.
      </div>
    </div>
  );
};

// —— 4) All Tools page —————————————————————————————————

const AllTools = () => {
  // 24 picked tools — enough to feel full but legible
  const ids = ['qr','imgc','pwd','mergepdf','comppdf','json','regex','b64','jwt','md','metat','og',
               'invoice','rcpt','vat','units','split','pomo','daysbtw','hash','uuid','bug','slug','xml'];
  return (
    <div className="pk pk-app">
      <Topbar active="all" />
      <div style={{ padding: '28px 48px 0' }}>
        <div className="pk-crumbs" style={{ marginBottom: 16 }}>
          <a>Home</a><span className="sep">/</span><span style={{ color: 'var(--ink)' }}>All tools</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.015em', margin: '0 0 6px' }}>All tools</h1>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>76 tools across 7 pockets. Search or filter by pocket.</div>
          </div>
          <div className="pk-search" style={{ width: 360 }}>
            <Icons.search />
            <span>Search all tools</span>
            <kbd>⌘ K</kbd>
          </div>
        </div>

        {/* Pocket filter chips */}
        <div className="pk-chips" style={{ marginBottom: 8 }}>
          <button className="pk-chip is-active">All <span className="count">76</span></button>
          {POCKETS.map(p => (
            <button key={p.id} className="pk-chip">
              <PocketMark kind={p.id} size={12} /> {p.name.replace('PocketKit ', '')} <span className="count">{p.count}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0 14px' }}>
          <div className="pk-mono" style={{ color: 'var(--ink-3)' }}>Sort:</div>
          <div className="pk-chips">
            <button className="pk-chip is-active">A–Z</button>
            <button className="pk-chip">Recently used</button>
            <button className="pk-chip">Most used</button>
            <button className="pk-chip">By pocket</button>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 48px 12px' }}>
        <div className="pk-section-title">Recently used</div>
        <div className="pk-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 22 }}>
          {['qr','json','pwd','vat','og','imgc'].map(id => (
            <ToolWithPocket key={id} id={id} />
          ))}
        </div>

        <div className="pk-section-title">Library</div>
        <div className="pk-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
          {ids.map(id => <ToolWithPocket key={id} id={id} />)}
        </div>
      </div>

      <div style={{ padding: '20px 48px 24px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 12 }}>
        Showing 30 of 76 tools · <a style={{ color: 'var(--ink-2)' }}>Show all</a>
      </div>
    </div>
  );
};

const ToolWithPocket = ({ id }) => {
  const t = TOOL_LIB[id];
  if (!t) return null;
  const Icon = Icons[t.icon] || Icons.text;
  const pocket = POCKETS.find(p => p.id === t.pocket);
  return (
    <div className="pk-tool" style={{ padding: '10px 12px' }}>
      <div className="pk-tool-icon" style={{ width: 26, height: 26 }}><Icon /></div>
      <div className="pk-tool-body">
        <div className="pk-tool-name" style={{ fontSize: 12.5 }}>{t.name}</div>
        <div className="pk-tool-meta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: pocket?.accent }}><PocketMark kind={t.pocket} size={10} /></span>
          {pocket?.name.replace('PocketKit ', '')}
          {t.access === 'pro' && <span style={{ color: 'var(--pro-ink)' }}>· Pro</span>}
        </div>
      </div>
    </div>
  );
};

// —— 5) Tool page (header + tool surface) —————————————————

const ToolPage = () => (
  <div className="pk pk-app">
    <Topbar active="all" />
    <div style={{ padding: '24px 48px 0' }}>
      <div className="pk-crumbs" style={{ marginBottom: 12 }}>
        <a>Home</a><span className="sep">/</span>
        <a>Pockets</a><span className="sep">/</span>
        <a>QA</a><span className="sep">/</span>
        <span style={{ color: 'var(--ink)' }}>Bug Report Formatter</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
        <div className="pk-mark pk-mark-lg" style={{ color: 'var(--ink)' }}>
          <Icons.bug />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em', margin: 0 }}>Bug Report Formatter</h1>
            <Badge access="pro" />
            <span className="pk-badge"><Icons.offline /> Works offline</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
            Paste rough notes → get a structured bug report with steps, environment, and expected vs actual.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="pk-btn pk-btn-sm"><Icons.pin /> Pin this tool</button>
          <button className="pk-btn pk-btn-sm"><Icons.copy /> Copy link</button>
          <button className="pk-btn pk-btn-ghost pk-btn-sm" style={{ width: 32, padding: 0 }}><Icons.more /></button>
        </div>
      </div>

      {/* In-pocket nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottom: '1px solid var(--line)' }}>
        <span className="pk-mono" style={{ color: 'var(--ink-3)' }}>QA pocket:</span>
        <div className="pk-chips">
          <button className="pk-chip">Dummy users</button>
          <button className="pk-chip">UUID</button>
          <button className="pk-chip">Regex</button>
          <button className="pk-chip is-active">Bug report</button>
          <button className="pk-chip">Timestamp</button>
          <button className="pk-chip">Test case</button>
          <button className="pk-chip" style={{ color: 'var(--ink-3)' }}>+5</button>
        </div>
      </div>
    </div>

    {/* Tool body (compact placeholder) */}
    <div style={{ padding: '18px 48px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <div className="pk-card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Rough notes</div>
          <div className="pk-mono" style={{ color: 'var(--ink-3)' }}>plain text</div>
        </div>
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 8, padding: 12, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55, fontFamily: '"IBM Plex Mono", ui-monospace, monospace', minHeight: 180 }}>
          login on staging broken{'\n'}clicked submit → spinner forever{'\n'}console says 500 from /auth{'\n'}safari 17 + macOS 14{'\n'}happens every time
        </div>
      </div>
      <div className="pk-card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Formatted report</div>
          <button className="pk-btn pk-btn-sm"><Icons.copy /> Copy</button>
        </div>
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 8, padding: 12, fontSize: 12, color: 'var(--ink)', lineHeight: 1.6, fontFamily: '"IBM Plex Mono", ui-monospace, monospace', minHeight: 180 }}>
          <div><b>Title</b> · Login flow hangs on /auth (staging)</div>
          <div style={{ marginTop: 8 }}><b>Environment</b></div>
          <div>· Safari 17 · macOS 14 · Staging</div>
          <div style={{ marginTop: 8 }}><b>Steps</b></div>
          <div>1. Open /login</div>
          <div>2. Submit credentials</div>
          <div style={{ marginTop: 8 }}><b>Expected</b> · Auth completes</div>
          <div><b>Actual</b> · Spinner; /auth returns 500</div>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { Landing, PocketDaily, PocketDeveloperPro, AllTools, ToolPage });
