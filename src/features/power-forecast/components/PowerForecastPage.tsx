import { DashboardSidebar } from '@/shared/layout/DashboardSidebar'
import styles from './PowerForecastPage.module.css'

const periodFilters = ['오늘', '2일', '3일'] as const

const summaryCards = [
  {
    label: '금일 예측 발전량',
    value: '482.6',
    unit: 'kWh',
    note: '현재 기준 예측',
    trend: '↓ -10.3%',
    icon: '📅',
    tone: 'blue',
  },
  {
    label: '예측 신뢰도',
    value: '91',
    unit: '%',
    note: 'XGBoost 모델 기준',
    trend: '높음',
    icon: '✓',
    tone: 'green',
  },
  {
    label: '주요 영향 요인',
    value: '일사량',
    unit: '',
    note: 'SHAP 기여도 1위',
    trend: '운량↑ 예상',
    icon: '☀',
    tone: 'amber',
  },
] as const

const shapFactors = [
  { title: '일사량', description: '맑음 예보로 발전에 긍정적', value: '+0.52', size: '52%', tone: 'blue', direction: '↑' },
  { title: '운량', description: '오후 구름 증가로 출력 감소 예상', value: '-0.38', size: '38%', tone: 'red', direction: '↓' },
  { title: '기온', description: '적정 온도 유지로 효율 양호', value: '+0.21', size: '21%', tone: 'green', direction: '↑' },
  { title: '패널 상태', description: '오염 지수 소폭 영향', value: '-0.12', size: '12%', tone: 'amber', direction: '↓' },
  { title: '습도', description: '낮은 습도 유지', value: '+0.08', size: '8%', tone: 'green', direction: '↑' },
] as const

const weatherCards = [
  { label: '일사량', value: '702 W/m²', note: '어제 대비 +8%', icon: '☀', tone: 'amber' },
  { label: '최고 기온', value: '24.5°C', note: '적정 발전 온도', icon: '🌡', tone: 'red' },
  { label: '운량', value: '30%', note: '오후 60%↑', icon: '☁', tone: 'gray' },
  { label: '습도', value: '42%', note: '낮음 (발전 양호)', icon: '💧', tone: 'blue' },
] as const

export function PowerForecastPage() {
  return (
    <div className={styles.page}>
      <DashboardSidebar activeSection="forecast" />

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>발전량 예측</h1>
            <p>XGBoost 기반 AI 모델 · 기상청 API 연동</p>
          </div>

          <div className={styles.periodControls} aria-label="예측 기간">
            <span>예측 기간</span>
            {periodFilters.map((filter) => (
              <button key={filter} className={filter === '오늘' ? styles.periodActive : undefined} type="button">
                {filter}
              </button>
            ))}
          </div>
        </header>

        <section className={styles.summaryGrid} aria-label="발전량 예측 요약">
          {summaryCards.map((card) => (
            <article key={card.label} className={[styles.summaryCard, styles[card.tone]].join(' ')}>
              <div>
                <p>{card.label}</p>
                <strong>
                  {card.value}
                  {card.unit ? <span>{card.unit}</span> : null}
                </strong>
              </div>
              <span className={styles.summaryIcon} aria-hidden="true">{card.icon}</span>
              <footer>
                <span>{card.note}</span>
                <em>{card.trend}</em>
              </footer>
            </article>
          ))}
        </section>

        <section className={styles.chartPanel} aria-labelledby="forecast-chart-title">
          <div className={styles.panelHeader}>
            <div>
              <h2 id="forecast-chart-title">2~3일 발전량 예측</h2>
              <p>XGBoost 기반 · 실측 + 예측 · 신뢰도 구간 포함</p>
            </div>
            <span className={styles.aiBadge}>AI Powered</span>
            <div className={styles.unitControls} aria-label="데이터 단위">
              <span>데이터 단위</span>
              <button type="button">시간별</button>
              <button className={styles.unitActive} type="button">일별</button>
            </div>
          </div>

          <div className={styles.forecastChart} aria-label="발전량 예측 선형 차트">
            <span className={styles.currentMarker}>현재</span>
            <svg viewBox="0 0 1072 232" role="img" aria-hidden="true" preserveAspectRatio="none">
              <defs>
                <linearGradient id="confidenceArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#185fa5" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#185fa5" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path className={styles.confidenceBand} d="M125 74 L190 62 L260 48 L330 38 L400 34 L470 48 L540 66 L610 92 L680 108 L750 88 L820 62 L890 56 L960 70 L1040 88 L1040 124 L960 106 L890 92 L820 98 L750 122 L680 144 L610 132 L540 104 L470 86 L400 72 L330 78 L260 84 L190 96 L125 112 Z" />
              <polyline className={styles.actualLine} points="0,222 12,190 24,144 36,92 48,48 60,20 72,34 84,64" />
              <polyline className={styles.predictedLine} points="84,64 160,58 240,44 320,36 400,40 480,56 560,82 640,108 720,96 800,70 880,58 960,66 1040,86 1072,82" />
              <line className={styles.nowLine} x1="84" x2="84" y1="0" y2="232" />
            </svg>
            <div className={styles.yAxis}>
              <span>100</span>
              <span>80</span>
              <span>60</span>
              <span>40</span>
              <span>20</span>
            </div>
            <div className={styles.xAxis}>
              <span>4/17 오늘</span>
              <span>4/18 내일</span>
              <span>4/19</span>
              <span>4/20</span>
            </div>
            <div className={styles.legend}>
              <span><i className={styles.actualDot} />실측값</span>
              <span><i className={styles.predictedDot} />예측값 (XGBoost)</span>
              <span><i className={styles.bandKey} />신뢰 구간 (±8kW)</span>
            </div>
          </div>
        </section>

        <div className={styles.detailGrid}>
          <section className={styles.panel} aria-labelledby="shap-title">
            <div className={styles.panelHeader}>
              <div>
                <h2 id="shap-title">SHAP 피처 기여도</h2>
                <p>내일 예측에 영향을 미친 요인 분석</p>
              </div>
            </div>

            <div className={styles.shapList}>
              {shapFactors.map((factor) => (
                <article key={factor.title} className={styles.shapItem}>
                  <header>
                    <div>
                      <h3>{factor.title}</h3>
                      <p>{factor.description}</p>
                    </div>
                    <span className={styles[factor.tone]}>{factor.direction}</span>
                  </header>
                  <div className={styles.shapBar}>
                    <span className={styles[factor.tone]} style={{ width: factor.size }} />
                  </div>
                  <strong className={styles[factor.tone]}>{factor.value}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.panel} aria-labelledby="weather-title">
            <div className={styles.panelHeader}>
              <div>
                <h2 id="weather-title">예측 근거 및 기상 정보</h2>
                <p>기상청 API 연동 기준</p>
              </div>
            </div>

            <div className={styles.weatherGrid}>
              {weatherCards.map((card) => (
                <article key={card.label} className={[styles.weatherCard, styles[card.tone]].join(' ')}>
                  <span aria-hidden="true">{card.icon}</span>
                  <p>{card.label}</p>
                  <strong>{card.value}</strong>
                  <small>{card.note}</small>
                </article>
              ))}
            </div>

            <article className={styles.aiSummary}>
              <h3>AI 예측 요약</h3>
              <p>
                운량 증가와 일사량 감소가 내일 예측 발전량 하락에 가장 큰 영향을 주었습니다.
                <br />
                <br />
                오전(09-12시) 최대 85kW 예상,
                <br />
                오후(13-17시) 구름 영향으로 58kW로 하락 예측.
              </p>
            </article>
          </section>
        </div>
      </main>
    </div>
  )
}
