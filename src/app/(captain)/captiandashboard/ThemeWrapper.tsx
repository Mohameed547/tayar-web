'use client'
import { useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const theme    = useAppSelector(s => s.ui.theme)
  const language = useAppSelector(s => s.ui.language)

  useEffect(() => {
    const html = document.documentElement
    html.classList.toggle('dark', theme === 'dark')
    html.setAttribute('dir',  language === 'ar' ? 'rtl' : 'ltr')
    html.setAttribute('lang', language)
  }, [theme, language])

  return <>{children}</>
}
