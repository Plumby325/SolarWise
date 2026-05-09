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
