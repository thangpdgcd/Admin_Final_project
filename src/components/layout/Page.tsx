import * as React from "react"
import { cn } from "@/lib/utils"
import { Container } from "@/components/layout/Container"

type PageProps = React.ComponentProps<"div"> & {
  /**
   * When true, the page content touches the edges (good for complex UIs like chat).
   * When false, applies consistent responsive padding and spacing.
   */
  fullBleed?: boolean
  containerSize?: React.ComponentProps<typeof Container>["size"]
}

export const Page = ({
  className,
  fullBleed,
  containerSize = "xl",
  children,
  ...props
}: PageProps) => {
  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col",
        fullBleed ? "gap-0 p-0" : "gap-4 bg-muted/20 p-3 sm:p-4 lg:gap-5 lg:p-6",
        className
      )}
      {...props}
    >
      <Container size={fullBleed ? "full" : containerSize}>{children}</Container>
    </div>
  )
}

