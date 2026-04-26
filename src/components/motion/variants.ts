export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
} as const

export const pageTransition = {
  duration: 0.28,
  ease: "easeOut",
} as const

export const hoverCardMotion = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.985 },
  transition: { duration: 0.2, ease: "easeOut" },
} as const

export const tapMotion = {
  whileTap: { scale: 0.985 },
  transition: { duration: 0.12, ease: "easeOut" },
} as const

export const buttonMotion = {
  whileHover: { y: -1 },
  whileTap: { scale: 0.97 },
  transition: { duration: 0.16, ease: "easeOut" },
} as const
