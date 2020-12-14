export class RegisterDTO {
  registrantId: string
  password: string
}

export class LoginDTO {
  email: string
  password: string
}

export class ChangePasswordDTO {
  oldPassword: string
  newPassword: string
}

export class ResetPasswordDTO {
  resetToken: string
  password: string
}