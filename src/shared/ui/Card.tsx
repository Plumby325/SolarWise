import type { ReactNode } from 'react'
import styles from './Card.module.css'

type CardProps = {
  children: ReactNode
  title?: string
  className?: string
}

export function Card({ children, title, className = '' }: CardProps) {
  return (
    <section className={[styles.card, className].filter(Boolean).join(' ')}>
      {title ? (
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
        </header>
      ) : null}
      <div className={styles.body}>{children}</div>
    </section>
  )
}
