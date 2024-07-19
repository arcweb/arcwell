// import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
// import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class RollPolicy extends BasePolicy {
  // /**
  //  * Every logged-in user can create a roll
  //  */
  // create(user: User): AuthorizerResponse {
  //   return true
  // }
  //
  // /**
  //  * Only the post creator can edit the post
  //  */
  // edit(user: User, post: Post): AuthorizerResponse {
  //   return user.id === post.userId
  // }
  //
  // /**
  //  * Only the post creator can delete the post
  //  */
  // delete(user: User, post: Post): AuthorizerResponse {
  //   return user.id === post.userId
  // }
}
