export function parseDynamicReturningUndefined(value: any) {
  if (value === 'true' || value === 'TRUE') {
    return true
  } else if (value === 'false' || value === 'FALSE') {
    return false
  } else { 
    const val = value === '' ? undefined : value
    console.log("FINAL ELSE", value, '<->',val)
    return val
  }
}
