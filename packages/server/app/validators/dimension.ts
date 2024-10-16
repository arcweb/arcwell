import Dimension from '#models/dimension'
import DimensionSchema from '#models/dimension_schema'
import vine from '@vinejs/vine'

enum DimensionDataTypeEnum {
  boolean = 'boolean',
  number = 'number',
  date = 'date',

  string = 'string',
}

export const dimensionSchemas = vine.array(
  vine.object({
    key: vine.string().trim(),
    name: vine.string(),
    dataType: vine.string(),
    dataUnit: vine.string().optional(),
    isRequired: vine.boolean(),
  })
)

export const dimensionSchema = vine.object({
  key: vine.string(),
  value: vine.any(),
})

export const dimensions = vine.array(dimensionSchema.optional())

// Validations
const vineDateUtcSchema = vine.compile(vine.date({ formats: { utc: true } }))
// const vineDateSchema = vine.compile(vine.date())
const vineNumberStringSchema = vine.compile(vine.number({ strict: true }))
const vineBooleanSchema = vine.compile(vine.boolean())

/**
 * Validates a dimension value against its expected data type.
 *
 * @async
 * @param {string} value - The dimension value to validate.
 * @param {string} dataType - The expected data type of the dimension (e.g., 'string', 'boolean', 'number', 'date'). See {DimensionDataTypeEnum}
 * @returns {Promise<string[]>} - Returns an array of error messages if validation fails, or an empty array if the value is valid.
 * @throws {Error} - Throws an error if the data type is unrecognized.
 */
async function validateDimensionSchema(value: string, dataType: string): Promise<string[]> {
  const errors: string[] = []

  switch (dataType.toLowerCase()) {
    case DimensionDataTypeEnum.string:
      if (!vine.helpers.isString(value)) {
        errors.push(`Expected string but got '${value}'`)
      }
      break
    case DimensionDataTypeEnum.boolean:
      try {
        await vineBooleanSchema.validate(value)
      } catch {
        errors.push(`Expected boolean but got '${value}'`)
      }
      break
    case DimensionDataTypeEnum.number:
      try {
        await vineNumberStringSchema.validate(value)
      } catch {
        errors.push(`Expected number but got '${value}'`)
      }
      break
    case DimensionDataTypeEnum.date:
      try {
        await vineDateUtcSchema.validate(value)
      } catch {
        errors.push(`Expected date but got '${value}'`)
      }
      break
    default:
      errors.push(`Unknown data type: '${dataType}'`)
  }

  return errors
}

/**
 * Validates the schema of each dimension against the provided dimension schemas.
 * Ensures required keys are present and values match their expected data types.
 *
 * @private
 * @async
 * @param {Dimension[]} dimensionsToValidate - Array of dimension objects to validate.
 * @param {DimensionSchema[]} dimensionSchemasToValidate - Array of schema objects describing valid dimensions.
 * @returns {Promise<string | null>} - Returns an error message string if validation fails, otherwise null.
 */
export async function validateDimensions(
  dimensionsToValidate: Dimension[],
  dimensionSchemasToValidate: DimensionSchema[]
): Promise<string | null> {
  const errors: string[] = []

  // Get all the valid keys from the dimensionSchemas
  const validKeys = dimensionSchemasToValidate.map((item) => item.key)

  // Check for missing required keys
  const requiredKeys = dimensionSchemasToValidate
    .filter((item) => item.isRequired)
    .map((item) => item.key)
  const missingKeys = requiredKeys.filter(
    (key) => !dimensionsToValidate.some((data) => data.key === key)
  )

  if (missingKeys.length > 0) {
    errors.push(`Missing required fields: ${missingKeys.join(', ')}`)
  }

  // Validate each dimension
  for (const dimension of dimensionsToValidate) {
    // Check if the dimension key exists in the validKeys
    if (!validKeys.includes(dimension.key)) {
      errors.push(`Unexpected dimension key: '${dimension.key}'`)
    } else {
      // If the key is valid, validate its value against the schema
      const dimensionSchemaToValidate = dimensionSchemasToValidate.find(
        (item) => item.key === dimension.key
      )
      if (dimensionSchemaToValidate) {
        const validationErrors = await validateDimensionSchema(
          dimension.value,
          dimensionSchemaToValidate.dataType
        )
        if (validationErrors && validationErrors.length > 0) {
          errors.push(
            `Validation failed for key '${dimension.key}': ${validationErrors.join(', ')}`
          )
        }
      }
    }
  }

  // Return the collected errors, or null if no errors were found
  return errors.length > 0 ? errors.join('; ') : null
}
