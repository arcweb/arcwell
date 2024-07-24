import { DateTime } from 'luxon';
import { z } from 'zod';

export const ZodDateTime = z.custom<DateTime>((val) =>
  DateTime.isDateTime(val),
);
