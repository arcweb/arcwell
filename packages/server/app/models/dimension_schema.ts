export default class DimensionSchema {
  key: string
  name: string
  dataType: string
  dataUnit: string | null
  isRequired: boolean

  constructor(
    key: string,
    name: string,
    dataType: string,
    dataUnit: string,
    isRequired: boolean = true
  ) {
    this.key = key
    this.name = name
    this.dataType = dataType
    this.dataUnit = dataUnit
    this.isRequired = isRequired
  }
}
