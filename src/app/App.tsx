import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/components/context/AuthContext"
import { AppRoutes } from "@/routes/AppRoutes"
import { AntdProvider } from "@/app/providers/AntdProvider"

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AntdProvider>
            <div className="min-h-screen bg-background text-foreground transition-[background-color,color,border-color] duration-700 ease-in-out">
              <AppRoutes />
              <Toaster position="top-right" richColors />
            </div>
          </AntdProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
