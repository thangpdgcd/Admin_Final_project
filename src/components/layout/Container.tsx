import * as React from "react"
import { cn } from "@/lib/utils"

type ContainerProps = React.ComponentProps<"div"> & {
  /**
   * Constrain content width for reading comfort.
   * - `full`: no max width
   * - `xl`: typical dashboard content width
   */
  size?: "full" | "xl"
}

export const Container = ({ className, size = "xl", ...props }: ContainerProps) => {
  return (
    <div
      className={cn(
        "w-full min-w-0",
        size === "xl" && "mx-auto max-w-screen-2xl",
        className
      )}
      {...props}
    />
  )
}

