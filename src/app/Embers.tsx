/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { useEffect, useRef } from 'react'

export type EmberDensity =
  'off' | 'minimal' | 'low' | 'normal' | 'high' | 'storm' | 'inferno'

export type EmberColorMode =
  'primary' | 'brand' | 'accent' | 'ember' | 'fire' | 'mana'

const DENSITY_MULTIPLIER: Record<EmberDensity, number> = {
  off: 0,
  minimal: 0.15,
  low: 0.4,
  normal: 1,
  high: 2.5,
  storm: 5,
  inferno: 10,
}

interface Spark {
  x: number
  y: number
  size: number
  speed: number
  sway: number
  phase: number
  alpha: number
  color: string
}

function paletteToken(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}

// Fire and mana hues are deliberate literals: embers stay fire-colored and
// mana stays blue-violet on every palette.
function colorsFor(mode: EmberColorMode): string[] {
  switch (mode) {
    case 'primary':
      return [paletteToken('--primary')]
    case 'brand':
      return [paletteToken('--brand')]
    case 'accent':
      return [paletteToken('--accent-foreground')]
    case 'ember':
      return ['#ff8a3c']
    case 'fire':
      return ['#ff8a3c', '#ff5a45', '#ffc94d']
    case 'mana':
      return ['#38a8ff', '#b79bff', '#6fd6ff']
  }
}

function createSpark(width: number, height: number, colors: string[]): Spark {
  return {
    x: Math.random() * width,
    y: height + Math.random() * 20,
    size: 1 + Math.random() * 1.6,
    speed: 0.15 + Math.random() * 0.35,
    sway: 6 + Math.random() * 14,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.2 + Math.random() * 0.35,
    color: colors[Math.floor(Math.random() * colors.length)],
  }
}

function sparkCountFor(
  width: number,
  height: number,
  density: EmberDensity,
): number {
  const base = Math.min(80, Math.max(16, Math.round((width * height) / 30000)))
  return Math.round(base * DENSITY_MULTIPLIER[density])
}

interface EmbersProps {
  density: EmberDensity
  colorMode: EmberColorMode
}

// Decorative slow-rising embers behind the whole app. Renders nothing when
// the user prefers reduced motion or density is off. Palette-derived colors
// are sampled when the effect (re)starts.
export function Embers({ density, colorMode }: EmbersProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (density === 'off') {
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    const colors = colorsFor(colorMode)

    let width = 0
    let height = 0
    let sparks: Spark[] = []

    function resize() {
      if (!canvas) {
        return
      }
      width = canvas.clientWidth
      height = canvas.clientHeight
      const scale = window.devicePixelRatio || 1
      canvas.width = width * scale
      canvas.height = height * scale
      context?.setTransform(scale, 0, 0, scale, 0, 0)

      const count = sparkCountFor(width, height, density)
      while (sparks.length < count) {
        const spark = createSpark(width, height, colors)
        spark.y = Math.random() * height
        sparks.push(spark)
      }
      sparks = sparks.slice(0, count)
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    let frame = 0
    let time = 0

    function tick() {
      if (!context) {
        return
      }
      time += 1
      context.clearRect(0, 0, width, height)
      for (let i = 0; i < sparks.length; i++) {
        const spark = sparks[i]
        spark.y -= spark.speed
        const swayX =
          spark.x + Math.sin(time / 90 + spark.phase) * spark.sway * 0.1
        const progress = 1 - spark.y / Math.max(height, 1)
        context.fillStyle = spark.color
        context.globalAlpha = Math.max(0, spark.alpha * (1 - progress))
        context.beginPath()
        context.arc(swayX, spark.y, spark.size, 0, Math.PI * 2)
        context.fill()
        if (spark.y < -5) {
          sparks[i] = createSpark(width, height, colors)
        }
      }
      context.globalAlpha = 1
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
    }
  }, [density, colorMode])

  if (density === 'off') {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 h-full w-full"
    />
  )
}
