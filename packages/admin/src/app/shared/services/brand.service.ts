import { Injectable } from '@angular/core';

import { ErrorResponseType } from '../schemas/error.schema';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  /**
   * This is a place holder service that will eventually be used to organize custom branding in the admin app
   */

  constructor() {}

  // Get instance name
  getInstanceName(brandId: number) {
    if (brandId) {
      return 'Arcwell R&D';
    }

    return 'Not Arcwell';
  }
}
