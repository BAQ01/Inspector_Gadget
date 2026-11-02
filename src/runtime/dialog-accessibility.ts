const focusableSelector = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

let dialogCounter = 0
const activeDialogs = new Map<HTMLElement, {
  returnFocus: HTMLElement | null
  siblings: Array<{ element: HTMLElement; inert: boolean; ariaHidden: string | null }>
}>()

function enhanceDialog(overlay: Element) {
  if (!(overlay instanceof HTMLElement) || overlay.dataset.dialogEnhanced === 'true') return
  overlay.dataset.dialogEnhanced = 'true'
  overlay.setAttribute('role', overlay.getAttribute('role') || 'dialog')
  overlay.setAttribute('aria-modal', 'true')

  const heading = overlay.querySelector('h1, h2, h3')
  if (heading instanceof HTMLElement) {
    if (!heading.id) heading.id = `b2-dialog-title-${++dialogCounter}`
    overlay.setAttribute('aria-labelledby', heading.id)
  } else if (!overlay.getAttribute('aria-label')) {
    overlay.setAttribute('aria-label', 'Dialoogvenster')
  }

  const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  const siblings = [...(overlay.parentElement?.children || [])]
    .filter((element): element is HTMLElement => element !== overlay && element instanceof HTMLElement)
    .map((element) => ({ element, inert: element.inert, ariaHidden: element.getAttribute('aria-hidden') }))
  siblings.forEach(({ element }) => {
    element.inert = true
    element.setAttribute('aria-hidden', 'true')
  })
  activeDialogs.set(overlay, { returnFocus, siblings })
  const focusables = [...overlay.querySelectorAll(focusableSelector)].filter((element): element is HTMLElement => element instanceof HTMLElement && element.offsetParent !== null)
  const autofocus = overlay.querySelector('[autofocus]')
  const initial: HTMLElement = (autofocus instanceof HTMLElement ? autofocus : null) || focusables[0] || overlay
  if (initial === overlay) overlay.tabIndex = -1
  requestAnimationFrame(() => initial.focus())

  overlay.addEventListener('keydown', (event) => {
    const available = [...overlay.querySelectorAll(focusableSelector)].filter((element): element is HTMLElement => element instanceof HTMLElement && element.offsetParent !== null)
    if (event.key === 'Tab' && available.length) {
      const first = available[0]
      const last = available[available.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    if (event.key === 'Escape') {
      const buttons = [...overlay.querySelectorAll('button:not([disabled])')].filter((button): button is HTMLButtonElement => button instanceof HTMLButtonElement)
      const closeButton = buttons.find((button) => /^(annuleren|sluiten|terug)$/i.test(button.textContent?.trim() || ''))
        || buttons.find((button) => /sluiten/i.test(`${button.getAttribute('aria-label') || ''} ${button.getAttribute('title') || ''}`))
      if (closeButton) {
        event.preventDefault()
        closeButton.click()
      }
    }
  })
}

function restoreRemovedDialogs() {
  for (const [dialog, state] of activeDialogs.entries()) {
    if (document.contains(dialog)) continue
    activeDialogs.delete(dialog)
    state.siblings.forEach(({ element, inert, ariaHidden }) => {
      element.inert = inert
      if (ariaHidden == null) element.removeAttribute('aria-hidden')
      else element.setAttribute('aria-hidden', ariaHidden)
    })
    const returnFocus = state.returnFocus
    if (returnFocus && document.contains(returnFocus)) requestAnimationFrame(() => returnFocus.focus())
  }
}

function enhanceFormControls() {
  document.querySelectorAll('input, select, textarea').forEach((control) => {
    if (!(control instanceof HTMLElement) || control.getAttribute('aria-label') || control.getAttribute('aria-labelledby')) return
    if (control.id && document.querySelector(`label[for="${CSS.escape(control.id)}"]`)) return
    const placeholder = control.getAttribute('placeholder')?.trim()
    const name = control.getAttribute('name')?.trim()
    const nearbyLabel = control.parentElement?.querySelector(':scope > label')?.textContent?.trim()
    const label = placeholder || nearbyLabel || name
    if (label) control.setAttribute('aria-label', label.replace(/\s*\*$/, ''))
  })
}

function scan() {
  document.querySelectorAll('.fixed.inset-0').forEach(enhanceDialog)
  enhanceFormControls()
  restoreRemovedDialogs()
}

let scanScheduled = false
function scheduleScan() {
  if (scanScheduled) return
  scanScheduled = true
  requestAnimationFrame(() => {
    scanScheduled = false
    scan()
  })
}

const observer = new MutationObserver(scheduleScan)
observer.observe(document.documentElement, { childList: true, subtree: true })
window.addEventListener('load', scheduleScan)
