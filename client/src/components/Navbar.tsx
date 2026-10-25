'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Logo from './Logo'
import NavPill from './NavPill'
import { NAV_ITEMS } from '@/lib/nav'

const Navbar: React.FC = () => {
  const pathname = usePathname()

  return (
    <header className="h-[76px] flex items-center">
      <div className="container-page w-full">
        <div className="grid grid-cols-[auto_1fr_auto] items-center">
          <div className="flex items-center">
            <Logo className="text-[var(--ink)]" />
          </div>

          <div className="flex justify-center w-full">
            <nav className="inline-flex bg-[var(--pill-track)] rounded-full px-[4px] py-[4px]">
              {NAV_ITEMS.map((item) => (
                <NavPill
                  key={item.label}
                  label={item.label}
                  href={item.href}
                  active={pathname === item.href}
                />
              ))}
            </nav>
          </div>

          <div className="w-[16px]" />
        </div>
      </div>
    </header>
  )
}

export default Navbar