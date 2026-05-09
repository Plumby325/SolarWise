import { useDefaultPlant } from '@/shared/hooks/useDefaultPlant'
import { DashboardSidebar } from '@/shared/layout/DashboardSidebar'
import { BackNavLink } from '@/shared/ui/BackNavLink'
import { formatSessionUserRole, getSessionUser, getSessionUserRoleLabel } from '@/shared/utils/sessionUser'
import styles from './ProfileSettingsPage.module.css'

export function ProfileSettingsPage() {
  const currentUser = getSessionUser()
  const userInitial = currentUser.name.charAt(0)
  const { plants, defaultPlant: selectedPlant } = useDefaultPlant()
  const plantCountText = `${plants.length || 0}개`

  return (
    <div className={styles.pageShell}>
      <DashboardSidebar activeSection="dashboard" profileActive />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <BackNavLink to="/dashboard">← 돌아가기</BackNavLink>
            <h1>내 프로필</h1>
          </div>
          <span>마지막 로그인: 2026.00.00 00:00</span>
        </header>

        <div className={styles.contentGrid}>
          <aside className={styles.profileCard} aria-label="프로필 요약">
            <div className={styles.profileHero}>
              <span>{userInitial}</span>
            </div>
            <h2>{currentUser.name}</h2>
            <strong className={styles.roleBadge}>{getSessionUserRoleLabel(currentUser.role)}</strong>

            <div className={styles.profileStats}>
              <span>
                <b>{plantCountText}</b>
                등록 발전소
              </span>
              <span>
                <b>28일</b>
                이용 기간
              </span>
              <span>
                <b>7건</b>
                해결된 이상
              </span>
            </div>

            <p>가입일: 2026.04.06</p>
          </aside>

          <section className={styles.accountCard} aria-labelledby="account-info-title">
            <header className={styles.cardHeader}>
              <div>
                <h2 id="account-info-title">계정 정보</h2>
                <p>회원 정보는 관리자를 통해서만 변경할 수 있습니다.</p>
              </div>
              <span>조회 전용</span>
            </header>

            <div className={styles.infoList}>
              <article className={styles.infoItem}>
                <span aria-hidden="true">◉</span>
                <div>
                  <small>이름</small>
                  <strong>{currentUser.name}</strong>
                </div>
              </article>
              <article className={styles.infoItem}>
                <span aria-hidden="true">◇</span>
                <div>
                  <small>이메일</small>
                  <strong>{currentUser.email}</strong>
                </div>
              </article>
              <article className={styles.infoItem}>
                <span aria-hidden="true">◆</span>
                <div>
                  <small>역할</small>
                  <strong>{formatSessionUserRole(currentUser.role)}</strong>
                </div>
              </article>
            </div>

            <div className={styles.divider} />

            <h3>연결된 발전소</h3>
            {selectedPlant ? (
              <article className={styles.plantCard}>
                <strong>{selectedPlant.name}</strong>
                <span>{selectedPlant.capacityKw.toLocaleString('ko-KR')} kW · {selectedPlant.status}</span>
                <small>
                  인버터: {selectedPlant.inverterModel ?? '-'} · 센서: {selectedPlant.sensorSerialNumber ?? '-'}
                </small>
              </article>
            ) : (
              <article className={styles.emptyPlant}>연결된 발전소가 없습니다.</article>
            )}

            <div className={styles.notice}>
              <span aria-hidden="true">ℹ</span>
              프로필 정보 변경이 필요하면 시스템 관리자에게 문의하세요.
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
