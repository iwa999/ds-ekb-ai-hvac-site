// app/layout.tsx
import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'DS EKB AI HVAC',
  description: 'AI-усиленный HVAC-сайт'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head />
      <body className="min-h-screen bg-white antialiased text-gray-900">
        {children}
      </body>
    </html>
  )
}
