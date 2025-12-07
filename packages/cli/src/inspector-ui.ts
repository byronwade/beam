/**
 * Inspector Web UI - serves a real-time request inspector interface
 */

export function getInspectorHTML(targetPort: number, proxyPort: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Beam Inspector - localhost:${targetPort}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #e5e5e5;
      min-height: 100vh;
    }
    .header {
      background: #171717;
      border-bottom: 1px solid #262626;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo svg {
      width: 28px;
      height: 28px;
    }
    .logo h1 {
      font-size: 18px;
      font-weight: 600;
    }
    .logo span {
      color: #737373;
      font-size: 14px;
    }
    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #262626;
      border-radius: 8px;
      font-size: 13px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .container {
      display: flex;
      height: calc(100vh - 65px);
    }
    .requests-list {
      width: 400px;
      border-right: 1px solid #262626;
      overflow-y: auto;
      flex-shrink: 0;
    }
    .request-item {
      padding: 12px 16px;
      border-bottom: 1px solid #262626;
      cursor: pointer;
      transition: background 0.15s;
    }
    .request-item:hover {
      background: #171717;
    }
    .request-item.selected {
      background: #1e3a5f;
      border-left: 3px solid #3b82f6;
    }
    .request-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .method {
      font-weight: 600;
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 4px;
      min-width: 50px;
      text-align: center;
    }
    .method.GET { background: #064e3b; color: #34d399; }
    .method.POST { background: #1e3a5f; color: #60a5fa; }
    .method.PUT { background: #4c1d95; color: #a78bfa; }
    .method.DELETE { background: #7f1d1d; color: #f87171; }
    .method.PATCH { background: #713f12; color: #fbbf24; }
    .path {
      font-size: 13px;
      color: #e5e5e5;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }
    .request-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: #737373;
    }
    .status-badge {
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
    }
    .status-2xx { background: #064e3b; color: #34d399; }
    .status-3xx { background: #164e63; color: #22d3ee; }
    .status-4xx { background: #713f12; color: #fbbf24; }
    .status-5xx { background: #7f1d1d; color: #f87171; }
    .detail-panel {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #737373;
    }
    .empty-state svg {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      border-bottom: 1px solid #262626;
      padding-bottom: 8px;
    }
    .tab {
      padding: 8px 16px;
      background: none;
      border: none;
      color: #737373;
      cursor: pointer;
      font-size: 14px;
      border-radius: 6px;
      transition: all 0.15s;
    }
    .tab:hover {
      color: #e5e5e5;
      background: #262626;
    }
    .tab.active {
      color: #e5e5e5;
      background: #262626;
    }
    .section {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #737373;
      margin-bottom: 12px;
    }
    .headers-table {
      width: 100%;
      font-size: 13px;
    }
    .headers-table tr {
      border-bottom: 1px solid #262626;
    }
    .headers-table td {
      padding: 8px 0;
      vertical-align: top;
    }
    .headers-table td:first-child {
      color: #a78bfa;
      font-weight: 500;
      width: 200px;
    }
    .headers-table td:last-child {
      color: #e5e5e5;
      word-break: break-all;
    }
    .body-content {
      background: #171717;
      border-radius: 8px;
      padding: 16px;
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 13px;
      line-height: 1.5;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .replay-btn {
      padding: 8px 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s;
    }
    .replay-btn:hover {
      background: #2563eb;
    }
    .clear-btn {
      padding: 8px 16px;
      background: #262626;
      color: #e5e5e5;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .clear-btn:hover {
      background: #404040;
    }
    .actions {
      display: flex;
      gap: 8px;
    }
    .request-count {
      background: #262626;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      color: #a3a3a3;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
      <div>
        <h1>Beam Inspector</h1>
        <span>localhost:${targetPort} via :${proxyPort}</span>
      </div>
    </div>
    <div class="actions">
      <span class="request-count" id="requestCount">0 requests</span>
      <button class="clear-btn" onclick="clearRequests()">Clear</button>
      <div class="status">
        <div class="status-dot"></div>
        Listening
      </div>
    </div>
  </div>

  <div class="container">
    <div class="requests-list" id="requestsList">
      <div class="empty-state" id="emptyState">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        <p>Waiting for requests...</p>
        <p style="font-size: 12px; margin-top: 8px;">Make a request to your tunnel URL</p>
      </div>
    </div>

    <div class="detail-panel" id="detailPanel">
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
        </svg>
        <p>Select a request to view details</p>
      </div>
    </div>
  </div>

  <script>
    let requests = [];
    let selectedId = null;

    function formatTime(date) {
      return new Date(date).toLocaleTimeString('en-US', { hour12: false });
    }

    function getStatusClass(status) {
      if (status >= 500) return 'status-5xx';
      if (status >= 400) return 'status-4xx';
      if (status >= 300) return 'status-3xx';
      return 'status-2xx';
    }

    function formatBody(body, contentType) {
      if (!body) return '<em style="color: #737373">No body</em>';
      try {
        if (contentType && contentType.includes('application/json')) {
          return JSON.stringify(JSON.parse(body), null, 2);
        }
      } catch {}
      return body;
    }

    function renderRequests() {
      const list = document.getElementById('requestsList');
      const emptyState = document.getElementById('emptyState');
      const countEl = document.getElementById('requestCount');

      countEl.textContent = requests.length + ' request' + (requests.length !== 1 ? 's' : '');

      if (requests.length === 0) {
        emptyState.style.display = 'flex';
        list.innerHTML = '';
        list.appendChild(emptyState);
        return;
      }

      emptyState.style.display = 'none';
      list.innerHTML = requests.map(req => \`
        <div class="request-item \${selectedId === req.id ? 'selected' : ''}" onclick="selectRequest('\${req.id}')">
          <div class="request-header">
            <span class="method \${req.method}">\${req.method}</span>
            <span class="path">\${req.path}</span>
          </div>
          <div class="request-meta">
            <span>\${formatTime(req.timestamp)}</span>
            \${req.response ? \`
              <span class="status-badge \${getStatusClass(req.response.status)}">\${req.response.status}</span>
              <span>\${req.response.duration}ms</span>
            \` : '<span style="color: #fbbf24">pending...</span>'}
          </div>
        </div>
      \`).join('');
    }

    function selectRequest(id) {
      selectedId = id;
      renderRequests();

      const req = requests.find(r => r.id === id);
      if (!req) return;

      const panel = document.getElementById('detailPanel');
      const reqHeaders = Object.entries(req.headers || {})
        .map(([k, v]) => \`<tr><td>\${k}</td><td>\${Array.isArray(v) ? v.join(', ') : v}</td></tr>\`)
        .join('');
      const resHeaders = req.response ? Object.entries(req.response.headers || {})
        .map(([k, v]) => \`<tr><td>\${k}</td><td>\${Array.isArray(v) ? v.join(', ') : v}</td></tr>\`)
        .join('') : '';

      panel.innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <span class="method \${req.method}" style="font-size: 14px; padding: 4px 12px;">\${req.method}</span>
            <span style="margin-left: 12px; font-size: 16px;">\${req.path}</span>
          </div>
          <button class="replay-btn" onclick="replayRequest('\${req.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            Replay
          </button>
        </div>

        <div class="tabs">
          <button class="tab active" onclick="showTab(this, 'request')">Request</button>
          <button class="tab" onclick="showTab(this, 'response')">Response</button>
        </div>

        <div id="request-tab">
          <div class="section">
            <div class="section-title">Headers</div>
            <table class="headers-table">
              \${reqHeaders || '<tr><td colspan="2" style="color: #737373">No headers</td></tr>'}
            </table>
          </div>

          <div class="section">
            <div class="section-title">Body</div>
            <div class="body-content">\${formatBody(req.body, req.headers['content-type'])}</div>
          </div>
        </div>

        <div id="response-tab" style="display: none;">
          \${req.response ? \`
            <div class="section">
              <div class="section-title">Status</div>
              <span class="status-badge \${getStatusClass(req.response.status)}" style="font-size: 14px; padding: 4px 12px;">
                \${req.response.status}
              </span>
              <span style="margin-left: 8px; color: #737373">\${req.response.duration}ms</span>
            </div>

            <div class="section">
              <div class="section-title">Headers</div>
              <table class="headers-table">
                \${resHeaders || '<tr><td colspan="2" style="color: #737373">No headers</td></tr>'}
              </table>
            </div>

            <div class="section">
              <div class="section-title">Body</div>
              <div class="body-content">\${formatBody(req.response.body, req.response.headers['content-type'])}</div>
            </div>
          \` : '<div class="empty-state"><p>Response pending...</p></div>'}
        </div>
      \`;
    }

    function showTab(btn, tab) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('request-tab').style.display = tab === 'request' ? 'block' : 'none';
      document.getElementById('response-tab').style.display = tab === 'response' ? 'block' : 'none';
    }

    function clearRequests() {
      requests = [];
      selectedId = null;
      renderRequests();
      document.getElementById('detailPanel').innerHTML = \`
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
          </svg>
          <p>Select a request to view details</p>
        </div>
      \`;
      fetch('/__beam__/clear', { method: 'POST' });
    }

    async function replayRequest(id) {
      const req = requests.find(r => r.id === id);
      if (!req) return;

      try {
        await fetch(req.path, {
          method: req.method,
          headers: req.headers,
          body: req.body || undefined,
        });
      } catch (e) {
        console.error('Replay failed:', e);
      }
    }

    // Poll for new requests
    async function pollRequests() {
      try {
        const res = await fetch('/__beam__/requests');
        const data = await res.json();
        requests = data;
        renderRequests();
        if (selectedId) {
          const stillExists = requests.find(r => r.id === selectedId);
          if (stillExists) selectRequest(selectedId);
        }
      } catch (e) {
        console.error('Poll failed:', e);
      }
      setTimeout(pollRequests, 500);
    }

    pollRequests();
  </script>
</body>
</html>`;
}
