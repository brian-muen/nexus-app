import 'dotenv/config';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const CANVAS_BASE_URL = (process.env.CANVAS_BASE_URL || 'https://princeton.instructure.com/api/v1').replace(/\/$/, '');
const CANVAS_TOKEN = process.env.CANVAS_TOKEN;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!CANVAS_TOKEN) {
  throw new Error('Missing CANVAS_TOKEN in environment. Add it to your .env file.');
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const defaultHeaders = {
  Authorization: `Bearer ${CANVAS_TOKEN}`,
  Accept: 'application/json',
};

const parseLinkHeader = (header) => {
  if (!header) return {};
  return header.split(',').reduce((acc, part) => {
    const match = part.trim().match(/<([^>]+)>; rel="([^"]+)"/);
    if (match) acc[match[2]] = match[1];
    return acc;
  }, {});
};

const fetchAllPages = async (initialPath) => {
  let url = `${CANVAS_BASE_URL}${initialPath}`;
  const results = [];

  while (url) {
    const response = await fetch(url, { headers: defaultHeaders });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Canvas request failed (${response.status}): ${text}`);
    }

    const data = await response.json();
    results.push(...data);

    const links = parseLinkHeader(response.headers.get('link'));
    url = links.next || null;
  }

  return results;
};

const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const syncAssignments = async () => {
  console.log('[sync] Fetching Canvas courses…');
  const courses = await fetchAllPages('/courses?enrollment_state=active&per_page=100');
  console.log(`[sync] Found ${courses.length} active courses.`);

  let totalAssignments = 0;

  for (const course of courses) {
    const path = `/courses/${course.id}/assignments?per_page=100`; 
    const assignments = await fetchAllPages(path);
    if (!assignments.length) continue;

    const rows = assignments.map((assignment) => ({
      assignment_id: assignment.id,
      course_id: course.id,
      course_name: course.name,
      name: assignment.name,
      description: assignment.description,
      due_at: assignment.due_at,
      points_possible: assignment.points_possible,
      grading_type: assignment.grading_type,
      html_url: assignment.html_url,
      created_at_raw: assignment.created_at,
      updated_at_raw: assignment.updated_at,
      synced_at: new Date().toISOString(),
      source: 'canvas',
    }));

    const chunks = chunkArray(rows, 100);
    for (const chunk of chunks) {
      const { error } = await supabase
        .from('canvas_assignments')
        .upsert(chunk, { onConflict: 'assignment_id' });
      if (error) throw error;
    }

    totalAssignments += rows.length;
    console.log(`[sync] Course ${course.id} (${course.name}) synced ${rows.length} assignments.`);
  }

  console.log(`[sync] Completed. Total assignments synced: ${totalAssignments}`);
};

syncAssignments()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[sync] Failed:', err);
    process.exit(1);
  });
