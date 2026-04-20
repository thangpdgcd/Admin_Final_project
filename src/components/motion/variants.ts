export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
} as const

export const pageTransition = {
  duration: 0.18,
  ease: "easeOut",
} as const

