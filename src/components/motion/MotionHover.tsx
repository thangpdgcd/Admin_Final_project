import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { hoverCardMotion } from "@/components/motion/variants"

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
      whileHover={hoverCardMotion.whileHover}
      whileTap={hoverCardMotion.whileTap}
      transition={hoverCardMotion.transition}
    >
      {children}
    </motion.div>
  )
}
