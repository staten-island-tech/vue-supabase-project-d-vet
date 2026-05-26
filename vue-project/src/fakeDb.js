export function createUser(data = {}) {
  return {
    id: data.id ?? null,
    name: data.name ?? "",
    roleId: data.roleId ?? null
  }
}
