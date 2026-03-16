export interface IUser {
  displayName: string;
  email: string;
}

export interface ICurrentUser extends IUser {
  loginName: string;
}
