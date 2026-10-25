import React from 'react'

const LegalText: React.FC = () => {
  return (
    <p className="text-[11px] text-[var(--muted)] leading-[1.5]">
      By signing up, you agree to the{' '}
      <a href="#" className="underline underline-offset-2 hover:text-[#666666]">
        Terms of Use
      </a>
      {', '}
      <a href="#" className="underline underline-offset-2 hover:text-[#666666]">
        Privacy Notice
      </a>
      {' '}and{' '}
      <a href="#" className="underline underline-offset-2 hover:text-[#666666]">
        Cookie Notice
      </a>
      .
    </p>
  )
}

export default LegalText