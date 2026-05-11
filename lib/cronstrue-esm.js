// cronstrue v3.14.0 ships as a UMD bundle — not a native ES module.
// This shim loads it via a <script> tag (which triggers the UMD's global-assign
// branch: t.cronstrue = factory(), where t = globalThis), then re-exports the
// result so tool modules can use a standard ES import.
//
// import.meta.url keeps the path relative to this file → works fully offline,
// no CDN request is ever made.

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload  = resolve;
    s.onerror = () => reject(new Error(`cronstrue-esm: failed to load ${src}`));
    document.head.appendChild(s);
  });
}

const scriptUrl = new URL('./cronstrue.min.js', import.meta.url).href;
if (!globalThis.cronstrue) await loadScript(scriptUrl);

export const cronstrue = globalThis.cronstrue;
export default cronstrue;
