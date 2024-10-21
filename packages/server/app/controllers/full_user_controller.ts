// import type { HttpContext } from '@adonisjs/core/http'
// import User from '#models/user'
//
// export default class GetAllFullUsersController {
//   async handle({}: HttpContext) {
//     const users = await User.query()
//       .orderBy('email', 'asc')
//       .preload('tags')
//       .preload('role', (rolesQuery) => {
//         rolesQuery.preload('policies')
//       })
//     return {
//       status: 'success',
//       data: {
//         users: users,
//       },
//     }
//   }
// }
