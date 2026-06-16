const KEY = 'fieldops_offline_queue';

export function enqueue(entry) {
  const q = getQueue();
  q.push({ ...entry, _queued_at: new Date().toISOString() });
  localStorage.setItem(KEY, JSON.stringify(q));
}

export function getQueue() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function clearQueue() {
  localStorage.removeItem(KEY);
}

export async function flushQueue() {
  const q = getQueue();
  if (!q.length) return 0;
  const results = await Promise.allSettled(
    q.map(entry =>
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      })
    )
  );
  const succeeded = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
  if (succeeded === q.length) clearQueue();
  return succeeded;
}
