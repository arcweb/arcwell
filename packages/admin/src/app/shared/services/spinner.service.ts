import { Injectable, effect, inject } from '@angular/core';
import { AuthStore } from '../store/auth.store';
import { BulkStore } from '../store/bulk.store';
import { ConfigStore } from '../store/config.store';
import { FeatureStore } from '../store/feature.store';

@Injectable({
    providedIn: 'root',
})
export class SpinnerService {
    readonly authStore = inject(AuthStore);
    readonly bulkStore = inject(BulkStore);
    readonly configStore = inject(ConfigStore);
    readonly featureStore = inject(FeatureStore);

    showSpinner = false;

    constructor() {
        effect(() => {
            const anythingLoading = (
                this.authStore.isLoading() ||
                this.bulkStore.isLoading() ||
                this.configStore.isLoading() ||
                this.featureStore.isLoading()
            );

            if (!anythingLoading) {
                setTimeout(() => {
                    this.showSpinner = false;
                }, 1000);
            } else {
                this.showSpinner = true;
            }
        });
    }
}
