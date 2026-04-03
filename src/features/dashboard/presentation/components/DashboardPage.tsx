import styles from '@/shared/styles/Page.module.css'

export function DashboardPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>대시보드</h1>
      <p className={styles.lead}>차트·요약 카드·목 데이터는 이후 단계에서 채웁니다.</p>
    </div>
  )
}
