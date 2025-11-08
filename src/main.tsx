import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
// Note: App, store and providers are imported dynamically below so that
// this module can install an error overlay and log before any failing
// module evaluation prevents this file from running.

const rootEl = document.getElementById('root');
console.log('[nexus] main.tsx boot', { rootEl });
// Install a simple on-page error overlay so runtime errors are visible even when DevTools
// aren't open. This helps triage a blank page quickly in dev.
function showErrorOverlay(message: string) {
  try {
    let el = document.getElementById('nexus-error-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'nexus-error-overlay';
      Object.assign((el as HTMLElement).style, {
        position: 'fixed',
        left: '0',
        right: '0',
        top: '0',
        padding: '12px 16px',
        background: 'rgba(180, 28, 28, 0.95)',
        color: 'white',
        fontFamily: 'monospace',
        zIndex: '99999',
        whiteSpace: 'pre-wrap',
        maxHeight: '40vh',
        overflow: 'auto',
      });
      document.body.appendChild(el);
    }
    el.textContent = `[nexus error] ${message}`;
  } catch (e) {
    // ignore overlay failures
    // eslint-disable-next-line no-console
    console.error('Failed to show error overlay', e);
  }
}

// Expose to window so other code (and the mount catch) can call it if needed.
(window as any).showErrorOverlay = showErrorOverlay;

window.addEventListener('error', (ev) => {
  showErrorOverlay(String(ev.error ?? ev.message ?? 'Unknown error'));
});
window.addEventListener('unhandledrejection', (ev) => {
  showErrorOverlay(String((ev.reason && ev.reason.message) || ev.reason || 'Unhandled rejection'));
});
// Use an async IIFE to dynamically import app modules so any import/runtime
// errors can be surfaced via the overlay registered above.
(async () => {
  try {
    if (!rootEl) throw new Error('Root element not found');

    // Dynamic imports
    const [{ default: App }, { Provider }, storeModule, { AuthProvider }] = await Promise.all([
      import('./App') as Promise<any>,
      import('react-redux') as Promise<any>,
      import('./redux/store') as Promise<any>,
      import('./contexts/AuthContext') as Promise<any>,
    ]);

    const store = storeModule.default ?? storeModule;

    createRoot(rootEl).render(
      <StrictMode>
        <Provider store={store}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </Provider>
      </StrictMode>
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[nexus] Failed to mount app', e);
    try {
      // show overlay if possible
      const fn = (window as any).showErrorOverlay;
      if (typeof fn === 'function') fn(String(e));
    } catch {}
  }
})();