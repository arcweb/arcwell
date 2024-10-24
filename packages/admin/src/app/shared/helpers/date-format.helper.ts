import { DateTime } from 'luxon';
import { FormGroup } from '@angular/forms';

export function prepDateData(dateTime: string) {
  const split = dateTime.split(/([\s/:]+)/);

  const adjusted = [0, 2, 6, 8];
  for (const x of adjusted) {
    if (split[x].length === 1) {
      split[x] = '0' + split[x];
    }
  }
  return split.join('');
}

export function cleanDateData(form: FormGroup, controlName: string) {
  console.log('IN FUNC', form);
  if (form.get(controlName)?.value) {
    const retObj = { ...form.value };
    retObj[controlName] = DateTime.fromFormat(
      form.get(controlName)?.value,
      'EEE MMM dd yyyy TTTZZZ (z)',
    );
    return retObj;
  } else {
    return { ...form.value };
  }
}

export function convertDateTimeToLocal(dateTime: DateTime | undefined): string {
  return dateTime?.toLocaleString(DateTime.DATETIME_SHORT) ?? '';
}
