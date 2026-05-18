import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Linkedin, Twitter, Youtube, Github } from 'lucide-react'
import { useBreakpoint } from '../hooks/useBreakpoint'

const footerLinks = {
  'Quick Links': ['About Us', 'Our Story', 'Team', 'Careers', 'Press'],
  'Services': ['Implementation', 'Training', 'Support', 'Integration', 'Consulting'],
  'Insights': ['Case Studies', 'Whitepapers', 'Webinars', 'Blog', 'Events'],
  'Contact': ['hello@carbynetech.com', '+44 20 7946 0958', 'London · Pune · Dubai', 'careers@carbynetech.com'],
}

const socialIcons = [
  { Icon: Linkedin, label: 'LinkedIn' },
  { Icon: Twitter, label: 'Twitter' },
  { Icon: Youtube, label: 'YouTube' },
  { Icon: Github, label: 'GitHub' },
]

export default function Footer() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  const { isMobile } = useBreakpoint()

  return (
    <footer style={{
      background: '#060810',
      borderTop: '1px solid var(--border)',
      paddingTop: isMobile ? '100px' : '110px',
    }}>
      <div className="container" style={{ paddingBottom: '3rem' }}>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr 1fr',
            gap: '2rem',
            marginBottom: '4rem',
          }}>
            <div style={{ gridColumn: isMobile ? '1 / -1' : '1' }}>
              <a href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
                <img
                  src="/newlogo.png"
                  alt="Carbyne Tech"
                  style={{
                    height: '78px',
                    width: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    borderRadius: '4px',
                  }}
                />
              </a>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginTop: '1rem',
                lineHeight: 1.7,
                maxWidth: '220px',
              }}>
                The intelligent shop floor platform — trusted by manufacturers in 18 countries.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                {socialIcons.map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    style={{
                      width: '36px',
                      height: '36px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      transition: 'border-color 0.2s, color 0.2s, background 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--accent-blue)'
                      e.currentTarget.style.color = 'var(--accent-blue)'
                      e.currentTarget.style.background = 'rgba(0,194,255,0.08)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.color = 'var(--text-muted)'
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  letterSpacing: '0.15em',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '1.25rem',
                }}>
                  {title}
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {links.map(link => (
                    <li key={link}>
                      <a
                        href="#"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.875rem',
                          color: 'var(--text-muted)',
                          textDecoration: 'none',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => e.target.style.color = 'var(--text)'}
                        onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}>
              © 2026 Carbyne Tech Ltd. All rights reserved. SFX9 is a registered trademark.
            </span>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {['Privacy Policy', 'Terms of Use', 'Cookie Policy'].map(l => (
                <a
                  key={l}
                  href="#"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.color = 'var(--text)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          footer .container > div > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          footer .container > div > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  )
}
