import { AUTO_SLUG_TYPE_KEY_PATTERN } from '#constants/validation_constants'

// if the key is not defined on the type, create one based on the name before save
export const generateTypeKey = (name: string) =>
  name.toLowerCase().replace(/ /g, '_').replace(AUTO_SLUG_TYPE_KEY_PATTERN, '')
