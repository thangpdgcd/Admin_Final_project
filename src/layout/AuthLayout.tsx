import * as React from "react"
import { AnimatePresence } from "framer-motion"
import { Outlet, useLocation } from "react-router-dom"
import { MotionPage } from "@/components/motion/MotionPage"

export const AuthLayout = () => {
  const location = useLocation()

  React.useEffect(() => {
    const html = document.documentElement
    const body = document.body

    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow

    html.style.overflow = "hidden"
    body.style.overflow = "hidden"

    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
    }
  }, [])

  return (
    <div className="auth-root min-h-svh overflow-x-hidden">
      <div className="min-h-svh grid lg:grid-cols-2 overflow-x-hidden">
        {/* Welcome Hero */}
        <div className="auth-hero relative hidden lg:flex flex-col justify-between">
          <div className="px-10 pt-16">
            <div className="auth-hero-brand text-sm tracking-[0.22em] uppercase">Coffee Shop Admin</div>
            <div className="mt-10 auth-hero-headline leading-[0.95]">
              The Warm
              <br />
              Curator.
            </div>
            <p className="mt-6 max-w-md auth-hero-subcopy">
              Welcome back to your dashboard. Manage your storefront with precision and warmth.
            </p>
          </div>

          <div className="px-10 pb-12">
            <div className="auth-hero-footnote text-xs">“Curating moments, managing legacies.”</div>
          </div>
        </div>

        {/* Form area */}
        <div className="auth-shell flex items-center justify-center px-4 py-10 lg:px-10">
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait" initial={false}>
              <MotionPage motionKey={location.pathname}>
                <Outlet />
              </MotionPage>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
