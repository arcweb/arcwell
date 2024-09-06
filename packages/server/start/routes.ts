/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import env from '#start/env'
import router from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')
import { middleware } from '#start/kernel'
const CohortsController = () => import('#controllers/cohorts_controller')
const FactTypesController = () => import('#controllers/fact_types_controller')
const FactsController = () => import('#controllers/facts_controller')
const RolesController = () => import('#controllers/roles_controller')
const UsersController = () => import('#controllers/users_controller')
const GetAllFullUsersController = () => import('#controllers/full_user_controller')
const PeopleController = () => import('#controllers/people_controller')
const PersonTypesController = () => import('#controllers/person_types_controller')
const ResourcesController = () => import('#controllers/resources_controller')
const ResourceTypesController = () => import('#controllers/resource_types_controller')
const EventController = () => import('#controllers/events_controller')
const EventTypeController = () => import('#controllers/event_types_controller')
const TagsController = () => import('#controllers/tags_controller')

const HealthChecksController = () => import('#controllers/health_checks_controller')
router.get('/health', [HealthChecksController])

router.get('/', async () => {
  return {
    arcwell: {
      node: env.get('ARCWELL_NODE'),
      key: env.get('ARCWELL_KEY'),
      server: true,
    },
    hello: 'world',
  }
})

// auth routes
router
  .group(() => {
    router.post('/register', [AuthController, 'register']).as('register')
    router.post('/login', [AuthController, 'login']).as('login')
    router.delete('/logout', [AuthController, 'logout']).as('logout').use(middleware.auth())
    router.get('/me', [AuthController, 'me']).as('me')
  })
  .as('auth')
  .prefix('auth')

// cohort routes
router.group(() => {
  router.resource('cohorts', CohortsController).apiOnly()
  router
    .get('cohorts/:id/people', [CohortsController, 'showWithPeople'])
    .as('cohorts.showWithPeople')
  router.post('cohorts/:id/attach', [CohortsController, 'attachPeople']).as('cohorts.attachPeople')
  router
    .delete('cohorts/:id/detach', [CohortsController, 'detachPeople'])
    .as('cohorts.detachPeople')
  router.post('cohorts/:id/set', [CohortsController, 'setPeople']).as('cohorts.setPeople')
})

// fact routes
router.resource('facts', FactsController).apiOnly()
router.group(() => {
  router.resource('fact_types', FactTypesController).apiOnly()
  router
    .get('fact_types/:id/facts', [FactTypesController, 'showWithFacts'])
    .as('fact_types.showWithFacts')
})

// event routes
router.resource('events', EventController).apiOnly()
router.group(() => {
  router.resource('event_types', EventTypeController).apiOnly()
  router
    .get('event_types/:id/events', [EventTypeController, 'showWithEvents'])
    .as('event_types.showWithEvents')
})

// people routes
router.resource('people', PeopleController).apiOnly()
router.group(() => {
  router.resource('person_types', PersonTypesController).apiOnly()
  router
    .get('/person_types/:id/people', [PersonTypesController, 'showWithPeople'])
    .as('person_types.showWithPeople')
})

// resource routes
router.resource('resources', ResourcesController).apiOnly()
router.group(() => {
  router.resource('resource_types', ResourceTypesController).apiOnly()
  router
    .get('resource_types/:id/resources', [ResourceTypesController, 'showWithResources'])
    .as('resource_types.showWithResources')
})

// role routes
router.resource('roles', RolesController).apiOnly()

// user routes
router.get('users/full', [GetAllFullUsersController]).as('users.full')
router.resource('users', UsersController).apiOnly()

// tag routes
router.group(() => {
  router.get('tags/simple', [TagsController, 'getStrings']).as('tags.simple')
  router.post('tags/:id/set', [TagsController, 'setTags']).as('tags.set')
  router.resource('tags', TagsController).apiOnly()
})
