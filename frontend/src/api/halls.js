import api from '../api/client'

const TTL_MS = 30_000
let cache = { at: 0, halls: null }

export function invalidateHallsCache() {
  cache = { at: 0, halls: null }
}

/** Active rooms for supervisors. Pass force:true after admin changes or Change Room. */
export async function fetchHalls({ force = false } = {}) {
  const fresh = !force && cache.halls && Date.now() - cache.at < TTL_MS
  if (fresh) {
    return { halls: cache.halls, fromCache: true }
  }

  const { data } = await api.get('/exams/halls/')
  const halls = data.results || data || []
  cache = { at: Date.now(), halls }
  return { halls, fromCache: false }
}
