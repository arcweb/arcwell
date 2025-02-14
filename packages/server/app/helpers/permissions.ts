import Policy from '#models/policy'

export function hasCapability(policies: Policy[] | undefined, capabilityName: string): boolean {
  if (!policies) {
    return false
  }
  // Return true if any policy has capabilities[capabilityName] === true
  return policies.some((policy) => policy.capabilities[capabilityName])
}

export enum CapabilitiesName {
  createFactsExample = 'createFactsExample',
}

export enum Roles {
  ADMIN = 'Admin',
  BASIC = 'Basic',
}
