import { useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function focusableWithin(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  )
}

/**
 * The three things a dialog owes the user, in one place:
 *
 *  1. the page behind it does not scroll,
 *  2. Tab stays inside it — otherwise `aria-modal="true"` is a lie to screen
 *     readers and keyboard users wander into content they cannot see,
 *  3. focus returns to whatever opened it on close.
 *
 * Pass the dialog's container ref and whether it is currently open.
 */
export function useModalBehaviour(
  containerRef: React.RefObject<HTMLElement | null>,
  open: boolean,
  onEscape?: () => void,
): void {
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  // Escape is handled on the document rather than via an onKeyDown prop on the
  // panel, so it still closes when focus has not landed inside yet (the panel
  // autofocuses on a timer) or has been pulled elsewhere.
  // Latest-ref pattern: keeps the listener subscribed once while still calling
  // the current callback, even when the caller passes a fresh closure.
  const escapeRef = useRef(onEscape)
  useEffect(() => {
    escapeRef.current = onEscape
  })

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        escapeRef.current?.()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [open])

  // Remember the trigger before focus moves into the dialog.
  useEffect(() => {
    if (open) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null
      return
    }

    const target = restoreFocusRef.current
    restoreFocusRef.current = null
    // Only restore if focus was not deliberately moved elsewhere (e.g. the
    // dialog navigated the app somewhere new).
    if (target && document.body.contains(target) && document.activeElement === document.body) {
      target.focus()
    }
  }, [open])

  // Lock background scroll. Compensating for the scrollbar width keeps the
  // layout from jumping as it disappears.
  useEffect(() => {
    if (!open) return

    const { body } = document
    const previousOverflow = body.style.overflow
    const previousPaddingRight = body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      const current = parseFloat(window.getComputedStyle(body).paddingRight) || 0
      body.style.paddingRight = `${current + scrollbarWidth}px`
    }

    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPaddingRight
    }
  }, [open])

  // Trap Tab within the dialog.
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const container = containerRef.current
      if (!container) return

      const items = focusableWithin(container)
      if (items.length === 0) {
        event.preventDefault()
        return
      }

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (!container.contains(active)) {
        event.preventDefault()
        first.focus()
        return
      }

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [open, containerRef])
}
