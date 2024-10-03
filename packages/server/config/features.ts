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
    icon: 'faHouse',
    subfeatures: [],
  },
  {
    name: 'People',
    path: 'people',
    icon: 'faUserGroup',
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
    icon: 'faUsersBetweenLines',
    subfeatures: [],
  },
  {
    name: 'Events',
    path: 'events',
    icon: 'faCalendarDay',
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
    name: 'Resources',
    path: 'resources',
    icon: 'faCubes',
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
    name: 'Facts',
    path: 'facts',
    icon: 'faRectangleList',
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
    icon: 'faTags',
    subfeatures: [],
  },
  // TODO: do we want settings to be absolute paths?
  {
    name: 'Settings',
    path: 'settings',
    icon: 'faGear',
    subfeatures: [
      {
        name: 'Settings',
        path: '',
      },
      {
        name: 'Users',
        path: 'user-management/list',
      },
      // TODO: fix path/active styling on this link on next pass
      {
        name: 'Profile',
        path: 'profile',
      },
      {
        name: 'Log Out',
        path: 'logout',
      },
    ],
  },
]
