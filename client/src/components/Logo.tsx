import React from 'react'

interface LogoProps {
  className?: string
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 14 14"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="0" width="4" height="4" rx="1" transform="rotate(45 5 2)" />
      <rect x="0" y="5" width="4" height="4" rx="1" transform="rotate(45 2 7)" />
      <rect x="10" y="5" width="4" height="4" rx="1" transform="rotate(45 12 7)" />
      <rect x="3" y="10" width="4" height="4" rx="1" transform="rotate(45 5 12)" />
    </svg>
  )
}

export default Logo