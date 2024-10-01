import { HealthChecks, DiskSpaceCheck, MemoryHeapCheck } from '@adonisjs/core/health'
import db from '@adonisjs/lucid/services/db'
import { DbCheck } from '@adonisjs/lucid/database'

export const healthChecks = new HealthChecks().register([
  new DiskSpaceCheck()
    .warnWhenExceeds(80) // warn when used over 80%
    .failWhenExceeds(90) // fail when used over 90%
    .cacheFor('10 min'),
  new MemoryHeapCheck().cacheFor('10 min'),
  new DbCheck(db.connection()).cacheFor('1 min'),
])
