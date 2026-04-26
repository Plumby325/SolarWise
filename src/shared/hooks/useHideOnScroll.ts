import { useEffect, useState } from 'react'

export function useHideOnScroll(threshold = 8) {
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    let previousY = window.scrollY

    const handleScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - previousY

      if (currentY <= threshold) {
        setIsHidden(false)
      } else if (Math.abs(delta) > threshold) {
        setIsHidden(delta > 0)
      }

      previousY = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [threshold])

  return isHidden
}
