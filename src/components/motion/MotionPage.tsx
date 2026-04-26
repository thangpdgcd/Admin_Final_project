import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { pageTransition, pageVariants } from "@/components/motion/variants"

type MotionPageProps = {
  motionKey: string
  className?: string
  children: React.ReactNode
}

export const MotionPage = ({ motionKey, className, children }: MotionPageProps) => {
  const reduced = useReducedMotion()

  if (reduced) {
    return (
      <div key={motionKey} className={className}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      key={motionKey}
      className={className}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {children}
    </motion.div>
  )
}
