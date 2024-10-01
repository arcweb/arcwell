/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')
import { middleware } from '#start/kernel'
const DataFactsController = () => import('#controllers/data/data_facts_controller')
const EmailsController = () => import('#controllers/emails_controller')
const CohortsController = () => import('#controllers/cohorts_controller')
const ConfigController = () => import('#controllers/config_controller')
const FactTypesController = () => import('#controllers/fact_types_controller')
const FactsController = () => import('#controllers/facts_controller')
const RolesController = () => import('#controllers/roles_controller')
const UsersController = () => import('#controllers/users_controller')
const PeopleController = () => import('#controllers/people_controller')
const PersonTypesController = () => import('#controllers/person_types_controller')
const ResourcesController = () => import('#controllers/resources_controller')
const ResourceTypesController = () => import('#controllers/resource_types_controller')
const EventController = () => import('#controllers/events_controller')
const EventTypeController = () => import('#controllers/event_types_controller')
const TagsController = () => import('#controllers/tags_controller')

const HealthChecksController = () => import('#controllers/health_checks_controller')
router.get('/health', [HealthChecksController])

import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'

router.get('/docs/swagger.yaml', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

// auth routes
router
  .group(() => {
    // router.post('/register', [AuthController, 'register']).as('register')
    router.post('/login', [AuthController, 'login']).as('login')
    router.delete('/logout', [AuthController, 'logout']).as('logout').use(middleware.auth())
    router.get('/me', [AuthController, 'me']).as('me')
    router.post('/forgot', [AuthController, 'sendForgotPasswordMessage']).as('forgot')
    router.post('/reset', [AuthController, 'resetPassword']).as('reset')
    router.post('/change', [AuthController, 'changePassword']).as('change')
  })
  .as('auth')
  .prefix('auth')

// cohort routes
router.group(() => {
  router
    .get('cohorts/:id/people', [CohortsController, 'showWithPeople'])
    .as('cohorts.showWithPeople')
  router.post('cohorts/:id/attach', [CohortsController, 'attachPeople']).as('cohorts.attachPeople')
  router
    .delete('cohorts/:id/detach', [CohortsController, 'detachPeople'])
    .as('cohorts.detachPeople')
  router.post('cohorts/:id/set', [CohortsController, 'setPeople']).as('cohorts.setPeople')
  router.resource('cohorts', CohortsController).apiOnly()
})

// config routes
router
  .group(() => {
    router.get('', [ConfigController, 'index']).as('index')
    router.get('features-menu', [ConfigController, 'featuresMenu']).as('featuresMenu')
  })
  .as('config')
  .prefix('config')

// fact routes
router.group(() => {
  router.resource('facts/types', FactTypesController).apiOnly()
  router
    .get('facts/types/:id/facts', [FactTypesController, 'showWithFacts'])
    .as('facts/types.showWithFacts')
  router.resource('facts', FactsController).apiOnly()
})

// event routes
router.group(() => {
  router.resource('events/types', EventTypeController).apiOnly()
  router
    .get('events/types/:id/events', [EventTypeController, 'showWithEvents'])
    .as('events/types.showWithEvents')
  router.resource('events', EventController).apiOnly()
})

// people routes
router.group(() => {
  router
    .get('people/:id/cohorts', [PeopleController, 'showWithCohorts'])
    .as('people.showWithCohorts')
  router.post('people/:id/attach', [PeopleController, 'attachCohort']).as('people.attachCohort')
  router.delete('people/:id/detach', [PeopleController, 'detachCohort']).as('people.detachCohort')
  router.resource('people/types', PersonTypesController).apiOnly()
  router
    .get('people/types/:id/people', [PersonTypesController, 'showWithPeople'])
    .as('people/types.showWithPeople')
  router.resource('people', PeopleController).apiOnly()
})

// resource routes
router.group(() => {
  router.resource('resources/types', ResourceTypesController).apiOnly()
  router
    .get('resources/types/:id/resources', [ResourceTypesController, 'showWithResources'])
    .as('resources/types.showWithResources')
  router.resource('resources', ResourcesController).apiOnly()
})

// role routes
router.resource('roles', RolesController).apiOnly()

// user routes
// router.get('users/full', [GetAllFullUsersController]).as('users.full')
router.resource('users', UsersController).apiOnly()

// tag routes
router.group(() => {
  router.get('tags/simple', [TagsController, 'getStrings']).as('tags.simple')
  router.post('tags/:id/set', [TagsController, 'setTags']).as('tags.set')
  router.resource('tags', TagsController).apiOnly()
})

// email routes
router.group(() => {
  router.post('email', [EmailsController, 'send']).as('email.send')
})

router
  .group(() => {
    router.post('/insert', [DataFactsController, 'insert']).as('data.insert')
    router.patch('/update/:id', [DataFactsController, 'update']).as('data.update')
    router.get('/query', [DataFactsController, 'query']).as('facts.query')
  })
  .as('data')
  .prefix('data')
