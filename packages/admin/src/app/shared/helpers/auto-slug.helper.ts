import { AUTO_SLUG_TYPE_KEY_PATTERN } from '../constants/admin.constants';

export const autoSlugify = (value: string) => {
  return value
    .toLowerCase()
    .replace(/ /g, '_')
    .replace(AUTO_SLUG_TYPE_KEY_PATTERN, '');
};
