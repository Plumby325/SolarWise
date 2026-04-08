import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { HomeFormState } from '../types/home'

export function useHomeForm() {
  const [address, setAddress] = useState<HomeFormState['address']>('')
  const [addressError, setAddressError] = useState<HomeFormState['addressError']>('')
  const [submittedAddress, setSubmittedAddress] = useState<HomeFormState['submittedAddress']>('')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const trimmedAddress = address.trim()

    if (!trimmedAddress) {
      setAddressError('발전소 주소 또는 지역명을 입력해 주세요.')
      return
    }

    setAddressError('')
    setSubmittedAddress(trimmedAddress)
  }

  function handleAddressChange(e: ChangeEvent<HTMLInputElement>) {
    setAddress(e.target.value)

    if (addressError) {
      setAddressError('')
    }
  }

  return {
    address,
    addressError,
    submittedAddress,
    handleSubmit,
    handleAddressChange,
  }
}
