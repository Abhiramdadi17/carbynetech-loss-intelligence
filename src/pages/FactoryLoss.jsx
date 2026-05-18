import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  Scan, Tag, Activity, Bell, BarChart2,
  Cpu, TrendingUp, Users, AlertTriangle,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import StickyBottomBar from '../components/StickyBottomBar'
import { useBreakpoint } from '../hooks/useBreakpoint'

// ─── ParticleCanvas — drifting particle network ──────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const NUM = 70
    const particles = Array.from({ length: NUM }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.2 + 0.4,
    }))

    const draw = () => {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0
      })
      for (let i = 0; i < NUM; i++) {
        for (let j = i + 1; j < NUM; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 130) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(0,194,255,${(1 - d / 130) * 0.22})`
            ctx.lineWidth = 0.6
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,194,255,0.55)'
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        opacity: 0.45, pointerEvents: 'none', zIndex: 0,
      }}
    />
  )
}

// ─── ScanLine — continuous hero beam sweep ───────────────────────
function ScanLine() {
  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0,
        height: '2px', zIndex: 1, pointerEvents: 'none',
        background: 'linear-gradient(90deg, transparent 0%, rgba(0,194,255,0.6) 40%, rgba(0,255,136,0.4) 60%, transparent 100%)',
        boxShadow: '0 0 18px 4px rgba(0,194,255,0.25)',
        animation: 'scanline 5s linear infinite',
        top: 0,
      }}
    />
  )
}

// ─── UTILITY: Scroll Progress Bar ────────────────────────────────
function ScrollProgressBar() {
  const [progress, setProgress] = React.useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const max = el.scrollHeight - el.clientHeight
      setProgress(max > 0 ? (scrolled / max) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: '2px', zIndex: 9999, pointerEvents: 'none',
      background: 'rgba(0,194,255,0.1)',
    }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #00c2ff, #00ff88)',
        boxShadow: '0 0 8px rgba(0,194,255,0.7)',
        transition: 'width 0.05s linear',
      }} />
    </div>
  )
}

// ─── UTILITY: Magnetic Button ───────────────────────────────────
function MagneticButton({ children, href, style, onMouseEnter, onMouseLeave, className }) {
  const ref = useRef(null)
  const [offset, setOffset] = React.useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) * 0.32
    const dy = (e.clientY - cy) * 0.32
    setOffset({ x: dx, y: dy })
  }
  const handleMouseLeave = (e) => {
    setOffset({ x: 0, y: 0 })
    onMouseLeave && onMouseLeave(e)
  }

  return (
    <a
      ref={ref}
      href={href || '#'}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={onMouseEnter}
      style={{
        ...style,
        display: 'inline-block',
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: offset.x === 0 && offset.y === 0
          ? 'transform 0.5s cubic-bezier(0.4,0,0.2,1)'
          : 'transform 0.1s ease',
      }}
    >
      {children}
    </a>
  )
}

// ─── UTILITY: Word-by-word reveal ───────────────────────────────
function WordReveal({ text, className, style, wordStyle, delay = 0 }) {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true })
  const words = text.split(' ')
  return (
    <span ref={ref} className={className} style={{ ...style, display: 'block' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 22, filter: 'blur(4px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.45, delay: delay + i * 0.07, ease: [0.4, 0, 0.2, 1] }}
          style={{ display: 'inline-block', marginRight: '0.28em', ...wordStyle }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

// ─── UTILITY: Live Terminal ───────────────────────────────────────
const TERMINAL_LOGS = [
  { time: '14:02:31', type: 'ALERT', zone: 'Zone D', msg: 'Loss threshold exceeded — 9.2%' },
  { time: '14:02:35', type: 'INFO', zone: 'Zone A', msg: 'OEE stable at 87.2%' },
  { time: '14:02:41', type: 'WARN', zone: 'Zone B', msg: 'Assembly — drift detected 4.8%' },
  { time: '14:02:48', type: 'OK', zone: 'Zone C', msg: 'QC Check passed — 91.8%' },
  { time: '14:02:54', type: 'ALERT', zone: 'Zone D', msg: 'Material variance +2.1 kg/hr' },
  { time: '14:03:01', type: 'OK', zone: 'Zone E', msg: 'Dispatch nominal — 94.1%' },
  { time: '14:03:08', type: 'INFO', zone: 'System', msg: '12,480 data points this shift' },
]
const LOG_COLOR = { ALERT: '#ff5f57', WARN: '#f5a623', OK: '#00ff88', INFO: 'rgba(0,194,255,0.85)' }

function LiveTerminal() {
  const [visible, setVisible] = React.useState([])
  const [tick, setTick] = React.useState(0)
  const listRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => t + 1)
      setVisible(v => {
        const next = [...v, TERMINAL_LOGS[v.length % TERMINAL_LOGS.length]]
        return next.slice(-7)
      })
    }, 1400)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [visible])

  return (
    <motion.div
      initial={{ opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, delay: 0.8, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: 'rgba(8,12,20,0.88)',
        border: '1px solid rgba(0,194,255,0.18)',
        borderRadius: '12px',
        overflow: 'hidden',
        backdropFilter: 'blur(16px)',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 0 60px rgba(0,194,255,0.07), 0 24px 48px rgba(0,0,0,0.5)',
      }}
    >
      {/* title bar */}
      <div style={{
        padding: '0.65rem 1rem',
        borderBottom: '1px solid rgba(0,194,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          {['#ff5f57', '#febc2e', '#28c840'].map(c => (
            <span key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }} />
          ))}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(0,194,255,0.6)', letterSpacing: '0.14em' }}>
          FOUNDRYOS · LIVE FEED
        </span>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 6px #00ff88', display: 'inline-block', animation: 'pulse 2s infinite' }} />
      </div>
      {/* log lines */}
      <div ref={listRef} style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', height: '224px', overflowY: 'hidden' }}>
        {visible.map((log, i) => (
          <motion.div
            key={`${log.time}-${i}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.28)', flexShrink: 0, paddingTop: '1px' }}>{log.time}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: LOG_COLOR[log.type], width: '36px', flexShrink: 0, paddingTop: '1px' }}>{log.type}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(0,194,255,0.75)', flexShrink: 0, paddingTop: '1px' }}>[{log.zone}]</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>{log.msg}</span>
          </motion.div>
        ))}
        {/* blinking cursor */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.2rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(0,194,255,0.5)' }}>{'>'}</span>
          <span style={{ display: 'inline-block', width: 6, height: 12, background: 'var(--accent-blue)', animation: 'terminal-cursor 1.1s step-end infinite' }} />
        </div>
      </div>
    </motion.div>
  )
}

// ─── UTILITY: Marquee Ticker ──────────────────────────────────────
const TICKER_ITEMS = [
  '✦ SAP Integration', '✦ Rockwell Automation', '✦ Siemens SCADA',
  '✦ AspenTech', '✦ OSIsoft PI', '✦ Honeywell DCS',
  '✦ Oracle ERP', '✦ Infor CloudSuite', '✦ Microsoft Dynamics',
  '✦ FactoryTalk', '✦ Wonderware', '✦ ABB Ability',
]
function MarqueeTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div style={{
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(0,194,255,0.03)',
      overflow: 'hidden',
      padding: '0.85rem 0',
      position: 'relative',
    }}>
      {/* fade edges */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', background: 'linear-gradient(to right, var(--bg), transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', background: 'linear-gradient(to left, var(--bg), transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', gap: '0', animation: 'marquee 28s linear infinite', width: 'max-content' }}>
        {doubled.map((item, i) => (
          <span key={i} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.14em',
            color: 'rgba(255,255,255,0.38)',
            whiteSpace: 'nowrap',
            padding: '0 2.5rem',
          }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── INFOGRAPHIC 1: Loss Waterfall Funnel ────────────────────────

function LossFunnelChart() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })

  const steps = [
    { label: 'Raw Material Input', value: 100, color: 'rgba(0,194,255,0.9)', loss: null },
    { label: 'After Defect Loss', value: 85, color: 'rgba(0,194,255,0.72)', loss: '−15%  Defect Units' },
    { label: 'After Ghost Loss', value: 73, color: 'rgba(0,194,255,0.54)', loss: '−12%  Ghost Loss' },
    { label: 'After Process Waste', value: 64, color: 'rgba(0,194,255,0.38)', loss: '−9%   Process Waste' },
    { label: 'Net Production Output', value: 58, color: '#00ff88', loss: '−6%   Untracked' },
  ]

  return (
    <div ref={ref} style={{ width: '100%', marginTop: '3rem' }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.62rem',
        letterSpacing: '0.16em',
        color: 'var(--accent-blue)',
        textTransform: 'uppercase',
        marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <span style={{ width: 20, height: 1, background: 'var(--accent-blue)', display: 'inline-block' }} />
        Material Loss Waterfall
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '10px 14px',
                borderRadius: '8px',
                background: isLast ? 'rgba(0,255,136,0.06)' : 'rgba(255,255,255,0.03)',
                borderLeft: `3px solid ${isLast ? '#00ff88' : step.color}`,
              }}
            >
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: isLast ? '#00ff88' : '#fff',
                minWidth: '3.2rem',
                textAlign: 'right',
              }}>
                {step.value}%
              </span>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.7)',
                flex: 1,
              }}>
                {step.label}
              </span>
              {step.loss && (
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'rgba(255,107,53,0.85)',
                  whiteSpace: 'nowrap',
                }}>
                  {step.loss}
                </span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ─── INFOGRAPHIC 2: OEE Ring Gauges ──────────────────────────────

function OEERingGauge({ zone, oee, loss, status, delay = 0 }) {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })
  const radius = 38
  const stroke = 7
  const circ = 2 * Math.PI * radius
  const pct = parseFloat(oee) / 100
  const dashLen = circ * pct
  const color = status === 'green' ? '#00ff88' : status === 'yellow' ? '#f5a623' : '#ff4d4d'
  const lossColor = status === 'red' ? '#ff6b6b' : status === 'yellow' ? '#f5a623' : '#00ff88'

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '1.25rem 0.5rem',
      }}
    >
      <svg width={96} height={96} viewBox="0 0 96 96" style={{ overflow: 'visible' }}>
        {/* Glow filter */}
        <defs>
          <filter id={`glow-${zone.replace(/\s/g, '')}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle
          cx={48} cy={48} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        {/* Arc */}
        <motion.circle
          cx={48} cy={48} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          transform="rotate(-90 48 48)"
          filter={`url(#glow-${zone.replace(/\s/g, '')})`}
          initial={{ strokeDashoffset: circ }}
          animate={inView ? { strokeDashoffset: circ - dashLen } : { strokeDashoffset: circ }}
          transition={{ duration: 1.1, delay: delay + 0.2, ease: [0.4, 0, 0.2, 1] }}
        />
        {/* Center text */}
        <text x={48} y={44} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="14" fontWeight="700" fill={color}>
          {oee}
        </text>
        <text x={48} y={59} textAnchor="middle" fontFamily="var(--font-body)" fontSize="9" fill="rgba(255,255,255,0.38)">
          OEE
        </text>
      </svg>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text)', textAlign: 'center', maxWidth: 90 }}>
        {zone}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: lossColor }}>
        Loss {loss}
      </div>
    </motion.div>
  )
}

function OEERingGauges({ zoneRows, isMobile }) {
  return (
    <div style={{ marginTop: '3rem' }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.62rem',
        letterSpacing: '0.16em',
        color: 'var(--accent-blue)',
        textTransform: 'uppercase',
        marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <span style={{ width: 20, height: 1, background: 'var(--accent-blue)', display: 'inline-block' }} />
        OEE by Zone
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: isMobile ? 'center' : 'space-between',
        gap: '0.5rem',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '0.5rem',
        background: 'rgba(0,0,0,0.2)',
      }}>
        {zoneRows.map((row, i) => (
          <OEERingGauge
            key={row.zone}
            zone={row.zone.split('—')[1]?.trim() || row.zone}
            oee={row.oee}
            loss={row.loss}
            status={row.status}
            delay={i * 0.1}
          />
        ))}
      </div>
    </div>
  )
}

// ─── INFOGRAPHIC 3: Integration Hub-Spoke ────────────────────────

function IntegrationHubSpoke({ isMobile }) {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })
  const [hovered, setHovered] = React.useState(null) // { label, group }

  const groups = {
    data: { color: '#00c2ff', label: 'Data Sources', count: '5 systems' },
    sensor: { color: '#00ff88', label: 'Sensor Network', count: '5 systems' },
    enterprise: { color: '#a78bfa', label: 'Enterprise Systems', count: '5 systems' },
  }

  const nodes = [
    { label: 'Aspentech', angle: 222, group: 'data', r: 158 },
    { label: 'Oracle', angle: 246, group: 'data', r: 153 },
    { label: 'SAP ECC', angle: 268, group: 'data', r: 160 },
    { label: 'SCADA', angle: 292, group: 'data', r: 153 },
    { label: 'Historians', angle: 314, group: 'data', r: 158 },
    { label: 'Smart Sensors', angle: 346, group: 'sensor', r: 158 },
    { label: 'Flow Meters', angle: 16, group: 'sensor', r: 153 },
    { label: 'Gas Analysts', angle: 43, group: 'sensor', r: 158 },
    { label: 'Data Miners', angle: 70, group: 'sensor', r: 153 },
    { label: 'Inventories', angle: 95, group: 'sensor', r: 158 },
    { label: 'SAP S/4', angle: 128, group: 'enterprise', r: 158 },
    { label: 'Oracle ERP', angle: 150, group: 'enterprise', r: 153 },
    { label: 'MES Systems', angle: 170, group: 'enterprise', r: 160 },
    { label: 'ERP Lite', angle: 192, group: 'enterprise', r: 153 },
    { label: 'SAP R/3', angle: 210, group: 'enterprise', r: 158 },
  ]

  const svgW = 560, svgH = 400
  const cx = svgW / 2, cy = svgH / 2

  const toXY = (angle, r) => ({
    x: cx + r * Math.cos((angle * Math.PI) / 180),
    y: cy + r * Math.sin((angle * Math.PI) / 180),
  })

  const getLabelProps = (angle, pos) => {
    const n = ((angle % 360) + 360) % 360
    if (n > 225 && n <= 315) return { x: pos.x, y: pos.y - 15, anchor: 'middle' }
    if (n > 315 || n <= 45) return { x: pos.x + 15, y: pos.y + 4, anchor: 'start' }
    if (n > 45 && n <= 135) return { x: pos.x, y: pos.y + 18, anchor: 'middle' }
    return { x: pos.x - 15, y: pos.y + 4, anchor: 'end' }
  }

  const hovGroup = hovered?.group ?? null

  const svgEl = (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: 'auto', maxHeight: '490px', display: 'block' }}>
      <defs>
        <radialGradient id="ihub-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,194,255,0.13)" />
          <stop offset="100%" stopColor="rgba(0,194,255,0)" />
        </radialGradient>
        <radialGradient id="ihub-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#111c28" />
          <stop offset="100%" stopColor="#080c10" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r={78} fill="url(#ihub-bg)" />

      {nodes.map((node) => {
        const pos = toXY(node.angle, node.r)
        const col = groups[node.group].color
        const nodeActive = hovered?.label === node.label
        const groupActive = hovGroup === node.group
        const dimmed = hovGroup !== null && !groupActive
        return (
          <line key={`sp-${node.label}`} x1={cx} y1={cy} x2={pos.x} y2={pos.y}
            stroke={col}
            strokeOpacity={dimmed ? 0.04 : nodeActive ? 0.8 : groupActive ? 0.42 : 0.14}
            strokeWidth={nodeActive ? 2 : 1}
            style={{ transition: 'stroke-opacity 0.22s, stroke-width 0.18s' }}
          />
        )
      })}

      {nodes.map((node, i) => {
        const pos = toXY(node.angle, node.r)
        const col = groups[node.group].color
        const dimmed = hovGroup !== null && hovGroup !== node.group
        if (dimmed) return null
        return (
          <motion.circle key={`pulse-${node.label}`} r={2.2} fill={col}
            animate={inView ? { cx: [cx, pos.x], cy: [cy, pos.y], opacity: [0, 0.9, 0] } : { opacity: 0 }}
            transition={{ duration: 2, delay: i * 0.14, repeat: Infinity, repeatDelay: 1.8, ease: 'easeOut' }}
            style={{ pointerEvents: 'none' }}
          />
        )
      })}

      {nodes.map((node, i) => {
        const pos = toXY(node.angle, node.r)
        const lp = getLabelProps(node.angle, pos)
        const col = groups[node.group].color
        const nodeActive = hovered?.label === node.label
        const groupActive = hovGroup === node.group
        const dimmed = hovGroup !== null && !groupActive
        return (
          <g key={node.label} onMouseEnter={() => setHovered({ label: node.label, group: node.group })} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
            <circle cx={pos.x} cy={pos.y} r={16} fill="none" stroke={col} strokeOpacity={nodeActive ? 0.32 : 0} strokeWidth={1} style={{ transition: 'stroke-opacity 0.18s' }} />
            <motion.circle cx={pos.x} cy={pos.y} r={6} fill={col}
              fillOpacity={dimmed ? 0.15 : nodeActive ? 1 : groupActive ? 0.88 : 0.7}
              animate={inView ? { scale: nodeActive ? 1.55 : 1 } : { scale: 0 }}
              transition={{ duration: 0.22, delay: nodeActive ? 0 : i * 0.05 + 0.5 }}
              style={{ transformOrigin: `${pos.x}px ${pos.y}px`, transition: 'fill-opacity 0.22s' }}
            />
            <motion.text x={lp.x} y={lp.y} textAnchor={lp.anchor}
              fontFamily="var(--font-mono)" fontSize={isMobile ? 7 : 9.5}
              fontWeight={nodeActive ? '700' : '400'} fill={col}
              fillOpacity={dimmed ? 0.15 : nodeActive ? 1 : groupActive ? 0.88 : 0.62}
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: i * 0.05 + 0.7 }}
              style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill-opacity 0.22s' }}
            >{node.label}</motion.text>
          </g>
        )
      })}

      <motion.circle cx={cx} cy={cy} r={46} fill="none" stroke="rgba(0,194,255,0.22)" strokeWidth={1.5} strokeDasharray="5 4"
        animate={{ rotate: 360 }} transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      <motion.circle cx={cx} cy={cy} r={40} fill="url(#ihub-fill)" stroke="rgba(0,194,255,0.45)" strokeWidth={1.5}
        initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}} transition={{ duration: 0.6 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      <motion.text x={cx} y={cy - 4} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={10} fontWeight="700" fill="#00c2ff" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.8 }}>FoundryOS</motion.text>
      <motion.text x={cx} y={cy + 9} textAnchor="middle" fontFamily="var(--font-body)" fontSize={8} fill="rgba(255,255,255,0.38)" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.9 }}>Integration Core</motion.text>
    </svg>
  )

  const cardsEl = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', height: '100%' }}>
      {Object.entries(groups).map(([key, g]) => {
        const isGroupActive = hovGroup === key
        const groupNodes = nodes.filter(n => n.group === key)
        return (
          <div key={key} style={{
            flex: 1,
            padding: '0.6rem 0.8rem',
            borderRadius: '8px',
            border: `1px solid ${isGroupActive ? g.color + '45' : 'rgba(255,255,255,0.07)'}`,
            background: isGroupActive ? g.color + '0c' : 'rgba(255,255,255,0.02)',
            transition: 'border-color 0.22s, background 0.22s',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: g.color, flexShrink: 0, boxShadow: isGroupActive ? `0 0 7px ${g.color}` : 'none', transition: 'box-shadow 0.22s' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: g.color, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>{g.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'rgba(255,255,255,0.22)', marginLeft: 'auto' }}>{g.count}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.28rem' }}>
              {groupNodes.map(n => {
                const isNodeActive = hovered?.label === n.label
                return (
                  <span key={n.label}
                    onMouseEnter={() => setHovered({ label: n.label, group: n.group })}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                      padding: '0.17rem 0.44rem', borderRadius: '4px',
                      background: isNodeActive ? g.color + '1e' : 'rgba(255,255,255,0.04)',
                      color: isNodeActive ? g.color : 'rgba(255,255,255,0.45)',
                      border: `1px solid ${isNodeActive ? g.color + '38' : 'rgba(255,255,255,0.07)'}`,
                      cursor: 'default', transition: 'all 0.18s', userSelect: 'none',
                    }}
                  >{n.label}</span>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div ref={ref} style={{ marginTop: '0.75rem', width: '100%' }}>
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cardsEl}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
          {cardsEl}
          {svgEl}
        </div>
      )}
    </div>
  )
}

// ─── Shared primitives ────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '0.68rem',
      letterSpacing: '0.18em',
      color: 'var(--accent-blue)',
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      textTransform: 'uppercase',
    }}>
      <span style={{
        width: 24, height: 1,
        background: 'var(--accent-blue)',
        display: 'inline-block',
        flexShrink: 0,
      }} />
      {children}
    </div>
  )
}

function SectionReveal({ children, delay = 0, style = {} }) {
  const { ref, inView } = useInView({ threshold: 0.12, triggerOnce: true })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// ─── CountUp component (self-contained) ──────────────────────────

function CountUp({ value, duration = 1.5 }) {
  const [display, setDisplay] = useState('0')
  const { ref, inView } = useInView({ triggerOnce: true })

  useEffect(() => {
    if (!inView) return
    const hasPlus = value.includes('+')
    const hasK = value.includes('K')
    const hasPercent = value.includes('%')
    const hasX = value.includes('×')
    const hasMinus = value.startsWith('<')
    const raw = parseFloat(value.replace(/[^0-9.]/g, ''))
    if (isNaN(raw)) { setDisplay(value); return }

    let current = 0
    const steps = duration * 60
    const increment = raw / steps

    const timer = setInterval(() => {
      current += increment
      if (current >= raw) {
        setDisplay(value)
        clearInterval(timer)
      } else {
        const n = raw % 1 !== 0 ? current.toFixed(2) : Math.floor(current)
        const suffix = hasK ? 'K+' : hasX ? '×' : hasPercent ? '%' : hasPlus ? '+' : ''
        const prefix = hasMinus ? '<' : ''
        setDisplay(`${prefix}${n}${suffix}`)
      }
    }, 1000 / 60)

    return () => clearInterval(timer)
  }, [inView, value, duration])

  return <span ref={ref}>{display}</span>
}

// ─── LossCard — cursor spotlight + hover lift ───────────────────────

function LossCard({ item }) {
  const [hovered, setHovered] = React.useState(false)
  const [spot, setSpot] = React.useState({ x: 50, y: 50 })
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect()
    setSpot({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        padding: '2rem',
        background: 'var(--bg)',
        borderLeft: hovered ? '2px solid var(--accent-blue)' : '2px solid transparent',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? '0 16px 40px rgba(0,194,255,0.08)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100%',
        cursor: 'default',
        position: 'relative',
        zIndex: hovered ? 1 : 0,
        boxSizing: 'border-box',
      }}
    >
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        color: 'var(--accent-blue)',
        letterSpacing: '0.1em',
        marginBottom: '0.75rem',
        textShadow: hovered ? '0 0 20px rgba(0,194,255,0.5)' : 'none',
        transition: 'text-shadow 0.3s',
      }}>
        {item.num}
      </div>
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '0.95rem',
        fontWeight: 600,
        color: 'var(--text)',
        marginBottom: '0.5rem',
      }}>
        {item.title}
      </div>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        lineHeight: 1.65,
      }}>
        {item.desc}
      </p>
    </div>
  )
}

// ─── IntelligenceColumn — icon pulse + background hover ──────────

function IntelligenceColumn({ Icon, label, desc, index, total, isMobile }) {
  const [iconAnim, setIconAnim] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => { setHovered(true); setIconAnim(true) }}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: isMobile ? '1.25rem 1rem' : '2rem 1.5rem',
        borderRight: !isMobile && index < total - 1 ? '1px solid var(--border)' : 'none',
        borderBottom: isMobile && index < total - 1 ? '1px solid var(--border)' : 'none',
        display: 'flex',
        flexDirection: isMobile ? 'row' : 'column',
        alignItems: isMobile ? 'center' : 'center',
        gap: isMobile ? '1rem' : '0',
        textAlign: isMobile ? 'left' : 'center',
        background: hovered ? 'rgba(0,194,255,0.04)' : 'transparent',
        transition: 'background 0.3s',
      }}
    >
      <motion.div
        animate={iconAnim ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={{ duration: 0.4 }}
        onAnimationComplete={() => setIconAnim(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 42, height: 42,
          borderRadius: '10px',
          background: 'rgba(0,194,255,0.08)',
          border: '1px solid rgba(0,194,255,0.15)',
          marginBottom: isMobile ? 0 : '1rem',
          flexShrink: 0,
        }}
      >
        <Icon size={18} color="var(--accent-blue)" />
      </motion.div>
      <div>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.88rem',
          fontWeight: 600,
          color: 'var(--text)',
          marginBottom: '0.35rem',
        }}>
          {label}
        </div>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          margin: 0,
        }}>
          {desc}
        </p>
      </div>
    </div>
  )
}

// ─── TiltCard — 3D perspective tilt on mouse move ─────────────────
function TiltCard({ i, p, isActive, isDimmed, onEnter, onLeave }) {
  const cardRef = useRef(null)
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 })
  const [glowPos, setGlowPos] = React.useState({ x: 50, y: 50 })

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -8
    const ry = ((e.clientX - cx) / (rect.width / 2)) * 8
    setTilt({ x: rx, y: ry })
    setGlowPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }
  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    onLeave()
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: i * 0.15 }}
      onMouseEnter={onEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        padding: '2rem',
        borderRadius: '12px',
        border: isActive ? '1px solid rgba(0,194,255,0.3)' : '1px solid var(--border)',
        background: isActive
          ? `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(0,194,255,0.08) 0%, var(--bg) 60%)`
          : isDimmed ? '#060809' : 'var(--bg)',
        opacity: isDimmed ? 0.45 : 1,
        transform: isActive
          ? `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.03)`
          : isDimmed ? 'scale(0.97)' : 'scale(1)',
        boxShadow: isActive
          ? `0 24px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,194,255,0.1)`
          : '0 0 0 transparent',
        cursor: 'default',
        transition: isActive
          ? 'transform 0.08s ease, opacity 0.3s, box-shadow 0.3s, border-color 0.3s'
          : 'all 0.45s cubic-bezier(0.4,0,0.2,1)',
        willChange: 'transform',
      }}
    >
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6rem',
        letterSpacing: '0.15em',
        color: 'var(--accent-blue)',
        textTransform: 'uppercase',
        background: isActive ? 'rgba(0,194,255,0.12)' : 'rgba(0,194,255,0.07)',
        border: isActive ? '1px solid rgba(0,194,255,0.3)' : '1px solid rgba(0,194,255,0.15)',
        borderRadius: '4px',
        padding: '3px 10px',
        display: 'inline-block',
        marginBottom: '1.25rem',
        transition: 'all 0.3s',
      }}>
        {p.role}
      </div>
      <p style={{
        fontFamily: 'var(--font-heading)',
        fontStyle: 'italic',
        fontSize: '1.1rem',
        lineHeight: 1.7,
        color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)',
        marginBottom: '1.5rem',
        transition: 'color 0.3s',
      }}>
        {p.quote}
      </p>
      <div style={{
        borderTop: `1px solid ${isActive ? 'rgba(0,194,255,0.15)' : 'var(--border)'}`,
        paddingTop: '1rem',
        transition: 'border-color 0.3s',
      }}>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.95rem', fontWeight: 700,
          color: 'var(--text)', transition: 'color 0.3s',
        }}>
          {p.name}
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          marginTop: '0.2rem',
          transition: 'color 0.3s',
        }}>
          {p.title}
        </div>
      </div>
    </motion.div>
  )
}

// ─── ControlRow — scanner sweep ───────────────────────────────────

function ControlRow({ row, isMobile }) {
  const [active, setActive] = useState(false)
  const sweepRef = useRef(null)
  const Icon = row.Icon

  const handleEnter = () => {
    setActive(true)
    if (sweepRef.current) sweepRef.current.classList.add('row-sweep-active')
  }
  const handleLeave = () => {
    setActive(false)
    if (sweepRef.current) {
      sweepRef.current.classList.remove('row-sweep-active')
      sweepRef.current.style.left = '-100%'
    }
  }

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        padding: active ? '1.5rem 1rem 1.5rem 1.5rem' : '1.5rem 1rem',
        borderBottom: '1px solid var(--border)',
        borderLeft: active ? '3px solid var(--accent-blue)' : '3px solid transparent',
        background: active ? 'var(--bg-hover)' : 'transparent',
        transition: 'background 0.25s, border-color 0.25s, padding 0.25s',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Sweep line */}
      <div
        ref={sweepRef}
        style={{
          position: 'absolute',
          top: 0, bottom: 0,
          left: '-100%',
          width: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(0,194,255,0.06), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* Icon */}
      <div style={{
        width: 42, height: 42,
        borderRadius: '10px',
        background: 'rgba(0,194,255,0.07)',
        border: '1px solid rgba(0,194,255,0.13)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'background 0.25s',
        position: 'relative',
        zIndex: 1,
      }}>
        <Icon size={18} color="var(--accent-blue)" />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: 'var(--text)',
          marginBottom: '0.25rem',
        }}>
          {row.title}
        </div>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          lineHeight: 1.65,
        }}>
          {row.desc}
        </p>
      </div>

      {/* Status badge */}
      {!isMobile && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.3rem 0.85rem',
          borderRadius: '100px',
          background: `${row.color}14`,
          border: `1px solid ${row.color}30`,
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,
          boxShadow: active ? `0 0 12px ${row.color}4d` : 'none',
          transition: 'box-shadow 0.3s',
        }}>
          <span style={{
            width: 6, height: 6,
            borderRadius: '50%',
            background: row.color,
            display: 'inline-block',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: row.color,
            letterSpacing: '0.08em',
          }}>
            {row.status}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Static data ──────────────────────────────────────────────────

const specialities = [
  { num: '01', title: 'Granular Loss Intelligence', desc: 'Track with an itemised loss report with variance from all loss events across all production lines and asset categories.' },
  { num: '02', title: 'Period-Based Efficiency Tracking', desc: 'Deep analysis and trend analytics to track efficiency over time. Understand the patterns behind your production losses.' },
  { num: '03', title: 'Real-Time Loss Alerts', desc: 'Automated alerts to schedule a repair on a flagged asset — taking action for defined variance across defined materials.' },
]

const lossGrid = [
  { num: '01', title: 'Defect Unit Tracking', desc: 'Capture every defect event at machine level with timestamped records linked to shift, operator, and material batch.' },
  { num: '02', title: 'Human Accountability', desc: 'Link every loss event to an accountable operator and shift — creating a transparent chain of responsibility.' },
  { num: '03', title: 'Ghost Loss Analytics', desc: 'Surface unrecorded material disappearances between process steps — the losses that never reach your reports.' },
  { num: '04', title: 'Key Loss Detection', desc: 'Automated identification of top-loss patterns and repeat failure modes across zones and time periods.' },
]

const intelligenceFlow = [
  { Icon: Scan, label: 'Zero Capture', desc: 'Record every loss event at source with zero manual entry required.' },
  { Icon: Tag, label: 'Tag & Scan Validation', desc: 'Validate material identity and quantity at every hand-off point.' },
  { Icon: Activity, label: 'Zone Following', desc: 'Track material flow across zones with real-time location intelligence.' },
  { Icon: Bell, label: 'Live Alert Protocols', desc: 'Escalate variance events instantly to the right decision-maker.' },
  { Icon: BarChart2, label: 'Loss Analytics & Scans', desc: 'Convert raw loss data into actionable P&L intelligence.' },
]

const controlRows = [
  { Icon: Cpu, title: 'Machine-Level Containment', desc: 'Every machine state captured and logged — downtime, idle, and micro-stoppages included.', status: 'Auto-Tracked', color: '#00ff88' },
  { Icon: TrendingUp, title: 'Real-Time OEE Figures', desc: 'Live OEE calculated per machine, per line, per zone — updated every production cycle.', status: 'Active', color: '#00c2ff' },
  { Icon: Users, title: 'Shift-Level Accountability', desc: 'Full shift handover records with loss totals, operator signatures, and variance summaries.', status: 'Real-Time', color: '#00c2ff' },
  { Icon: AlertTriangle, title: 'Zero Factory Alerts', desc: 'Intelligent alerting when cumulative loss targets are breached — before shift end.', status: 'Live', color: '#ff6b35' },
]

const zoneRows = [
  { zone: 'Zone A — Press', oee: '87.2%', loss: '2.1%', status: 'green' },
  { zone: 'Zone B — Assembly', oee: '79.4%', loss: '4.8%', status: 'yellow' },
  { zone: 'Zone C — QC Check', oee: '91.0%', loss: '1.3%', status: 'green' },
  { zone: 'Zone D — Packaging', oee: '68.2%', loss: '9.2%', status: 'red' },
  { zone: 'Zone E — Dispatch', oee: '94.1%', loss: '0.8%', status: 'green' },
]

const outcomes = [
  { title: 'Resource Planning Clarity', desc: 'Map material consumption to production output — eliminate over-ordering and ghost stock.' },
  { title: 'Flexible & Plant Data', desc: 'Connect data from any plant, any shift, any ERP — all in one normalised view.' },
  { title: 'Time Loss', desc: 'Capture every minute of unplanned downtime with cause codes and shift attribution.' },
  { title: 'Canvas View', desc: 'Interactive floor map showing live loss zones — updated every 30 seconds.' },
]

const metrics = [
  { num: '05', suffix: '', label: 'Zones Monitored' },
  { num: '98', suffix: '%', label: 'Of production accurately tracked' },
  { num: '120', suffix: '', label: 'Period of loss variance data per shift' },
  { num: '10', suffix: '×', label: 'Faster than manual tools and staff' },
]


const personas = [
  {
    role: 'PLANT FLOOR MANAGER',
    quote: '"Real-time loss visibility — taking action before the next batch runs — not after the quarterly review surfaces the loss."',
    name: 'Production Lead',
    title: 'Line & Shift Management',
  },
  {
    role: 'OPERATIONS DIRECTOR',
    quote: '"From raw plant data to board-ready reporting — every shift, every zone, every variance accounted for in real time."',
    name: 'Ops Director',
    title: 'Strategic Production Oversight',
  },
  {
    role: 'FINANCE CONTROLLER',
    quote: '"Finally a system that reconciles material budgets with actual production loss — visible without waiting for month-end."',
    name: 'Finance Controller',
    title: 'Cost & Budget Accountability',
  },
]

// ─── Main page ────────────────────────────────────────────────────

export default function FactoryLoss() {
  const { isMobile, isTablet } = useBreakpoint()
  const [hoveredCard, setHoveredCard] = useState(null)
  const [cursor, setCursor] = useState({ x: -300, y: -300 })
  const [activeZone, setActiveZone] = useState('Zone A')

  const zoneFlowData = {
    'Zone A': { input: '-9.67', output: '51.77', delta: '-6.89', batches: '35' },
    'Zone B': { input: '-14.32', output: '43.20', delta: '-11.40', batches: '28' },
    'Zone C': { input: '-2.10', output: '61.85', delta: '-1.88', batches: '42' },
    'Zone D': { input: '-22.50', output: '31.40', delta: '-18.70', batches: '19' },
    'Zone E': { input: '-5.44', output: '58.60', delta: '-4.20', batches: '38' },
  }

  // Cursor glow — desktop only
  useEffect(() => {
    const h = (e) => setCursor({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', h, { passive: true })
    return () => window.removeEventListener('mousemove', h)
  }, [])

  // Parallax hero on scroll
  const [heroY, setHeroY] = React.useState(0)
  useEffect(() => {
    const onScroll = () => setHeroY(window.scrollY * 0.18)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Section inView refs
  const { ref: specRef, inView: specInView } = useInView({ threshold: 0.1, triggerOnce: true })
  const { ref: outcomeRef, inView: outcomeInView } = useInView({ threshold: 0.15, triggerOnce: true })
  const { ref: metricsRef, inView: metricsInView } = useInView({ threshold: 0.2, triggerOnce: true })

  return (
    <>
      <ScrollProgressBar />
      {/* Cursor glow */}
      {!isMobile && (
        <div style={{
          position: 'fixed',
          left: cursor.x - 220,
          top: cursor.y - 220,
          width: 440, height: 440,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,194,255,0.045) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 500,
          transition: 'left 0.1s ease, top 0.1s ease',
        }} />
      )}

      <Navbar />
      <main style={{ paddingTop: '80px' }}>

        {/* ══════════════════════════════════════════════════════════
            1. HERO
        ══════════════════════════════════════════════════════════ */}
        <section style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          background: 'var(--bg)',
        }}>
          {/* ── Particle network ── */}
          <ParticleCanvas />

          {/* ── Scan line sweep ── */}
          <ScanLine />

          {/* ── Dot-grid overlay ── */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(circle, rgba(0,194,255,0.13) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
          }} />

          {/* ── Ambient glow blobs ── */}
          <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,194,255,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0, filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: '5%', right: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.055) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0, filter: 'blur(50px)' }} />

          <video
            autoPlay muted loop playsInline preload="auto"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              objectPosition: '60% center',
              zIndex: 0,
              opacity: 0.28,
            }}
          >
            <source src="/loss-hero-bg.mp4" type="video/mp4" />
          </video>

          <div style={{
            position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
            background: `
              linear-gradient(to right,
                rgba(8,10,13,0.97) 0%,
                rgba(8,10,13,0.85) 40%,
                rgba(8,10,13,0.40) 75%,
                rgba(8,10,13,0.12) 100%
              ),
              linear-gradient(to bottom,
                rgba(8,10,13,0.55) 0%,
                rgba(8,10,13,0.00) 30%,
                rgba(8,10,13,0.00) 65%,
                rgba(8,10,13,0.92) 100%
              )
            `,
          }} />

          <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
            <div style={{
              maxWidth: 'none', margin: 0,
              paddingTop: isMobile ? '2.5rem' : '5rem',
              paddingBottom: isMobile ? '5rem' : '3rem',
              paddingLeft: isMobile ? '1.25rem' : 'clamp(1rem, calc((100vw - 1280px) / 2 + 2rem), 8rem)',
              paddingRight: isMobile ? '1.25rem' : '2rem',
              display: 'flex',
              alignItems: 'center',
            }}>
              {/* Left — headline + copy */}
              <div style={{
                flex: '1 1 auto',
                maxWidth: isMobile ? '100%' : '860px',
                transform: isMobile ? 'none' : `translateY(${heroY}px)`,
                willChange: isMobile ? 'auto' : 'transform',
              }}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                >
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: isMobile ? '0.58rem' : '0.65rem',
                    letterSpacing: '0.15em',
                    color: 'var(--accent-blue)',
                    textTransform: 'uppercase',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    flexWrap: 'wrap',
                    textAlign: isMobile ? 'center' : 'left',
                    justifyContent: isMobile ? 'center' : 'flex-start',
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--accent-blue)',
                      boxShadow: '0 0 8px var(--accent-blue)',
                      animation: 'pulse 2s infinite',
                      display: 'inline-block', flexShrink: 0,
                      marginTop: '3px',
                    }} />
                    {isMobile ? 'REAL-TIME LOSS DETECTION' : 'COMPLETE PLANT VISIBILITY · REAL-TIME LOSS DETECTION'}
                  </div>

                  <h1 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: isMobile ? 'clamp(2.6rem, 10vw, 3.8rem)' : 'clamp(5rem, 8.5vw, 8rem)',
                    fontWeight: 700,
                    lineHeight: 1.05,
                    letterSpacing: '-0.03em',
                    color: 'var(--text)',
                    marginBottom: '1.25rem',
                    maxWidth: '100%',
                    textAlign: isMobile ? 'center' : 'left',
                  }}>
                    <WordReveal text="Every factory leaks." delay={0.1} />
                    <WordReveal
                      text="We find where."
                      delay={0.45}
                      style={{
                        background: 'linear-gradient(135deg, #00c2ff, #00ff88)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                      }}
                      wordStyle={{
                        WebkitTextFillColor: 'transparent',
                        background: 'inherit',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                      }}
                    />
                  </h1>

                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: isMobile ? '0.92rem' : 'clamp(0.95rem, 1.3vw, 1.1rem)',
                    color: 'var(--text-muted)',
                    maxWidth: isMobile ? '100%' : '540px',
                    lineHeight: 1.75,
                    marginBottom: isMobile ? '2rem' : '3rem',
                    textAlign: isMobile ? 'center' : 'left',
                  }}>
                    Real-time material and process tracking across every production line. Every asset, every shift — so you can see exactly where yield, time, and money disappear.
                  </p>

                  {/* Stat pills — floating */}
                  <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}
                  >
                    {[
                      { num: '5%', label: 'Average Loss' },
                      { num: '98%', label: 'Accuracy' },
                      { num: '99.97%', label: 'Uptime' },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.65 + i * 0.1 }}
                      >
                        <div
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'rgba(0,194,255,0.35)'
                            e.currentTarget.style.boxShadow = '0 0 20px rgba(0,194,255,0.12)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = ''
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            padding: '0.55rem 1.25rem',
                            background: 'rgba(15,18,24,0.88)',
                            border: '1px solid var(--border)',
                            borderRadius: '100px',
                            backdropFilter: 'blur(12px)',
                            cursor: 'default',
                            transition: 'border-color 0.3s, box-shadow 0.3s',
                            animationName: 'loss-pill-float',
                            animationDuration: `${3 + i * 0.4}s`,
                            animationTimingFunction: 'ease-in-out',
                            animationDelay: `${i * 0.5}s`,
                            animationIterationCount: 'infinite',
                            willChange: 'transform',
                          }}
                        >
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.82rem',
                            fontWeight: 500,
                            color: 'var(--accent-blue)',
                            letterSpacing: '0.02em',
                          }}>
                            {stat.num}
                          </span>
                          <span style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.75rem',
                            color: 'rgba(255,255,255,0.6)',
                            letterSpacing: '0.02em',
                          }}>
                            {stat.label}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </div>{/* end left */}
            </div>
          </div>

          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '200px',
            background: 'linear-gradient(to bottom, transparent, var(--bg))',
            pointerEvents: 'none', zIndex: 2,
          }} />
        </section>

        {/* ── Marquee Ticker ── */}
        <MarqueeTicker />

        {/* ══════════════════════════════════════════════════════════
            2. PLATFORM SPECIALITIES — stagger slide-in + hover
        ══════════════════════════════════════════════════════════ */}
        <section className="section" style={{ background: 'var(--bg)' }}>
          <div className="container">
            <SectionReveal>
              <SectionLabel>PLATFORM SPECIALITIES</SectionLabel>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontWeight: 600, color: 'var(--text)',
                lineHeight: 1.1, marginBottom: '0.75rem',
              }}>
                Built for operations.<br />Designed for accountability.
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem', color: 'var(--text-muted)',
                maxWidth: '520px', lineHeight: 1.75, marginBottom: '3rem',
              }}>
                FoundryOS is the go-forward inventory platform built for OEE manufacturing on shop floor, fully autonomous, fully adaptive.
              </p>
            </SectionReveal>

            <div style={{ borderTop: '1px solid var(--border)' }}>
              <motion.div
                ref={specRef}
                variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
                initial="hidden"
                animate={specInView ? 'visible' : 'hidden'}
              >
                {specialities.map((item) => (
                  <motion.div
                    key={item.num}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(0,194,255,0.03)'
                      e.currentTarget.style.borderLeftColor = 'var(--accent-blue)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderLeftColor = 'transparent'
                    }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : '72px 1fr',
                      gap: isMobile ? '0.4rem' : '2.5rem',
                      padding: '2rem 0.5rem',
                      borderBottom: '1px solid var(--border)',
                      borderLeft: '3px solid transparent',
                      alignItems: 'start',
                      transition: 'background 0.25s, border-left-color 0.25s',
                      cursor: 'default',
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      color: 'var(--accent-blue)',
                      letterSpacing: '0.1em',
                      paddingTop: isMobile ? 0 : '3px',
                    }}>
                      {item.num}
                    </span>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '1.05rem',
                        fontWeight: 600,
                        color: 'var(--text)',
                        marginBottom: '0.45rem',
                      }}>
                        {item.title}
                      </div>
                      <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.7,
                        maxWidth: '580px',
                      }}>
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            3. LOSS INTELLIGENCE — card hover lift
        ══════════════════════════════════════════════════════════ */}
        <section className="section" style={{ background: 'var(--bg-card)' }}>
          <div className="container">
            <SectionReveal style={{ marginBottom: '2.5rem' }}>
              <SectionLabel>LOSS INTELLIGENCE</SectionLabel>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontWeight: 600, color: 'var(--text)', lineHeight: 1.1,
              }}>
                Where your material budget is being lost
              </h2>
            </SectionReveal>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              overflow: 'hidden',
              gap: '1px',
              background: 'var(--border)',
            }}>
              {lossGrid.map((item, i) => (
                <SectionReveal key={item.num} delay={i * 0.1}>
                  <LossCard item={item} />
                </SectionReveal>
              ))}
            </div>

            {/* Loss Waterfall removed */}

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            4. INTELLIGENCE LAYER — icon pulse + col hover
        ══════════════════════════════════════════════════════════ */}
        <section className="section" style={{
          background: '#060810',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}>
          <div className="container">
            <SectionReveal style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
                fontWeight: 600, color: 'var(--text)',
                lineHeight: 1.15, maxWidth: '680px', margin: '0 auto',
              }}>
                From factory floor data to actionable loss intelligence
              </h2>
            </SectionReveal>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(4,1fr)',
              borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
            }}>
              {intelligenceFlow.map(({ Icon, label, desc }, i) => (
                <SectionReveal key={label} delay={i * 0.1}>
                  <IntelligenceColumn
                    Icon={Icon}
                    label={label}
                    desc={desc}
                    index={i}
                    total={intelligenceFlow.length}
                    isMobile={isMobile}
                  />
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            5. CONTROL TIER — scanner sweep
        ══════════════════════════════════════════════════════════ */}
        <section className="section" style={{ background: 'var(--bg)' }}>
          <div className="container">
            <SectionReveal style={{ marginBottom: '2.5rem' }}>
              <SectionLabel>CONTROL TIER</SectionLabel>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontWeight: 600, color: 'var(--text)', lineHeight: 1.1,
              }}>
                Real-time Production Truth
              </h2>
            </SectionReveal>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr minmax(320px, 420px)',
              gap: isMobile ? '2rem' : '3rem',
              alignItems: 'start',
            }}>
              {/* Left — control rows */}
              <div style={{ borderTop: '1px solid var(--border)' }}>
                {controlRows.map((row, i) => (
                  <SectionReveal key={row.title} delay={i * 0.08}>
                    <ControlRow row={row} isMobile={isMobile} />
                  </SectionReveal>
                ))}
              </div>

              {/* Right — live terminal */}
              {!isMobile && (
                <div style={{
                  position: 'sticky',
                  top: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}>
                  {/* label above terminal */}
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    color: 'var(--accent-blue)',
                    letterSpacing: '0.12em',
                    opacity: 0.7,
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#00ff88',
                      boxShadow: '0 0 6px #00ff88',
                      display: 'inline-block',
                      animation: 'pulse 2s infinite',
                    }} />
                    Live system feed
                  </div>
                  <LiveTerminal />
                </div>
              )}
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════
            6. ZONE VIEW — side-by-side live dashboard layout
        ══════════════════════════════════════════════════════════ */}
        <section className="section" style={{ background: 'var(--bg-card)' }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1.35fr',
              gap: isMobile ? '3rem' : '4rem',
              alignItems: 'stretch',
            }}>

              {/* Left — label + heading + subtext + 2×2 stats */}
              <SectionReveal style={{ textAlign: isMobile ? 'center' : 'left' }}>
                <SectionLabel>LIVE DASHBOARD</SectionLabel>
                <h2 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
                  fontWeight: 400,
                  color: 'var(--text)',
                  lineHeight: 1.12,
                  marginBottom: '1.25rem',
                }}>
                  Every Zone. Every Variance. One View.
                </h2>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.94rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.75,
                  maxWidth: '420px',
                  margin: isMobile ? '0 auto 3rem' : '0 0 3rem',
                }}>
                  From high-level KPIs to granular zone-level flow analysis — everything your operations team needs, unified in real time.
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '2rem 2.5rem',
                }}>
                  {[
                    { value: '05', label: 'Zones Monitored' },
                    { value: '12K+', label: 'Data Points / Hr' },
                    { value: '<2s', label: 'Avg Response' },
                    { value: '99.97%', label: 'Uptime' },
                  ].map(({ value, label }) => (
                    <div key={label} style={{ textAlign: isMobile ? 'center' : 'left' }}>
                      <div style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                        fontWeight: 700,
                        color: 'var(--text)',
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                      }}>
                        <CountUp value={value} duration={1.5} />
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.35rem',
                      }}>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionReveal>

              {/* Right — dashboard mockup */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  background: '#0d1117',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* ── Summary KPI row ── */}
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{
                    padding: '0.65rem 1.1rem 0.4rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.52rem',
                    color: 'rgba(255,255,255,0.25)',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                  }}>SUMMARY</div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr' }}>
                    {[
                      { icon: '⚡', label: 'Efficiency', value: '-6.68%', sub: '▲ 9.82%', valColor: '#ff5f57', subColor: '#ff5f57' },
                      { icon: '⏱', label: 'Loss Volume', value: '192.58', sub: '189.45', valColor: '#fbbf24', subColor: 'rgba(255,255,255,0.32)' },
                      { icon: '↺', label: 'Recovery', value: '4.59%', sub: '738 Units', valColor: '#00c2ff', subColor: 'rgba(255,255,255,0.32)' },
                      { icon: '🔔', label: 'Alerts', value: '140', sub: '0 Resolved', valColor: '#f97316', subColor: 'rgba(255,255,255,0.32)' },
                    ].map((kpi, i) => (
                      <div key={kpi.label} style={{
                        padding: '0.5rem 0.85rem 0.85rem',
                        borderLeft: (isMobile ? i % 2 !== 0 : i > 0) ? '1px solid rgba(255,255,255,0.06)' : 'none',
                        borderTop: isMobile && i >= 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.28rem', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.58rem' }}>{kpi.icon}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'rgba(255,255,255,0.32)', letterSpacing: '0.07em' }}>{kpi.label}</span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: kpi.valColor, lineHeight: 1 }}>{kpi.value}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.48rem', color: kpi.subColor, marginTop: '0.18rem' }}>{kpi.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Body: Material Variance + Zone Flow ── */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.15fr 1fr', flex: 1, minHeight: 0 }}>

                  {/* Material Variance table */}
                  <div style={{ padding: '1.1rem 1.1rem 1.4rem', borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.06)', borderBottom: isMobile ? '1px solid rgba(255,255,255,0.06)' : 'none', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', fontWeight: 600, color: 'rgba(255,255,255,0.72)', marginBottom: '0.85rem' }}>
                      Material Variance
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 68px', flex: 1, alignContent: 'start' }}>
                      {['MATERIAL', 'VARIANCE', 'IMPACT'].map(h => (
                        <span key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.46rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', paddingBottom: '0.6rem' }}>{h}</span>
                      ))}
                      {[
                        { mat: 'Material A', variance: '-126.71', impact: '+ -68.26%', ic: '#ff5f57' },
                        { mat: 'Compound B', variance: '-140.85', impact: '+ -99.84%', ic: '#ff5f57' },
                        { mat: 'Additive C', variance: '0.00', impact: '0.00%', ic: 'rgba(255,255,255,0.35)' },
                        { mat: 'Agent D', variance: '-152.67', impact: '+ -85.70%', ic: '#ff5f57' },
                        { mat: 'Catalyst E', variance: '-88.40', impact: '+ -44.12%', ic: '#ff5f57' },
                        { mat: 'Solvent F', variance: '-34.20', impact: '+ -21.05%', ic: '#fbbf24' },
                      ].map(row => (
                        <React.Fragment key={row.mat}>
                          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: '#00c2ff', padding: '0.6rem 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>{row.mat}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', padding: '0.6rem 0', borderTop: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>{row.variance}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: row.ic, padding: '0.6rem 0', borderTop: '1px solid rgba(255,255,255,0.04)', textAlign: 'right' }}>{row.impact}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Zone Flow panel */}
                  <div style={{ padding: '1.1rem 1.1rem 1.4rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', fontWeight: 600, color: 'rgba(255,255,255,0.72)' }}>Zone Flow</span>
                      <BarChart2 size={12} color="rgba(255,255,255,0.22)" />
                    </div>
                    {/* Zone tabs */}
                    <div style={{ display: 'flex', gap: '0.28rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'].map(z => {
                        const active = z === activeZone
                        return (
                          <span key={z} onClick={() => setActiveZone(z)} style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.5rem',
                            padding: '0.22rem 0.55rem',
                            borderRadius: '100px',
                            background: active ? '#00c2ff' : 'transparent',
                            color: active ? '#080a0d' : 'rgba(255,255,255,0.32)',
                            border: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            fontWeight: active ? 600 : 400,
                            cursor: 'pointer',
                            transition: 'background 0.18s, color 0.18s',
                          }}>
                            {z}
                          </span>
                        )
                      })}
                    </div>
                    {/* 2×2 stats — fill remaining height */}
                    {(() => {
                      const zd = zoneFlowData[activeZone]
                      const stats = [
                        { label: 'INPUT', value: zd.input, color: parseFloat(zd.input) < 0 ? '#ff5f57' : '#00c2ff' },
                        { label: 'OUTPUT', value: zd.output, color: '#00c2ff' },
                        { label: 'DELTA', value: zd.delta, color: parseFloat(zd.delta) < 0 ? '#ff5f57' : '#00ff88' },
                        { label: 'BATCHES', value: zd.batches, color: 'rgba(255,255,255,0.72)' },
                      ]
                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '0.6rem', flex: 1 }}>
                          {stats.map(s => (
                            <div key={s.label} style={{
                              padding: '0.75rem 0.8rem',
                              borderRadius: '8px',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.07)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                            }}>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.44rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>{s.label}</div>
                              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </div>

                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            7. OUTCOME TOOL — stagger reveal + big stat scale
        ══════════════════════════════════════════════════════════ */}
        <section className="section" style={{ background: 'var(--bg)' }}>
          <div className="container">
            <SectionReveal style={{ marginBottom: '2.5rem', textAlign: isMobile ? 'center' : 'left' }}>
              <SectionLabel>OUTCOME TOOL</SectionLabel>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontWeight: 600, color: 'var(--text)', lineHeight: 1.1,
              }}>
                Outcomes that reach the P&amp;L.
              </h2>
            </SectionReveal>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '240px 1fr',
              gap: isMobile ? '2.5rem' : '4rem',
              alignItems: 'stretch',
            }}>
              {/* Left: big stats — scale in */}
              <div ref={outcomeRef} style={{ display: isMobile ? 'grid' : 'flex', gridTemplateColumns: isMobile ? '1fr 1fr' : undefined, flexDirection: isMobile ? undefined : 'column', gap: '0' }}>
                {[
                  { value: '+8%', label: 'Average production efficiency gain within 90 days of deployment' },
                  { value: '<3mo', label: 'Typical ROI payback period from first deployment' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.value}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={outcomeInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: i * 0.15, ease: [0.4, 0, 0.2, 1] }}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                      paddingTop: '1.5rem',
                      paddingBottom: '1.5rem',
                      borderBottom: !isMobile && i === 0 ? '1px solid var(--border)' : 'none',
                      borderRight: isMobile && i === 0 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                      fontWeight: 700,
                      color: 'var(--accent-blue)',
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                    }}>
                      {stat.value}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.5rem',
                      lineHeight: 1.65,
                      maxWidth: '200px',
                    }}>
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Right: 2×2 outcomes — stagger */}
              <motion.div
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                initial="hidden"
                animate={outcomeInView ? 'visible' : 'hidden'}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: 'var(--border)',
                  gap: '1px',
                }}
              >
                {outcomes.map((item) => (
                  <motion.div
                    key={item.title}
                    variants={{
                      hidden: { opacity: 0, y: 24 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
                    }}
                    style={{ padding: '1.75rem', background: 'var(--bg-card)' }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.95rem', fontWeight: 600,
                      color: 'var(--text)', marginBottom: '0.5rem',
                    }}>
                      {item.title}
                    </div>
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.65,
                    }}>
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            8. METRICS — light theme matching CTA section
        ══════════════════════════════════════════════════════════ */}
        <section className="section" style={{
          background: '#D6D6D6',
          borderTop: '1px solid #C2BEB9',
          borderBottom: '1px solid #C2BEB9',
        }}>
          <div className="container">
            <SectionReveal style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontWeight: 600, color: '#222222', lineHeight: 1.15,
              }}>
                Measurable impact across every metric
              </h2>
            </SectionReveal>

            <div
              ref={metricsRef}
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
                borderTop: '1px solid #C2BEB9',
              }}
            >
              {metrics.map((m, i) => (
                <div
                  key={m.num}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.background = '#B8D0F8'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.background = 'transparent'
                  }}
                  style={{
                    padding: isMobile ? '2rem 1rem' : '2.5rem 2rem',
                    borderBottom: isMobile && i < 2 ? '1px solid #C2BEB9' : 'none',
                    textAlign: 'center',
                    transition: 'transform 0.25s, background 0.25s',
                    position: 'relative',
                    cursor: 'default',
                  }}
                >
                  {/* Animated right divider */}
                  {!isMobile && i < metrics.length - 1 && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={metricsInView ? { height: '100%' } : {}}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      style={{
                        width: 1,
                        background: '#C2BEB9',
                        position: 'absolute',
                        top: 0, right: 0,
                      }}
                    />
                  )}
                  {isMobile && i % 2 === 0 && (
                    <div style={{
                      width: 1, background: '#C2BEB9',
                      position: 'absolute', top: 0, right: 0, height: '100%',
                    }} />
                  )}

                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(3rem, 6vw, 5rem)',
                    fontWeight: 700,
                    color: '#1638A8',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    textShadow: 'none',
                  }}>
                    {metricsInView
                      ? <CountUp value={`${m.num}${m.suffix}`} duration={1.4} />
                      : '0'
                    }
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.82rem',
                    color: '#4B5563',
                    marginTop: '0.75rem',
                    lineHeight: 1.5,
                    maxWidth: '150px',
                    margin: '0.75rem auto 0',
                  }}>
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            9. INTEGRATIONS — stagger columns + item hover
        ══════════════════════════════════════════════════════════ */}
        <section className="section" style={{ background: 'var(--bg)', padding: '1.75rem 0' }}>
          <div className="container">
            <SectionReveal style={{ marginBottom: '0.75rem' }}>
              <SectionLabel>INTEGRATIONS</SectionLabel>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.35rem, 2.4vw, 1.95rem)',
                fontWeight: 600, color: 'var(--text)',
                lineHeight: 1.1, marginBottom: '0.4rem',
              }}>
                Connects to virtually any system
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.83rem', color: 'var(--text-muted)',
                maxWidth: '540px', lineHeight: 1.55, marginBottom: 0,
              }}>
                Plug-in modules designed to plug into any part of your industrial technology stack — from machines to enterprise.
              </p>
            </SectionReveal>

            {/* ── Infographic: Integration Hub-Spoke ── */}
            <IntegrationHubSpoke isMobile={isMobile} />

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            10. PROOF POINTS — spotlight with scale
        ══════════════════════════════════════════════════════════ */}
        <section className="section" style={{ background: 'var(--bg-card)' }}>
          <div className="container">
            <SectionReveal style={{ marginBottom: '3rem' }}>
              <SectionLabel>PROOF POINTS</SectionLabel>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontWeight: 600, color: 'var(--text)', lineHeight: 1.1,
              }}>
                The right information reaching the right decision-maker
              </h2>
            </SectionReveal>

            <div className="proof-grid" style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)',
              gap: '1.25rem',
            }}>
              {personas.map((p, i) => {
                const isActive = hoveredCard === i
                const isDimmed = hoveredCard !== null && hoveredCard !== i
                return (
                  <TiltCard
                    key={p.role}
                    i={i}
                    p={p}
                    isActive={isActive}
                    isDimmed={isDimmed}
                    onEnter={() => setHoveredCard(i)}
                    onLeave={() => setHoveredCard(null)}
                  />
                )
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            11. CTA — shimmer buttons
        ══════════════════════════════════════════════════════════ */}
        <section style={{
          background: '#E9E9E9',
          padding: isMobile ? '4rem 1.25rem 0 1.25rem' : '7rem 2rem 0 2rem',
          paddingBottom: isMobile ? '0' : '70px',
          position: 'relative',
        }}>
          <div style={{
            maxWidth: '700px',
            margin: '0 auto',
            textAlign: 'center',
            paddingBottom: '4rem',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 3.8vw, 3.2rem)',
              fontWeight: 400, color: '#111111',
              lineHeight: 1.1, letterSpacing: '-0.02em',
              marginBottom: '1.25rem',
            }}>
              Stop estimating your losses.<br />Start measuring them.
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem', color: '#666666',
              maxWidth: '480px', margin: '0 auto 2.5rem', lineHeight: 1.65,
            }}>
              And to simplify and to streamline that work for your team — with applied science that goes far to waste, not before.
            </p>
            <div style={{
              display: 'flex', gap: '1rem',
              justifyContent: 'center', flexWrap: 'wrap',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
            }}>
              {['CONTACT US', 'LEARN MORE'].map((label, idx) => (
                <MagneticButton
                  key={label}
                  href="#"
                  className="loss-btn-shimmer"
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.72rem', fontWeight: 500,
                    letterSpacing: '0.12em', color: '#111111',
                    border: '1px solid #AAAAAA', borderRadius: '100px',
                    padding: '0.75rem 2rem', textDecoration: 'none',
                    background: 'transparent',
                    width: isMobile ? '100%' : 'auto',
                    maxWidth: isMobile ? '300px' : 'none',
                    textAlign: 'center',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#111111'
                    e.currentTarget.style.background = 'rgba(0,0,0,0.04)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#AAAAAA'
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {label}
                </MagneticButton>
              ))}
            </div>
          </div>

          {/* Floating dark card */}
          <div style={{
            position: isMobile ? 'relative' : 'absolute',
            bottom: isMobile ? undefined : '-70px',
            left: isMobile ? undefined : '50%',
            transform: isMobile ? undefined : 'translateX(-50%)',
            width: isMobile ? '100%' : 'calc(100% - 4rem)',
            maxWidth: '1100px',
            zIndex: 10,
            background: '#1A1A1A',
            borderRadius: '20px',
            padding: isMobile ? '2rem 1.5rem' : '2.5rem 3.5rem',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: '2rem', flexWrap: 'wrap',
            boxSizing: 'border-box',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            margin: isMobile ? '0 auto' : undefined,
          }}>
            <div style={{ flex: 1, minWidth: isMobile ? '0' : '260px' }}>
              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                fontWeight: 400, color: '#FFFFFF',
                marginBottom: '0.5rem', lineHeight: 1.2,
              }}>
                Works with what you already have
              </h3>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.65,
              }}>
                Connects to your existing ERP, MES, and sensor network — no replacement required.
              </p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: '1.25rem', flexShrink: 0,
              flexWrap: 'wrap',
              width: isMobile ? '100%' : 'auto',
            }}>
              <button
                className="loss-btn-shimmer"
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.88rem', fontWeight: 500,
                  color: '#111111', background: '#FFFFFF',
                  border: 'none', borderRadius: '100px',
                  padding: '0.75rem 1.75rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  whiteSpace: 'nowrap',
                  width: isMobile ? '100%' : 'auto',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F0F0F0' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF' }}
              >
                Book Consultant
              </button>
              <a
                href="#"
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.85rem', fontWeight: 400,
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  transition: 'color 0.2s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
              >
                Explorer Services ↗
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />
      <StickyBottomBar />

      <style>{`
        main .section {
          padding: 3rem 0;
        }
        @media (max-width: 768px) {
          main .section {
            padding: 2rem 0;
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.35; transform: scale(1.08); }
        }
        @keyframes loss-pill-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes terminal-cursor {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes scanline {
          0%   { top: -2px;   opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 100%;  opacity: 0; }
        }
        @keyframes spin-slow {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes orbit {
          0%   { transform: rotate(0deg)   translateX(38px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(38px) rotate(-360deg); }
        }
        @keyframes float-y {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        .stat-orb {
          animation: float-y 3.5s ease-in-out infinite;
        }
        .stat-orb:nth-child(2) { animation-delay: -1.1s; }
        .stat-orb:nth-child(3) { animation-delay: -2.2s; }
        .stat-orb:nth-child(4) { animation-delay: -0.6s; }
        .row-sweep-active {
          left: 100% !important;
          transition: left 0.55s ease !important;
        }
        .loss-btn-shimmer {
          position: relative;
          overflow: hidden;
        }
        .loss-btn-shimmer::after {
          content: '';
          position: absolute;
          top: -50%; left: -75%;
          width: 50%; height: 200%;
          background: linear-gradient(
            105deg,
            transparent 40%,
            rgba(255,255,255,0.18) 50%,
            transparent 60%
          );
          transform: skewX(-15deg);
        }
        .loss-btn-shimmer:hover::after {
          left: 125%;
          transition: left 0.45s ease;
        }
        @media (max-width: 900px) {
          .proof-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
