import { AnimatePresence } from "framer-motion"
import { Outlet, useLocation } from "react-router-dom"
import { MotionPage } from "@/components/motion/MotionPage"

export const AuthLayout = () => {
  const location = useLocation()
  return (
    <div className="min-h-svh flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait" initial={false}>
          <MotionPage motionKey={location.pathname}>
            <Outlet />
          </MotionPage>
        </AnimatePresence>
      </div>
    </div>
  )
}
