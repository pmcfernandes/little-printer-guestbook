function getBaseUrl() {
  const { protocol, hostname, port } = window.location
  if (hostname === 'localhost') {
    return `${protocol}//${hostname}:8001`
  } else {
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`
  }
}

function jsonFetch(url, opts = {}) {
  const controller = new AbortController()
  const timeoutMs = opts.timeoutMs || 15000
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  opts.signal = controller.signal
  if (!opts.headers) opts.headers = {}

  return fetch(url, opts).then(async res => {
    clearTimeout(timeout)
    const text = await res.text()
    let body = null
    try { body = text ? JSON.parse(text) : null } catch { body = text }
    if (!res.ok) throw new Error(typeof body === 'string' ? body : (body && body.error) || res.statusText)
    return body
  }).catch(err => {
    // Normalize AbortError to a clearer message
    if (err && err.name === 'AbortError') throw new Error('Request timed out')
    throw err
  }).finally(() => clearTimeout(timeout))
}

async function getGallery(page = 1, limit = 20) {
  const url = new URL('/api/gallery', getBaseUrl())
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', String(limit))
  return await jsonFetch(url.toString(), { method: 'GET' })
}

async function getGalleryById(id) {
  const url = new URL(`/api/gallery/${encodeURIComponent(id)}`, getBaseUrl())
  return await jsonFetch(url.toString(), { method: 'GET' })
}

async function submitDrawing({ name, email, social, image }) {
  const url = new URL('/api/submit', getBaseUrl()).toString()
  const payload = { name, email, social, image }
  return await jsonFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export { getBaseUrl, getGallery, getGalleryById, submitDrawing }
