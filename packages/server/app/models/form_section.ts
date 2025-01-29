export default class FormSection {
  type: string
  value: string
  order: number

  constructor(type: string, value: string, order: number) {
    this.type = type
    this.value = value
    this.order = order
  }
}
