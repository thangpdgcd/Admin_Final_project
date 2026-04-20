import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"

type MotionHoverProps = {
  children: React.ReactNode
  className?: string
}

export const MotionHover = ({ children, className }: MotionHoverProps) => {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  )
}

