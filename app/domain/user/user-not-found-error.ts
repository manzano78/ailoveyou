export class UserNotFoundError extends Error {
  constructor(key: 'username' | 'id', value: string) {
    super(`Could not find any user with ${key} = '${value}'`);
  }
}
