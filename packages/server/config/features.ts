export interface SubfeatureMenuItem {
  name: string
  path: string
  icon?: string
}

export interface FeatureMenuItem {
  name: string
  path: string
  icon: string
  subfeatures: SubfeatureMenuItem[]
}

export enum FeatureMenuItemNames {
  People = 'People',
  Resources = 'Resources',
  Events = 'Events',
  Facts = 'Facts',
  Tags = 'Tags',
}

export const featureMenuConfig: FeatureMenuItem[] = [
  {
    name: 'Dashboard',
    path: 'dashboard',
    icon: 'home',
    subfeatures: [],
  },
  {
    name: 'People',
    path: 'people',
    icon: 'people',
    subfeatures: [
      {
        name: 'Person Types',
        path: 'types',
      },
      {
        name: 'All People',
        path: 'list',
      },
    ],
  },
  {
    name: 'Cohorts',
    path: 'cohorts',
    icon: 'groups',
    subfeatures: [],
  },
  {
    name: 'Resources',
    path: 'resources',
    icon: 'collections_bookmark',
    subfeatures: [
      {
        name: 'Resource Types',
        path: 'types',
      },
      {
        name: 'All Resources',
        path: 'list',
      },
    ],
  },
  {
    name: 'Events',
    path: 'events',
    icon: 'event',
    subfeatures: [
      {
        name: 'Event Types',
        path: 'types',
      },
      {
        name: 'All Events',
        path: 'list',
      },
    ],
  },
  {
    name: 'Facts',
    path: 'facts',
    icon: 'fact_check',
    subfeatures: [
      {
        name: 'Fact Types',
        path: 'types',
      },
      {
        name: 'All Facts',
        path: 'list',
      },
    ],
  },
  {
    name: 'Tags',
    path: 'tags',
    icon: 'sell',
    subfeatures: [],
  },
  // TODO: do we want settings to be absolute paths?
  {
    name: 'Settings',
    path: 'settings',
    icon: 'settings',
    subfeatures: [
      {
        name: 'Settings',
        path: '',
      },
      {
        name: 'Users',
        path: 'user-management/all-users',
      },
      // TODO: fix path/active styling on this link on next pass
      {
        name: 'Profile',
        path: 'user-management/all-users/:userId',
      },
      {
        name: 'Log Out',
        path: 'logout',
      },
    ],
  },
]
