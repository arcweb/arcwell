/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
<<<<<<< Updated upstream
import SessionController from '#controllers/session_controller'
import RolesController from '#controllers/roles_controller'
import UsersController from '#controllers/users_controller'
=======
const AuthController = () => import('#controllers/auth_controller')
import { middleware } from '#start/kernel'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'
const RolesController = () => import('#controllers/roles_controller')
const UsersController = () => import('#controllers/users_controller')
const GetAllFullUsersController = () => import('#controllers/full_user_controller')
>>>>>>> Stashed changes

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.resource('auth', SessionController)
router.resource('roles', RolesController)
router.resource('users', UsersController)

// returns swagger in YAML
router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

// Renders Swagger-UI and passes YAML-output of /swagger
router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
  // return AutoSwagger.default.scalar("/swagger"); to use Scalar instead
  // return AutoSwagger.default.rapidoc("/swagger", "view"); to use RapiDoc instead (pass "view" default, or "read" to change the render-style)
})
