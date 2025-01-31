import User from '#models/user'
import Fact from '#models/fact'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { CapabilitiesName, hasCapability, Roles } from '#helpers/permissions'

export default class FactPolicy extends BasePolicy {
  mergedCapabilities: Record<string, boolean> = {}

  async before(user: User | null) {
    /**
     * Always allow an admin user without performing any check
     */
    if (user) {
      await user.load('role', (roleQuery) => {
        roleQuery.preload('policies')
      })
      await user.load('groups')
    }

    /**
     * Always allow an admin user without performing any check.
     * Remove this if you want to specify all capabilities manually and don't want admin user having full access
     */
    if (user && user.role.name === Roles.ADMIN) {
      return true
    }
  }

  async index(user: User): Promise<AuthorizerResponse> {
    return true
  }

  show(user: User, fact: Fact): AuthorizerResponse {
    return true
  }

  store(user: User): AuthorizerResponse {
    if (hasCapability(user.role?.policies, CapabilitiesName.createFactsExample)) {
      console.log('Allowed to create facts')
      return true
    } else {
      return false
    }
  }

  update(user: User, fact: Fact): AuthorizerResponse {
    return true
  }

  destroy(user: User, fact: Fact): AuthorizerResponse {
    return true
  }

  bulk(user: User): AuthorizerResponse {
    return true
  }
}
