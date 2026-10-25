import React, { forwardRef, InputHTMLAttributes } from 'react'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <div>
        <label htmlFor={props.id} className="sr-only">
          {props.placeholder || 'Email'}
        </label>
        <input
          ref={ref}
          className={`
            w-full h-[42px] px-[20px] py-[13px] bg-white border rounded-full text-[13px] text-[var(--ink)]
            placeholder:text-[var(--muted)] transition-all duration-150
            focus:outline-none focus:border-[var(--ink)]
            ${error ? 'border-red-500' : 'border-[var(--border)]'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-[11px] text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

TextInput.displayName = 'TextInput'

export default TextInput