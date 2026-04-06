import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = {
  children: ReactNode
  variant?: Variant
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  const variantClass =
    variant === 'primary'
      ? styles.primary
      : variant === 'secondary'
        ? styles.secondary
        : styles.ghost

  return (
    <button
      type={type}
      className={[styles.button, variantClass, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}
