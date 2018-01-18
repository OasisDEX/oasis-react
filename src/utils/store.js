export function pending(actionName) {
  return `${actionName}_PENDING`;
}

export function fulfilled(actionName) {
  return `${actionName}_FULFILLED`;
}

export function rejected(actionName) {
  return `${actionName}_REJECTED`;
}
