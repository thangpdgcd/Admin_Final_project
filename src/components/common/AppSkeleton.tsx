import { Skeleton, type SkeletonProps } from "antd"
import { cn } from "@/utils/utils"

type AppSkeletonProps = SkeletonProps & {
  className?: string
}

export const AppSkeleton = ({ className, ...props }: AppSkeletonProps) => {
  return <Skeleton className={cn(className)} {...props} />
}
