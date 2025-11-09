import { useEffect, useMemo, useState } from 'react';
import { fetchCourses as fetchCanvasCourses, setCanvasBaseUrl, getCanvasBaseUrl } from '@/api/canvas';
import { fetchCourses as fetchGradescopeCourses } from '@/api/gradescope';
import { fetchEvents as fetchCalendarEvents } from '@/api/calendar';

const STORAGE_KEYS = {
  canvas: 'nexus_canvas_token',
  gradescope: 'nexus_gradescope_token',
  calendar: 'nexus_calendar_token',
} as const;

const DEFAULT_CANVAS_PROXY = (import.meta as any)?.env?.VITE_CANVAS_PROXY_URL || 'http://localhost:5174/api/canvas';

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

type ServiceKey = keyof typeof STORAGE_KEYS;

interface ServiceConfig {
  key: ServiceKey;
  name: string;
  description: string;
  placeholder: string;
  test: (token: string) => Promise<void>;
  docs?: string;
}

const CANVAS_BASE_STORAGE_KEY = 'nexus_canvas_base_url';

const baseErrorMessage = (service: ServiceKey, err: any) => {
  const message = err?.message || 'Connection failed. Check console for details.';
  if (service === 'canvas' && /Failed to fetch/i.test(message)) {
    return `${message}\nCanvas often blocks cross-origin requests. If you're running this locally, configure a proxy (set VITE_CANVAS_BASE_URL or enter a base URL that points to your proxy).`;
  }
  if (service === 'canvas' && /401|403/.test(message)) {
    return `${message}\nVerify the token was generated for the Canvas domain below and includes course/assignment read permissions.`;
  }
  return message;
};

interface ServiceRuntimeConfig extends ServiceConfig {
  test: (token: string) => Promise<void>;
}

const servicesBase: Omit<ServiceConfig, 'test'>[] = [
  {
    key: 'canvas',
    name: 'Canvas',
    description:
      'Paste a Canvas API token with read access to courses and assignments. Nexus uses it to pull your current classes and due dates.',
    placeholder: 'Canvas API token (starts with "~" or long random string)',
    docs: 'https://community.canvaslms.com/t5/Instructor-Guide/How-do-I-generate-a-global-access-token-for-an-account/ta-p/176',
  },
  {
    key: 'gradescope',
    name: 'Gradescope',
    description:
      'Provide your Gradescope session cookie or bearer token. Nexus can then list assignments, pull descriptions, and summarize rubrics.',
    placeholder: 'Gradescope session cookie or bearer token',
    test: async (token: string) => {
      await fetchGradescopeCourses(token);
    },
    docs: 'https://gradescope-autograder-docs.readthedocs.io/en/latest/getting_started/#access-tokens',
  },
  {
    key: 'calendar',
    name: 'Google Calendar',
    description:
      'Connect an OAuth token with calendar scope so Nexus can create and update events that mirror your academic schedule.',
    placeholder: 'Google OAuth access token (calendar scope)',
    test: async (token: string) => {
      await fetchCalendarEvents(token);
    },
    docs: 'https://developers.google.com/calendar/api/v3/reference',
  },
];

function loadToken(key: ServiceKey) {
  return localStorage.getItem(STORAGE_KEYS[key]) ?? '';
}

function saveToken(key: ServiceKey, value: string) {
  if (!value) {
    localStorage.removeItem(STORAGE_KEYS[key]);
  } else {
    localStorage.setItem(STORAGE_KEYS[key], value);
  }
}

export default function Integrations() {
  const [tokens, setTokens] = useState<Record<ServiceKey, string>>({
    canvas: '',
    gradescope: '',
    calendar: '',
  });
  const [status, setStatus] = useState<Record<ServiceKey, ConnectionStatus>>({
    canvas: 'idle',
    gradescope: 'idle',
    calendar: 'idle',
  });
  const [errors, setErrors] = useState<Record<ServiceKey, string | null>>({
    canvas: null,
    gradescope: null,
    calendar: null,
  });
  const [canvasBase, setCanvasBase] = useState<string>('');

  useEffect(() => {
    setTokens({
      canvas: loadToken('canvas'),
      gradescope: loadToken('gradescope'),
      calendar: loadToken('calendar'),
    });
    try {
      const storedBase = localStorage.getItem(CANVAS_BASE_STORAGE_KEY) || '';
      const currentBase = storedBase || getCanvasBaseUrl();
      setCanvasBase(currentBase);
      if (storedBase) setCanvasBaseUrl(storedBase);
    } catch (err) {
      setCanvasBase(getCanvasBaseUrl());
    }
  }, []);

  const handleChange = (key: ServiceKey, value: string) => {
    setTokens(prev => ({ ...prev, [key]: value }));
    setStatus(prev => ({ ...prev, [key]: 'idle' }));
    setErrors(prev => ({ ...prev, [key]: null }));
  };

  const handleCanvasBaseChange = (value: string) => {
    setCanvasBase(value);
  };

  const persistCanvasBase = (value: string) => {
    const trimmed = value.trim();
    if (trimmed) {
      setCanvasBaseUrl(trimmed);
      localStorage.setItem(CANVAS_BASE_STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(CANVAS_BASE_STORAGE_KEY);
      setCanvasBaseUrl(getCanvasBaseUrl());
    }
  };

  const handleSave = (key: ServiceKey) => {
    saveToken(key, tokens[key]);
    if (key === 'canvas') {
      persistCanvasBase(canvasBase);
    }
    setStatus(prev => ({ ...prev, [key]: 'success' }));
    setTimeout(() => {
      setStatus(prev => ({ ...prev, [key]: 'idle' }));
    }, 2000);
  };

  const handleTest = async (key: ServiceKey) => {
    const token = tokens[key].trim();
    if (!token) {
      setErrors(prev => ({ ...prev, [key]: 'Enter a token before testing.' }));
      return;
    }
    setStatus(prev => ({ ...prev, [key]: 'testing' }));
    setErrors(prev => ({ ...prev, [key]: null }));
    try {
      const service = services.find(s => s.key === key);
      if (!service) throw new Error('Service not found');
      await service.test(token);
      setStatus(prev => ({ ...prev, [key]: 'success' }));
    } catch (err: any) {
      setStatus(prev => ({ ...prev, [key]: 'error' }));
      const message = baseErrorMessage(key, err);
      setErrors(prev => ({ ...prev, [key]: message }));
      console.error(`[integrations] ${key} test failed`, err);
    }
  };

  const services: ServiceRuntimeConfig[] = useMemo(() => [
    {
      ...(servicesBase.find(s => s.key === 'canvas') as ServiceConfig),
      test: async (token: string) => {
        const base = canvasBase.trim();
        if (base) {
          setCanvasBaseUrl(base);
          localStorage.setItem(CANVAS_BASE_STORAGE_KEY, base);
        }
        const proxyBase = DEFAULT_CANVAS_PROXY.replace(/\/$/, '');
        const headers: Record<string, string> = {
          Authorization: token.startsWith('Bearer') ? token : `Bearer ${token}`,
        };
        const query = base ? `?baseUrl=${encodeURIComponent(base)}` : '';
        const url = `${proxyBase}/courses${query}`;
        const res = await fetch(url, {
          headers,
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Proxy request failed (${res.status})`);
        }
        let data: unknown;
        try {
          data = await res.json();
        } catch (parseError) {
          throw new Error('Canvas returned an unexpected response. Confirm the base URL points to the API (e.g., https://your-school.instructure.com/api/v1).');
        }
        if (!Array.isArray(data)) {
          throw new Error('Canvas response did not include a course list. Double-check your token permissions.');
        }
      },
    },
    {
      ...(servicesBase.find(s => s.key === 'gradescope') as ServiceConfig),
      test: async (token: string) => {
        await fetchGradescopeCourses(token);
      },
    },
    {
      ...(servicesBase.find(s => s.key === 'calendar') as ServiceConfig),
      test: async (token: string) => {
        await fetchCalendarEvents(token);
      },
    },
  ], [canvasBase]);

  return (
    <div className="integrations-page">
      <header className="nx-section">
        <h1>Connect your learning tools</h1>
        <p className="nx-subtle">Store API tokens locally so Nexus can sync assignments, grades, and events. Tokens never leave your browser in this demo build.</p>
      </header>

      <section className="integrations-grid">
        {services.map(service => (
          <article key={service.key} className="integration-card">
            <header>
              <h2>{service.name}</h2>
              {service.docs && (
                <a href={service.docs} target="_blank" rel="noopener noreferrer" className="nx-link">
                  View setup guide
                </a>
              )}
            </header>
            <p className="nx-subtle">{service.description}</p>
            <label htmlFor={`${service.key}-token`} className="nx-field-label">
              API token / credential
            </label>
            <textarea
              id={`${service.key}-token`}
              className="nx-textarea"
              rows={3}
              placeholder={service.placeholder}
              value={tokens[service.key]}
              onChange={e => handleChange(service.key, e.target.value)}
            />
            {service.key === 'canvas' && (
              <div className="canvas-base">
                <label htmlFor="canvas-base" className="nx-field-label">Canvas API base URL</label>
                <input
                  id="canvas-base"
                  className="nx-textarea"
                  value={canvasBase}
                  onChange={e => handleCanvasBaseChange(e.target.value)}
                  placeholder="https://your-school.instructure.com/api/v1"
                />
                <p className="nx-subtle small">Use your institution&apos;s Canvas API base URL or point to a proxy that handles CORS.</p>
              </div>
            )}
            <div className="integration-actions">
              <button className="nx-btn" onClick={() => handleSave(service.key)}>
                Save locally
              </button>
              <button className="nx-btn-outline" onClick={() => handleTest(service.key)} disabled={status[service.key] === 'testing'}>
                {status[service.key] === 'testing' ? 'Testing…' : 'Test connection'}
              </button>
            </div>
            {status[service.key] === 'success' && <p className="nx-success">Looks good! Token saved.</p>}
            {status[service.key] === 'error' && errors[service.key] && <p className="nx-error">{errors[service.key]}</p>}
            {status[service.key] === 'idle' && tokens[service.key] && <p className="nx-subtle">Saved locally on this device.</p>}
          </article>
        ))}
      </section>

      <section className="nx-panel muted">
        <h3>How it works</h3>
        <ol className="nx-list">
          <li>Generate read-only tokens from Canvas, Gradescope, and Google Calendar.</li>
          <li>Paste each token above and hit “Save locally”. Tokens are stored in <code>localStorage</code> only.</li>
          <li>Use “Test connection” to confirm Nexus can read assignments and events.</li>
          <li>Once connected, the dashboard will keep your assignments and calendar in sync automatically.</li>
        </ol>
        <p className="nx-subtle small">For production, move token storage server-side or use OAuth flows. This demo keeps everything client-side for simplicity.</p>
      </section>
    </div>
  );
}
