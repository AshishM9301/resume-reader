import React from 'react'

interface NavPillProps {
  label: string
  href: string
  active?: boolean
}

const NavPill: React.FC<NavPillProps> = ({ label, href, active = false }) => {
  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`
        px-[14px] py-[7px] rounded-full text-[13px] font-medium transition-all duration-150
        ${active
          ? 'bg-white shadow-sm text-[var(--ink)]'
          : 'text-[#666666] hover:text-[var(--ink)]'
        }
      `}
    >
      {label}
    </a>
  )
}

export default NavPill