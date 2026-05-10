export function formatKoreanDateTime(value: string | number | Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))
}

export function formatKoreanTime(value: string | number | Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))
}

export function formatKoreanMonthDay(value: string | number | Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(value))
}

export function formatRelativeTime(value: string | number | Date) {
  const elapsedMs = Date.now() - new Date(value).getTime()
  const elapsedMinutes = Math.max(0, Math.floor(elapsedMs / (60 * 1000)))

  if (elapsedMinutes < 1) {
    return '방금 전'
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}분 전`
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60)

  if (elapsedHours < 24) {
    return `${elapsedHours}시간 전`
  }

  if (elapsedHours < 48) {
    return formatKoreanDateTime(value)
  }

  return `${Math.floor(elapsedHours / 24)}일 전`
}

export function formatUsagePeriodSince(createdAt: string | number | Date): string {
  const start = new Date(createdAt).getTime()
  if (Number.isNaN(start)) {
    return '—'
  }

  const totalMs = Math.max(0, Date.now() - start)
  const totalDays = Math.floor(totalMs / 86_400_000)

  if (totalDays < 1) {
    return '1일 미만'
  }

  if (totalDays < 30) {
    return `${totalDays}일`
  }

  if (totalDays < 365) {
    const months = Math.floor(totalDays / 30)
    const days = totalDays % 30
    return days > 0 ? `${months}개월 ${days}일` : `${months}개월`
  }

  const years = Math.floor(totalDays / 365)
  const afterYears = totalDays % 365
  const months = Math.floor(afterYears / 30)
  const days = afterYears % 30

  const parts: string[] = [`${years}년`]
  if (months > 0) {
    parts.push(`${months}개월`)
  } else if (days > 0) {
    parts.push(`${days}일`)
  }

  return parts.join(' ')
}

export function formatKoreanSignupYmd(value: string | number | Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}
