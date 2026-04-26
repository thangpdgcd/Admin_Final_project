import { Card, type CardProps } from "antd"
import { MotionHover } from "@/components/motion/MotionHover"
import { cn } from "@/utils/utils"

type AppCardProps = CardProps & {
  motionHover?: boolean
}

export const AppCard = ({ className, motionHover = false, ...props }: AppCardProps) => {
  const card = <Card className={cn(className)} {...props} />
  if (!motionHover) return card
  return <MotionHover className="h-full">{card}</MotionHover>
}
