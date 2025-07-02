export class UsernameNotAvailableError extends Error {
  constructor(username: string) {
    super(
      `The username '${username}' is not available, please choose another one.`,
    );
  }
}
