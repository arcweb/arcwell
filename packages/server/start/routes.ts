/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import SessionController from '#controllers/session_controller'
import RolesController from '#controllers/roles_controller'
import UsersController from '#controllers/users_controller'
import GetAllFullUsersController from '#controllers/full_user_controller'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.resource('auth', SessionController)
router.resource('roles', RolesController)
router.get('users/full', [GetAllFullUsersController])
router.resource('users', UsersController)
