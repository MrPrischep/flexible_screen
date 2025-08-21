import React, { useCallback, useEffect, useRef, useState } from 'react'

type FlexibleScreenProps = {
  minTopPct?: number
  minBottomPct?: number
  minLeftPct?: number
  minRightPct?: number

  initial?: { topPct?: number; leftPct?: number }

  storageKey?: string | null

  renderTopLeft: () => React.ReactNode
  renderTopRight: () => React.ReactNode
  renderBottom: () => React.ReactNode
}

export default function FlexibleScreen({
  minTopPct = 20,
  minBottomPct = 20,
  minLeftPct = 15,
  minRightPct = 15,
  initial = { topPct: 65, leftPct: 50 },
  storageKey = null,
  renderTopLeft,
  renderTopRight,
  renderBottom,
}: FlexibleScreenProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const topAreaRef = useRef<HTMLDivElement | null>(null)

  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

  const readStored = () => {
    if (!storageKey) return null
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (
        typeof parsed?.topPct === 'number' &&
        typeof parsed?.leftPct === 'number'
      ) {
        return {
          topPct: clamp(parsed.topPct, minTopPct, 100 - minBottomPct),
          leftPct: clamp(parsed.leftPct, minLeftPct, 100 - minRightPct),
        }
      }
    } catch {}
    return null
  }

  const stored = readStored()

  const [topPct, setTopPct] = useState<number>(stored?.topPct ?? (initial.topPct ?? 65))
  const [leftPct, setLeftPct] = useState<number>(stored?.leftPct ?? (initial.leftPct ?? 50))

  useEffect(() => {
    if (!storageKey) return
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ topPct, leftPct })
      )
    } catch {}
  }, [topPct, leftPct, storageKey])

  const dragRef = useRef<null | { type: 'horizontal' | 'vertical' }>(null)

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragRef.current) return

    if (dragRef.current.type === 'horizontal') {
      const rect = containerRef.current!.getBoundingClientRect()
      const y = e.clientY - rect.top
      const pct = (y / rect.height) * 100
      const next = clamp(pct, minTopPct, 100 - minBottomPct)
      setTopPct(next)
    } else {
      const rect = topAreaRef.current!.getBoundingClientRect()
      const x = e.clientX - rect.left
      const pct = (x / rect.width) * 100
      const next = clamp(pct, minLeftPct, 100 - minRightPct)
      setLeftPct(next)
    }
  }, [minTopPct, minBottomPct, minLeftPct, minRightPct])

  const stopDragging = useCallback(() => {
    dragRef.current = null
    document.body.classList.remove('select-none')
  }, [])

  useEffect(() => {
    const onUp = () => stopDragging()
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [onPointerMove, stopDragging])

  const step = 2

  const handleVerticalKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setLeftPct(v => clamp(v - step, minLeftPct, 100 - minRightPct))
      e.preventDefault()
    } else if (e.key === 'ArrowRight') {
      setLeftPct(v => clamp(v + step, minLeftPct, 100 - minRightPct))
      e.preventDefault()
    } else if (e.key === 'Home') {
      setLeftPct(50); e.preventDefault()
    }
  }

  const handleHorizontalKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      setTopPct(v => clamp(v - step, minTopPct, 100 - minBottomPct))
      e.preventDefault()
    } else if (e.key === 'ArrowDown') {
      setTopPct(v => clamp(v + step, minTopPct, 100 - minBottomPct))
      e.preventDefault()
    } else if (e.key === 'Home') {
      setTopPct(66); e.preventDefault()
    }
  }

  const startDrag = (type: 'horizontal' | 'vertical') => (e: React.PointerEvent) => {
    dragRef.current = { type }
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    document.body.classList.add('select-none')
  }

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <div
        ref={topAreaRef}
        className="relative"
        style={{ height: `calc(${topPct}% - 6px)` }}
      >
        <div className="absolute inset-0 flex overflow-hidden">
          <div style={{ width: `${leftPct}%` }} className="h-full overflow-auto">
            {renderTopLeft()}
          </div>

          <div className="relative w-4 shrink-0">
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-neutral-300"/>
            <button
              aria-label="Resize left/right"
              title="Drag or use ← →"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-col-resize outline-none"
              onPointerDown={startDrag('vertical')}
              onKeyDown={handleVerticalKey}
            >
              <div className="rounded-md border bg-white/90 shadow px-2 py-2">
                <div className="flex flex-col items-center gap-1">
                  <span className="block w-1.5 h-1.5 rounded-full bg-neutral-500"></span>
                  <span className="block w-1.5 h-1.5 rounded-full bg-neutral-500"></span>
                  <span className="block w-1.5 h-1.5 rounded-full bg-neutral-500"></span>
                </div>
              </div>
            </button>
          </div>

          <div style={{ width: `${100 - leftPct}%` }} className="h-full overflow-auto">
            {renderTopRight()}
          </div>
        </div>

        <div className="absolute -bottom-3 left-0 right-0 h-6 flex items-center justify-center">
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-px bg-neutral-300"/>
          <button
            aria-label="Resize top/bottom"
            title="Drag or use ↑ ↓"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-row-resize outline-none"
            onPointerDown={startDrag('horizontal')}
            onKeyDown={handleHorizontalKey}
          >
            <div className="rounded-md border bg-white/90 shadow px-2 py-1.5">
              <div className="flex items-center gap-1.5">
                <span className="block w-1.5 h-1.5 rounded-full bg-neutral-500"></span>
                <span className="block w-1.5 h-1.5 rounded-full bg-neutral-500"></span>
                <span className="block w-1.5 h-1.5 rounded-full bg-neutral-500"></span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div
        className="relative"
        style={{ height: `calc(${100 - topPct}% - 6px)` }}
      >
        {renderBottom()}
      </div>
    </div>
  )
}