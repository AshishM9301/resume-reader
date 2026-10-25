import React, { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary'
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({ variant, children, className = '', ...props }) => {
  const baseStyles = 'px-[18px] py-[12px] rounded-full text-[13px] font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

  const variantStyles = {
    primary: 'bg-[var(--ink)] text-white hover:bg-black focus-visible:ring-[var(--ink)]',
    secondary: 'bg-white border border-[var(--border)] text-[var(--ink)] hover:bg-[#F5F5F3] focus-visible:ring-[var(--border)]',
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button