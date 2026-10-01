const fallbackApiUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000';
const API_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || fallbackApiUrl).replace(/\/$/, '');

function normalizeError(data, fallback = 'Request failed') {
  if (!data) return fallback;

  if (typeof data === 'string') return data;

  if (Array.isArray(data.detail)) {
    const first = data.detail[0];
    return first?.msg || first?.error || fallback;
  }

  if (typeof data.detail === 'string') {
    return data.detail;
  }

  if (typeof data.message === 'string') {
    return data.message;
  }

  return fallback;
}

async function request(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let data = null;

  try {
    data = contentType.includes('application/json') ? await response.json() : await response.text();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = normalizeError(data, 'Something went wrong. Please try again.');
    throw new Error(message);
  }

  return data;
}

export { API_URL, request };
