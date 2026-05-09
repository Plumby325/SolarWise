import { Link } from 'react-router-dom'
import styles from './BackNavLink.module.css'

type BackNavLinkProps = {
  to: string
  children: string
  className?: string
}

export function BackNavLink({ to, children, className = '' }: BackNavLinkProps) {
  return (
    <Link className={[styles.backLink, className].filter(Boolean).join(' ')} to={to}>
      {children}
    </Link>
  )
}
