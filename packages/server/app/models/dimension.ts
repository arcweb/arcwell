export default class Dimension {
  key: string
  value: string | number

  constructor(key: string, value: string) {
    this.key = key
    this.value = value
  }
}
