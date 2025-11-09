import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5174;

const DEFAULT_CANVAS_BASE_URL = (process.env.CANVAS_BASE_URL || process.env.VITE_CANVAS_BASE_URL || 'https://princeton.instructure.com/api/v1').replace(/\/$/, '');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseServer = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

if (!supabaseServer) {
  console.warn('[canvas-proxy] Supabase service role key missing. /api/canvas/sync will be unavailable.');
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const normalizeCanvasBaseUrl = (value) => {
  if (!value) return DEFAULT_CANVAS_BASE_URL;
  let url = String(value).trim();
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
    // ignore invalid URL
  }
  url = url.replace(/\/+$/, '');
  if (!/\/api\/v1$/i.test(url)) {
    url = `${url}/api/v1`;
  }
  return url;
};

app.use(cors({ origin: 'http://localhost:5173', credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const buildTargetUrl = (req) => {
  const { baseUrl, ...restQuery } = req.query || {};
  const base = (typeof baseUrl === 'string' && baseUrl ? baseUrl : DEFAULT_CANVAS_BASE_URL).replace(/\/$/, '');
  const searchParams = new URLSearchParams();

  Object.entries(restQuery).forEach(([key, value]) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else if (typeof value === 'object') {
      // Skip nested objects for simplicity
    } else {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return `${base}${req.path}${query ? `?${query}` : ''}`;
};

app.use('/api/canvas', async (req, res) => {
  const authHeader = req.get('authorization');
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  try {
    const targetUrl = buildTargetUrl(req);
    const method = req.method.toUpperCase();
    const headers = {
      Authorization: authHeader,
      Accept: req.get('accept') || 'application/json',
    };

    let body;
    if (!['GET', 'HEAD'].includes(method)) {
      if (req.is('application/json') && req.body && Object.keys(req.body).length) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(req.body);
      } else if (typeof req.body === 'string' && req.body.length) {
        body = req.body;
      }
    }

    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    const text = await upstream.text();
    const contentType = upstream.headers.get('content-type') || 'application/json';

    if (!upstream.ok) {
      console.error('[canvas-proxy] upstream error', upstream.status, text);
    }

    res.status(upstream.status).type(contentType).send(text);
  } catch (err) {
    console.error('[canvas-proxy] request failed', err);
    res.status(500).json({ error: err?.message || 'Canvas proxy request failed' });
  }
});

const parseLinkHeader = (header) => {
  if (!header) return {};
  return header.split(',').reduce((acc, part) => {
    const match = part.trim().match(/<([^>]+)>; rel="([^"]+)"/);
    if (match) acc[match[2]] = match[1];
    return acc;
  }, {});
};

const fetchCanvasPaginated = async (path, token, base) => {
  const results = [];
  let next = `${base}${path}`;
  while (next) {
    const response = await fetch(next, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Canvas request failed (${response.status}) at ${next}`);
    }

    const data = await response.json();
    results.push(...data);
    const links = parseLinkHeader(response.headers.get('link'));
    next = links.next || null;
  }
  return results;
};

const fetchCanvasCourses = async (token, base) => {
  try {
    return await fetchCanvasPaginated('/users/self/courses?enrollment_state=active&per_page=100', token, base);
  } catch (err) {
    if (err?.message?.includes('/users/self/courses')) {
      console.warn('[canvas-sync] /users/self/courses failed, retrying with /courses', err.message);
      return await fetchCanvasPaginated('/courses?enrollment_state=active&per_page=100', token, base);
    }
    throw err;
  }
};

app.post('/api/canvas/sync', async (req, res) => {
  if (!supabaseServer) {
    return res.status(500).json({ error: 'Supabase service key is not configured on the server.' });
  }

  const { token, baseUrl, userId } = req.body || {};
  if (!token || !userId) {
    return res.status(400).json({ error: 'Canvas token and userId are required.' });
  }

  if (!UUID_REGEX.test(userId)) {
    return res.status(400).json({ error: 'Invalid Supabase user id. Please log out and log back in.' });
  }

  const base = normalizeCanvasBaseUrl(baseUrl);

  try {
    const courses = await fetchCanvasCourses(token, base);
    const rows = [];

    for (const course of courses) {
      const assignments = await fetchCanvasPaginated(`/courses/${course.id}/assignments?per_page=100`, token, base);
      assignments.forEach((assignment) => {
        rows.push({
          user_id: userId,
          assignment_id: assignment.id,
          canvas_course_id: course.id,
          course_name: course.name,
          name: assignment.name,
          description: assignment.description,
          due_at: assignment.due_at,
          points_possible: assignment.points_possible,
          html_url: assignment.html_url,
          source: 'canvas_api',
          raw: assignment,
          synced_at: new Date().toISOString(),
        });
      });
    }

    if (!rows.length) {
      return res.json({ count: 0 });
    }

    const { error } = await supabaseServer
      .from('canvas_assignments')
      .upsert(rows, { onConflict: 'user_id,assignment_id' });

    if (error) throw error;

    res.json({ count: rows.length });
  } catch (err) {
    console.error('[canvas-sync] failed', err);
    res.status(500).json({ error: err?.message || 'Canvas sync failed' });
  }
});

app.listen(PORT, () => {
  console.log(`[canvas-proxy] listening on http://localhost:${PORT}`);
});
