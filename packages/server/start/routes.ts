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
const RolesController = () => import('#controllers/roles_controller')
const UsersController = () => import('#controllers/users_controller')
const GetAllFullUsersController = () => import('#controllers/full_user_controller')
const PeopleController = () => import('#controllers/people_controller')
const PersonTypesController = () => import('#controllers/person_types_controller')

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

router
  .group(() => {
    router.post('/register', [AuthController, 'register']).as('register')
    router.post('/login', [AuthController, 'login']).as('login')
    router.delete('/logout', [AuthController, 'logout']).as('logout').use(middleware.auth())
    router.get('/me', [AuthController, 'me']).as('me')
  })
  .as('auth')
  .prefix('auth')

router.resource('roles', RolesController).apiOnly()
router.get('users/full', [GetAllFullUsersController]).as('users.full')
router.resource('users', UsersController).apiOnly()
router.resource('people', PeopleController).apiOnly()
router.resource('person_types', PersonTypesController).apiOnly()
