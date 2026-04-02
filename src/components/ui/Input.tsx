import type { InputHTMLAttributes } from 'react'
import { useId } from 'react'
import styles from './Input.module.css'

type InputProps = {
  label: string
  error?: string
  className?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>

export function Input({ label, error, className = '', ...rest }: InputProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        className={[styles.input, error ? styles.inputError : ''].filter(Boolean).join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
