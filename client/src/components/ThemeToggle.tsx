'use client'

import React from 'react'
import { useTheme } from './ThemeProvider'

const ThemeToggle = () => {
  const { theme, cycleTheme } = useTheme()

  const icons = {
    light: '☀️',
    dark: '🌙',
    system: '💻'
  }

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      title={`Current: ${theme}`}
    >
      {icons[theme]}
    </button>
  )
}

export default ThemeToggle