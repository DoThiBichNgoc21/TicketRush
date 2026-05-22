const PREFIX = 'ticketrush_checkout_'

export function saveCheckoutDraft(showtimeId, draft) {
  const key = `${PREFIX}${showtimeId}`
  sessionStorage.setItem(
    key,
    JSON.stringify({
      ...draft,
      savedAt: Date.now(),
    })
  )
}

export function loadCheckoutDraft(showtimeId) {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${showtimeId}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearCheckoutDraft(showtimeId) {
  sessionStorage.removeItem(`${PREFIX}${showtimeId}`)
}
