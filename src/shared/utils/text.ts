export function getFallbackText(value: string | null | undefined, fallback: string) {
  return value?.trim() ? value : fallback
}
