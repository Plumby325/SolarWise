import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { HomeFormState } from '../types/home'

export function useHomeForm() {
  const [name, setName] = useState<HomeFormState['name']>('')
  const [nameError, setNameError] = useState<HomeFormState['nameError']>('')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!name.trim()) {
      setNameError('이름을 입력해 주세요.')
      return
    }

    setNameError('')
  }

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    setName(e.target.value)

    if (nameError) {
      setNameError('')
    }
  }

  return {
    name,
    nameError,
    handleSubmit,
    handleNameChange,
  }
}
