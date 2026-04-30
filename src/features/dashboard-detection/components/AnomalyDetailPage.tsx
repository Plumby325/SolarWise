import { Link } from 'react-router-dom'
import { DashboardSidebar } from '@/shared/layout/DashboardSidebar'
import styles from './AnomalyDetailPage.module.css'

const evidenceMetrics = [
  { label: '출력 저하율', value: '70%', size: '70%', tone: 'red' },
  { label: '일사량 편차', value: '45%', size: '45%', tone: 'amber' },
  { label: '패널 표면 상태', value: '28%', size: '28%', tone: 'blue' },
] as const

const historyItems = [
  { time: '13:40', title: '이상 감지', detail: '발전량 이상 자동 감지', tone: 'red' },
  { time: '13:41', title: '알림 발송', detail: 'alert@solarwise.com 발송 완료', tone: 'green' },
  { time: '13:45', title: '확인 중', detail: '담당자 확인 중', tone: 'muted' },
] as const

const messages = [
  {
    type: 'ai',
    lines: ['안녕하세요! 이번 이상 이벤트의 원인을 설명드릴게요.', '출력 저하율(70%)이 주요 원인으로 패널 오염 가능성이 높습니다.'],
  },
  { type: 'user', lines: ['왜 발전량이 갑자기 떨어졌나요?'] },
  {
    type: 'ai',
    lines: ['일사량(710W/m²)은 정상이지만 출력이 -28% 감소했습니다.', '• 출력 저하율 70% · 일사량 편차 45% 기여', '즉각적인 패널 점검을 권장합니다.'],
  },
  { type: 'reference', lines: ['🔗 참조: 예측 설명 · 최근 계측 · 비전 분석'] },
  { type: 'user', lines: ['패널 청소가 효과가 있을까요?'] },
  {
    type: 'ai',
    lines: ['비전 분석 결과 패널 표면 오염이 감지되었습니다.', '청소 후 약 8~12% 출력 회복이 예상됩니다.'],
  },
] as const

const quickQuestions = [
  '패널 청소 주기는 언제인가요?',
  '비슷한 이상이 이전에도 있었나요?',
  '언제 해결될까요?',
] as const

export function AnomalyDetailPage() {
  return (
    <div className={styles.page}>
      <DashboardSidebar activeSection="anomaly" />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <Link className={styles.backButton} to="/anomaly-detection">← 목록</Link>
            <h1>이상 이벤트 상세</h1>
            <span className={styles.highBadge}><i />HIGH</span>
            <span className={styles.openBadge}>OPEN</span>
          </div>

          <div className={styles.headerActions}>
            <button type="button">✓ 확인 완료</button>
            <button type="button">✓ 해결 완료</button>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.detailCard} aria-labelledby="event-info-title">
            <div className={styles.panelHeader}>
              <div>
                <h2 id="event-info-title">이벤트 정보</h2>
                <p>오늘 13:40 · POWER 유형</p>
              </div>
            </div>

            <article className={styles.eventSummary}>
              <h3>예상 대비 발전량 28% 감소</h3>
              <p>일사량 정상 범위 · 인버터 연결 확인 필요</p>
            </article>

            <section className={styles.sectionBlock} aria-labelledby="measurement-title">
              <h3 id="measurement-title">측정값 비교</h3>
              <div className={styles.measurementBox}>
                <div>
                  <span>예측 발전량</span>
                  <strong className={styles.blue}>76.5 kW</strong>
                </div>
                <div>
                  <span>실제 발전량</span>
                  <strong className={styles.red}>55.1 kW</strong>
                </div>
                <b>▼ 28%</b>
              </div>
            </section>

            <section className={styles.sectionBlock} aria-labelledby="cause-title">
              <h3 id="cause-title">원인 분석</h3>
              <div className={[styles.insightBox, styles.causeBox].join(' ')}>
                일사량 대비 실제 출력이 낮아 패널 오염 또는 음영 가능성이 높습니다. 인버터 연결 상태도 함께 점검하세요.
              </div>
            </section>

            <section className={styles.sectionBlock} aria-labelledby="xai-title">
              <h3 id="xai-title">XAI 판단 근거</h3>
              <div className={[styles.insightBox, styles.xaiBox].join(' ')}>
                <p>일사량은 정상 범위였지만 출력만 급감해 설비 이상 가능성이 높습니다.</p>
                <div className={styles.metricList}>
                  {evidenceMetrics.map((metric) => (
                    <div key={metric.label} className={styles.metricRow}>
                      <span>{metric.label}</span>
                      <div>
                        <i className={styles[metric.tone]} style={{ width: metric.size }} />
                      </div>
                      <b className={styles[metric.tone]}>{metric.value}</b>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className={styles.sectionBlock} aria-labelledby="action-title">
              <h3 id="action-title">권장 조치</h3>
              <div className={[styles.insightBox, styles.actionBox].join(' ')}>
                <ol>
                  <li>패널 표면 오염 여부 육안 점검</li>
                  <li>인버터 연결 및 출력 로그 확인</li>
                  <li>주변 음영 발생 요소 점검</li>
                </ol>
              </div>
            </section>

            <section className={styles.sectionBlock} aria-labelledby="history-title">
              <h3 id="history-title">처리 이력</h3>
              <div className={styles.historyList}>
                {historyItems.map((item) => (
                  <article key={`${item.time}-${item.title}`} className={[styles.historyItem, styles[item.tone]].join(' ')}>
                    <span aria-hidden="true" />
                    <time>{item.time}</time>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <section className={styles.chatPanel} aria-labelledby="ai-chat-title">
            <header className={styles.chatHeader}>
              <span className={styles.aiAvatar}>AI</span>
              <div>
                <h2 id="ai-chat-title">AI 원인 설명 챗</h2>
                <p>이상 이벤트 #9001 · XAI 기반 분석</p>
              </div>
              <span className={styles.chatSeverity}><i />HIGH</span>
            </header>

            <div className={styles.chatBody}>
              {messages.map((message, index) => (
                <article key={`${message.type}-${index}`} className={styles[`${message.type}Message`]}>
                  {message.type === 'ai' ? <span className={styles.messageAvatar}>AI</span> : null}
                  <div>
                    {message.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </article>
              ))}

              <div className={styles.quickArea}>
                <h3>💬 빠른 질문</h3>
                {quickQuestions.map((question) => (
                  <button key={question} type="button">→ {question}</button>
                ))}
              </div>

              <div className={styles.relatedArea}>
                <h3>📊 관련 데이터</h3>
                <div className={styles.relatedGrid}>
                  <article className={styles.powerCard}>
                    <span>⚡ 현재 발전량</span>
                    <strong>55.1 kW</strong>
                    <small>-28%</small>
                  </article>
                  <article className={styles.solarCard}>
                    <span>☀ 일사량</span>
                    <strong>710 W/m²</strong>
                    <small>정상</small>
                  </article>
                </div>
              </div>
            </div>

            <form className={styles.chatInput}>
              <label htmlFor="anomaly-question">이상 원인 질문</label>
              <input id="anomaly-question" placeholder="이상 원인에 대해 질문하세요..." />
              <button type="submit" aria-label="질문 전송">↑</button>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
