import { motion } from 'motion/react'
import { useState } from 'react'

export default function MotionCard({ label = 'Motif' }: { label?: string }) {
  const [count, setCount] = useState(0)
  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100%', background: '#0b0b10' }}>
      <motion.button
        type="button"
        data-testid="motion-box"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', visualDuration: 0.5, bounce: 0.25 }}
        onClick={() => setCount((n) => n + 1)}
        style={{
          padding: '24px 32px',
          border: 0,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #6a5cff, #ff5ca8)',
          color: 'white',
          font: '600 24px system-ui',
        }}
      >
        {label} · {count}
      </motion.button>
    </div>
  )
}
