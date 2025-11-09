import { useMemo, useEffect, useState, useRef } from 'react';
import useAssignments from '@/hooks/useAssignments';
import AssignmentCard from '@/components/AssignmentCard';
import type { UnifiedAssignment } from '@/utils/normalizeAssignments';
import { supabase } from '@/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const formatDueDate = (due?: string | null) => {
  if (!due) return 'No due date';
  const date = new Date(due);
  if (Number.isNaN(date.getTime())) return 'No due date';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const groupByCourse = (assignments: UnifiedAssignment[]) => {
  const byCourse = new Map<string, { courseId?: number; source: string; items: UnifiedAssignment[] }>();

  assignments.forEach((assignment) => {
    const key = `${assignment.source}:${assignment.courseId ?? 'uncategorized'}`;
    const entry = byCourse.get(key) ?? {
      courseId: assignment.courseId,
      source: assignment.source,
      items: [],
    };
    entry.items.push(assignment);
    byCourse.set(key, entry);
  });

  return Array.from(byCourse.values()).sort((a, b) => {
    const nameA = `${a.source}-${a.courseId ?? 0}`;
    const nameB = `${b.source}-${b.courseId ?? 0}`;
    return nameA.localeCompare(nameB);
  });
};

const sourceLabel: Record<string, string> = {
  canvas: 'Canvas',
  gradescope: 'Gradescope',
};

const DEFAULT_CANVAS_BASE_FALLBACK = 'https://princeton.instructure.com/api/v1';

const normalizeCanvasBaseUrl = (value: string) => {
  const fallback = DEFAULT_CANVAS_BASE_FALLBACK;
  if (!value) return fallback;
  let url = value.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'canvas.princeton.edu') {
      parsed.hostname = 'princeton.instructure.com';
    }
    url = parsed.toString();
  } catch (err) {
    // ignore invalid URL and continue with string manipulation fallback
  }
  url = url.replace(/\/+$/, '');
  if (!/\/api\/v1$/i.test(url)) {
    url = `${url}/api/v1`;
  }
  return url;
};

export default function Assignments() {
  const DEFAULT_BASE_URL = normalizeCanvasBaseUrl((import.meta as any)?.env?.VITE_CANVAS_BASE_URL || DEFAULT_CANVAS_BASE_FALLBACK);

  const { userId: supabaseUserId } = useAuth();
  const [reloadKey, setReloadKey] = useState(0);
  const { assignments, loading, error } = useAssignments(reloadKey);

  const [token, setToken] = useState('');
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [syncFeedback, setSyncFeedback] = useState<{ message: string; tone: 'info' | 'success' | 'error' } | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [icsFeedback, setIcsFeedback] = useState<{ message: string; tone: 'info' | 'success' | 'error' } | null>(null);
  const [icsLoading, setIcsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('nexus_canvas_token') || '';
      const savedBaseRaw = localStorage.getItem('nexus_canvas_base_url');
      setToken(savedToken);
      setBaseUrl(normalizeCanvasBaseUrl(savedBaseRaw || DEFAULT_BASE_URL));
    } catch (err) {
      console.error('[assignments] failed to load saved Canvas settings', err);
    }
  }, [DEFAULT_BASE_URL]);

  const handleSaveSettings = () => {
    const normalizedBase = normalizeCanvasBaseUrl(baseUrl);
    setBaseUrl(normalizedBase);
    localStorage.setItem('nexus_canvas_token', token.trim());
    localStorage.setItem('nexus_canvas_base_url', normalizedBase);
    setSyncFeedback({ message: 'Canvas settings saved locally.', tone: 'success' });
  };

  const handleSyncFromCanvas = async () => {
    if (!supabaseUserId) {
      setSyncFeedback({ message: 'Log in to sync assignments.', tone: 'error' });
      return;
    }

    if (!token.trim()) {
      setSyncFeedback({ message: 'Enter a Canvas API token before syncing.', tone: 'error' });
      return;
    }

    setSyncLoading(true);
    setSyncFeedback(null);
    try {
      const normalizedBase = normalizeCanvasBaseUrl(baseUrl);
      setBaseUrl(normalizedBase);
      const response = await fetch('/api/canvas/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), baseUrl: normalizedBase || undefined, userId: supabaseUserId }),
      });
      const raw = await response.text();
      let payload: any = {};
      if (raw) {
        try {
          payload = JSON.parse(raw);
        } catch (parseErr) {
          console.warn('[canvas-sync] failed to parse response JSON', parseErr, raw);
          payload = { error: raw };
        }
      }
      if (!response.ok) {
        const payloadError =
          (typeof payload?.error === 'string' && payload.error.trim()) ||
          (payload?.error && typeof payload.error.message === 'string' && payload.error.message.trim()) ||
          (raw && raw.trim());
        const statusHint = `Canvas sync failed (status ${response.status}) via ${normalizedBase}`;
        throw new Error(payloadError || statusHint);
      }
      setSyncFeedback({ message: `Synced ${payload.count ?? 0} assignments from Canvas.`, tone: 'success' });
      setReloadKey((prev) => prev + 1);
    } catch (err: any) {
      setSyncFeedback({ message: err?.message ?? 'Canvas sync failed', tone: 'error' });
    } finally {
      setSyncLoading(false);
    }
  };

  const decodeIcsText = (text: string) => text.replace(/\\n/g, '\n').replace(/\\,/g, ',');

  const parseIcsDate = (value: string) => {
    const date = value.trim();
    if (/^\d{8}T\d{6}Z$/.test(date)) {
      const iso = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${date.slice(9, 11)}:${date.slice(11, 13)}:${date.slice(13, 15)}Z`;
      return new Date(iso).toISOString();
    }
    if (/^\d{8}T\d{6}$/.test(date)) {
      const iso = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${date.slice(9, 11)}:${date.slice(11, 13)}:${date.slice(13, 15)}`;
      return new Date(iso).toISOString();
    }
    if (/^\d{8}$/.test(date)) {
      const iso = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
      return new Date(iso).toISOString();
    }
    return null;
  };

  const parseIcs = (icsText: string) => {
    const unfolded = icsText.replace(/\r?\n /g, '');
    const lines = unfolded.split(/\r?\n/);
    const events: Array<{ summary: string; description?: string; start?: string; uid?: string; location?: string }> = [];
    let current: any = null;

    lines.forEach((line) => {
      if (line === 'BEGIN:VEVENT') {
        current = {};
        return;
      }
      if (line === 'END:VEVENT') {
        if (current?.summary && current?.start) {
          events.push(current);
        }
        current = null;
        return;
      }
      if (!current) return;

      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) return;
      const key = line.substring(0, separatorIndex);
      const value = line.substring(separatorIndex + 1);

      if (key.startsWith('SUMMARY')) current.summary = decodeIcsText(value.trim());
      else if (key.startsWith('DESCRIPTION')) current.description = decodeIcsText(value.trim());
      else if (key.startsWith('DTSTART')) current.start = parseIcsDate(value.trim());
      else if (key.startsWith('UID')) current.uid = value.trim();
      else if (key.startsWith('LOCATION')) current.location = decodeIcsText(value.trim());
    });

    return events.filter((event) => event.summary && event.start);
  };

  const handleIcsUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!supabaseUserId) {
      setIcsFeedback({ message: 'Log in to import assignments.', tone: 'error' });
      return;
    }

    setIcsLoading(true);
    setIcsFeedback(null);
    try {
      const text = await file.text();
      const events = parseIcs(text);
      if (fileInputRef.current) fileInputRef.current.value = '';

      if (!events.length) {
        throw new Error('No events found in the .ics file.');
      }

      const rows = events.map((event) => ({
        user_id: supabaseUserId,
        assignment_id: event.uid || `ics-${event.start}-${event.summary}`,
        canvas_course_id: null,
        course_name: event.location || null,
        name: event.summary,
        description: event.description || null,
        due_at: event.start,
        points_possible: null,
        html_url: null,
        source: 'canvas_ics',
        raw: event,
        synced_at: new Date().toISOString(),
      }));

      const { error: supabaseError } = await supabase
        .from('canvas_assignments')
        .upsert(rows, { onConflict: 'user_id,assignment_id' });

      if (supabaseError) throw supabaseError;

      setIcsFeedback({ message: `Imported ${rows.length} assignments from calendar.`, tone: 'success' });
      setReloadKey((prev) => prev + 1);
    } catch (err: any) {
      setIcsFeedback({ message: err?.message ?? 'ICS import failed', tone: 'error' });
    } finally {
      setIcsLoading(false);
    }
  };

  const sections = useMemo(() => groupByCourse(assignments.filter((a) => a.source === 'canvas')), [assignments]);

  return (
    <div className="assignments-page">
      <header className="nx-section">
        <h1>Canvas assignments</h1>
        <p className="nx-subtle">Pulled directly from your Canvas courses. Connect a Canvas API token in Integrations to keep this list up to date.</p>
      </header>

      <section className="canvas-sync-panel">
        <div className="canvas-sync-grid">
          <article className="canvas-sync-card">
            <h2>Sync via Canvas API</h2>
            <p>Generate a personal access token under Canvas → Account → Settings → Approved Integrations, then paste it here.</p>
            <label className="nx-field-label" htmlFor="canvas-token-input">Canvas API Token</label>
            <input
              id="canvas-token-input"
              type="password"
              className="nx-input"
              placeholder="Paste your personal access token"
              value={token}
              onChange={(event) => setToken(event.target.value)}
            />
            <label className="nx-field-label" htmlFor="canvas-base-input">Canvas API Base URL</label>
            <input
              id="canvas-base-input"
              className="nx-input"
              value={baseUrl}
              onChange={(event) => setBaseUrl(normalizeCanvasBaseUrl(event.target.value))}
            />
            <div className="sync-actions">
              <button type="button" className="nx-btn" onClick={handleSaveSettings}>Save settings</button>
              <button
                type="button"
                className="nx-btn-outline"
                onClick={handleSyncFromCanvas}
                disabled={syncLoading}
              >
                {syncLoading ? 'Syncing…' : 'Sync from Canvas'}
              </button>
            </div>
            {syncFeedback && (
              <p className={`status-message ${syncFeedback.tone}`}>{syncFeedback.message}</p>
            )}
          </article>

          <article className="canvas-sync-card">
            <h2>Import from .ics</h2>
            <p>Export the calendar from Canvas (Calendar → Export Calendar) and upload the .ics file.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".ics,text/calendar"
              onChange={handleIcsUpload}
              disabled={icsLoading}
            />
            {icsFeedback && (
              <p className={`status-message ${icsFeedback.tone}`}>{icsFeedback.message}</p>
            )}
          </article>
        </div>
      </section>

      {loading && <div className="nx-panel muted">Loading assignments from Canvas…</div>}
      {error && <div className="nx-error">{error}</div>}

      {!loading && !error && sections.length === 0 && (
        <div className="nx-panel muted">No Canvas assignments available. Make sure your Canvas token is saved under Integrations.</div>
      )}

      <section className="assignments-grid">
        {sections.map((section) => (
          <article
            key={`${section.source}-${section.courseId ?? 'na'}`}
            className="assignments-group"
          >
            <header className="group-header">
              <span className={`source-pill ${section.source}`}>{sourceLabel[section.source] ?? section.source}</span>
              <div className="group-meta">
                {section.courseId ? <span>Course ID #{section.courseId}</span> : <span>General</span>}
                <span>{section.items.length} assignments</span>
              </div>
            </header>
            <div className="group-body">
              {section.items.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  id={assignment.id}
                  title={assignment.name}
                  due={formatDueDate(assignment.dueDate ?? undefined)}
                  description={assignment.description ?? undefined}
                />
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}