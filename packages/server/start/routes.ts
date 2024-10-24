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
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'

router
  // API Outer Wrapper
  .group(() => {
    router
      // V1 Mid Wrapper
      .group(() => {
        // Authentication
        router
          .group(() => {
            // router.post('/register', [AuthController, 'register']).as('register')
            router.post('/login', [AuthController, 'login']).as('login')
            router.delete('/logout', [AuthController, 'logout']).as('logout').use(middleware.auth())
            router.get('/me', [AuthController, 'me']).as('me').use(middleware.auth())
            router.post('/forgot', [AuthController, 'sendForgotPasswordMessage']).as('forgot')
            router.post('/reset', [AuthController, 'resetPassword']).as('reset')
            router
              .post('/change', [AuthController, 'changePassword'])
              .as('change')
              .use(middleware.auth())
            router.post('/set', [AuthController, 'setPassword']).as('set')
          })
          .as('auth')
          .prefix('auth')

        // People Management
        router
          .group(() => {
            router
              .get('people/:id/cohorts', [PeopleController, 'showWithCohorts'])
              .as('people.showWithCohorts')
            router
              .post('people/:id/attach', [PeopleController, 'attachCohort'])
              .as('people.attachCohort')
            router
              .delete('people/:id/detach', [PeopleController, 'detachCohort'])
              .as('people.detachCohort')
            router.resource('people/types', PersonTypesController).apiOnly()
            router
              .get('people/types/:id/people', [PersonTypesController, 'showWithPeople'])
              .as('people/types.showWithPeople')
            router.get('people/count', [PeopleController, 'count']).as('people.count')
            router.resource('people', PeopleController).apiOnly()
          })
          .use(middleware.auth())

        // Cohort Management
        router
          .group(() => {
            router
              .get('cohorts/:id/people', [CohortsController, 'showWithPeople'])
              .as('cohorts.showWithPeople')
            router
              .post('cohorts/:id/attach', [CohortsController, 'attachPeople'])
              .as('cohorts.attachPeople')
            router
              .delete('cohorts/:id/detach', [CohortsController, 'detachPeople'])
              .as('cohorts.detachPeople')
            router.post('cohorts/:id/set', [CohortsController, 'setPeople']).as('cohorts.setPeople')
            router.resource('cohorts', CohortsController).apiOnly()
          })
          .use(middleware.auth())

        // Resource Management
        router
          .group(() => {
            router.resource('resources/types', ResourceTypesController).apiOnly()
            router
              .get('resources/types/:id/resources', [ResourceTypesController, 'showWithResources'])
              .as('resources/types.showWithResources')
            router.get('resources/count', [ResourcesController, 'count']).as('resources.count')
            router.resource('resources', ResourcesController).apiOnly()
          })
          .use(middleware.auth())

        // Event Management
        router
          .group(() => {
            router.resource('events/types', EventTypeController).apiOnly()
            router
              .get('events/types/:id/events', [EventTypeController, 'showWithEvents'])
              .as('events/types.showWithEvents')
            router.get('events/count', [EventController, 'count']).as('events.count')
            router.resource('events', EventController).apiOnly()
          })
          .use(middleware.auth())

        // Fact Management
        router
          .group(() => {
            router.resource('facts/types', FactTypesController).apiOnly()
            router
              .get('facts/types/:id/facts', [FactTypesController, 'showWithFacts'])
              .as('facts/types.showWithFacts')
            router.get('facts/count', [FactsController, 'count']).as('facts.count')
            router.resource('facts', FactsController).apiOnly()
          })
          .use(middleware.auth())

        // Tags Management
        router
          .group(() => {
            router.get('tags/simple', [TagsController, 'getStrings']).as('tags.simple')
            router
              .get('tags/:id/:object_name', [TagsController, 'showRelated'])
              .as('tags.showRelated')
            router.post('tags/:id/set', [TagsController, 'setTags']).as('tags.set')
            router.get('tags/count', [TagsController, 'count']).as('tags.count')
            router.resource('tags', TagsController).apiOnly()
          })
          .use(middleware.auth())

        // Data API
        router
          .group(() => {
            router.post('/insert', [DataFactsController, 'insert']).as('data.insert')
            router.patch('/update/:id', [DataFactsController, 'update']).as('data.update')
            router.get('/query', [DataFactsController, 'query']).as('facts.query')
          })
          .as('data')
          .prefix('data')
          .use(middleware.auth())

        // User Management
        // router.get('users/full', [GetAllFullUsersController]).as('users.full')
        router
          .group(() => {
            router.post('users/invite', [UsersController, 'invite']).as('invite')
            router.resource('users', UsersController).apiOnly()
          })
          .use(middleware.auth())

        // Role Management
        router.resource('roles', RolesController).apiOnly().use('*', middleware.auth())

        // Server Configuration
        router
          .group(() => {
            router.get('', [ConfigController, 'index']).as('index')
            router
              .get('features-menu', [ConfigController, 'featuresMenu'])
              .as('featuresMenu')
              .use(middleware.auth())
            router
              .post('install', [ConfigController, 'install'])
              .as('install')
              .use(middleware.auth())
          })
          .as('config')
          .prefix('config')
      })
      .prefix('v1')
      .as('v1')
  })
  .prefix('api')
  .as('api')

// Healthcheck and non-API paths:
router.get('/health', [HealthChecksController])
router.get('/docs/swagger.yaml', async () => {
  // @ts-ignore - AutoSwagger isn't exporting default correctly for ESM
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})
