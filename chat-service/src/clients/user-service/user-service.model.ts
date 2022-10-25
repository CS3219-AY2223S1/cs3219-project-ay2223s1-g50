export enum UserRole {
  Admin = 900,
  User = 100,
}

export type ValidateTokenBody = {
  role: number
}

export type ValidateTokenResponse = {
  error?: string
  success?: string
  username?: string
}
