/** 발전소 등록 모달 → API 저장 시 전달하는 폼 값 */
export type NewPlantPayload = {
  name: string
  sido: string
  sigungu: string
  capacityKw: number
  installYear: number
  inverterModel: string
  sensorSerial: string
}
