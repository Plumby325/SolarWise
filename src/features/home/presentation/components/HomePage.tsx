import { useState } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import styles from './HomePage.module.css'

export function HomePage() {
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setNameError('이름을 입력해 주세요.')
      return
    }
    setNameError('')
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>홈</h1>
      <p className={styles.lead}>
        공통 레이아웃과 UI 컴포넌트 예시입니다. 피그마·API 연동 전에 스타일과 동작만 맞춰 두면 됩니다.
      </p>

      <div className={styles.grid}>
        <Card title="버튼">
          <div className={styles.row}>
            <Button type="button">Primary</Button>
            <Button type="button" variant="secondary">
              Secondary
            </Button>
            <Button type="button" variant="ghost">
              Ghost
            </Button>
            <Button type="button" disabled>
              Disabled
            </Button>
          </div>
        </Card>

        <Card title="입력">
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Input
              label="이름"
              placeholder="홍길동"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError('')
              }}
              error={nameError}
            />
            <Button type="submit">제출</Button>
          </form>
        </Card>

        <Card>
          <p className={styles.muted}>
            <code>title</code> 없이 쓴 카드입니다. 헤더 없이 본문만 표시됩니다.
          </p>
        </Card>
      </div>
    </div>
  )
}
