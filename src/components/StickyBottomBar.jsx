import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Mail, X } from 'lucide-react'
import { useBreakpoint } from '../hooks/useBreakpoint'

export default function StickyBottomBar() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [email, setEmail] = useState('')
  const { isMobile } = useBreakpoint()

  useEffect(() => {
    const handleScroll = () => {
      setVisible(!dismissed && window.scrollY > window.innerHeight)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [dismissed])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 900,
            background: 'rgba(8,10,13,0.95)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: isMobile ? '1rem 1.25rem' : '0.9rem 2rem',
          }}
        >
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between',
            gap: isMobile ? '0.75rem' : '1.5rem',
            flexWrap: 'wrap',
          }}>
            <div>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text)',
              }}>
                Stop estimating your losses
              </span>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginLeft: '0.75rem',
              }}>
                — get a live demo in 30 minutes
              </span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '0.5rem',
              alignItems: isMobile ? 'stretch' : 'center',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '0.5rem 0.9rem',
              }}>
                <Mail size={14} color="var(--text-muted)" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Work email"
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    color: 'var(--text)',
                    width: isMobile ? '100%' : '180px',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <a
                  href="#cta"
                  className="btn btn-primary"
                  style={{
                    padding: '0.5rem 1.2rem',
                    fontSize: '0.82rem',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  Book a Demo <ArrowRight size={14} />
                </a>

                <button
                  onClick={() => {
                    setDismissed(true);
                    setVisible(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    marginLeft: '0.5rem',
                    borderRadius: '4px',
                    transition: 'color 0.2s, background 0.2s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--text)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text-muted)'
                    e.currentTarget.style.background = 'none'
                  }}
                  aria-label="Dismiss"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
