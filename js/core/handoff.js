const HANDOFF_KEY = 'pk-handoff';

export function setHandoff(targetTool, value, label = 'input') {
  if (!targetTool || !value) return;
  try {
    localStorage.setItem(HANDOFF_KEY, JSON.stringify({
      targetTool,
      value,
      label,
      createdAt: Date.now(),
    }));
  } catch {}
}

export function consumeHandoff(toolId, maxAgeMs = 10 * 60 * 1000) {
  try {
    const raw = localStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.targetTool !== toolId) return null;
    localStorage.removeItem(HANDOFF_KEY);
    if (!data.createdAt || Date.now() - data.createdAt > maxAgeMs) return null;
    return data;
  } catch {
    return null;
  }
}
