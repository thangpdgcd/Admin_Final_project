import * as React from "react"
import { Coffee } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
}

export function Logo({ size = 24, className, ...props }: LogoProps) {
  return (
    <div
      className={cn("flex items-center gap-2 font-semibold", className)}
      {...props}
    >
      <Coffee size={size} className="text-primary" />
      <span>Coffee Shop</span>
    </div>
  )
}
