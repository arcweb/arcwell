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
const RolesController = () => import('#controllers/roles_controller')
const UsersController = () => import('#controllers/users_controller')
const GetAllFullUsersController = () => import('#controllers/full_user_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.post('/register', [AuthController, 'register']).as('auth.register')
router.post('/login', [AuthController, 'login']).as('auth.login')
router.delete('/logout', [AuthController, 'logout']).as('auth.logout').use(middleware.auth())
router.get('/me', [AuthController, 'me']).as('auth.me')

router.resource('roles', RolesController)
router.get('users/full', [GetAllFullUsersController])
router.resource('users', UsersController)
