import * as React from "react"
import { Button, type ButtonProps } from "antd"
import { motion, useReducedMotion } from "framer-motion"
import { buttonMotion, tapMotion } from "@/components/motion/variants"
import { cn } from "@/utils/utils"

type AppButtonProps = ButtonProps & {
  motionTap?: boolean
  motionHover?: boolean
}

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ className, motionTap = true, motionHover = true, ...props }, ref) => {
    const reduced = useReducedMotion()

    const btn = <Button ref={ref} className={cn(className)} {...props} />

    if (reduced) return btn
    if (!motionTap && !motionHover) return btn

    return (
      <motion.div
        whileHover={motionHover ? buttonMotion.whileHover : undefined}
        whileTap={motionTap ? tapMotion.whileTap : undefined}
        transition={motionHover ? buttonMotion.transition : tapMotion.transition}
      >
        {btn}
      </motion.div>
    )
  },
)

AppButton.displayName = "AppButton"
