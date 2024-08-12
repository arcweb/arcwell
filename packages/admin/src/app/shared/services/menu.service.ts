import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  constructor() {}

  getFeatureItems() {
    return {
      data: [
        { key: 'people', value: 'People', icon: 'people-icon' },
        { key: 'resources', value: 'Resources', icon: 'resources-icon' },
        { key: 'events', value: 'Events', icon: 'events-icon' },
        { key: 'facts', value: 'Facts', icon: 'facts-icon' },
        { key: 'tags', value: 'Tags', icon: 'tags-icon' },
      ],
    };
  }
}
