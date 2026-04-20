import * as React from "react"
import { cn } from "@/lib/utils"

type SectionProps = React.ComponentProps<"section"> & {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
}

export const Section = ({ title, description, actions, className, children, ...props }: SectionProps) => {
  return (
    <section className={cn("min-w-0", className)} {...props}>
      {(title || description || actions) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            {title && <h1 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

