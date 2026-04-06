import styles from '@/shared/styles/Page.module.css'

export function SettingsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>설정</h1>
      <p className={styles.lead}>폼·토글 등 설정 UI는 API 스펙이 정해지면 연결합니다.</p>
    </div>
  )
}
