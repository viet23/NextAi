import { IRole, IRoleGroup } from "./roles.interface";

export interface IAuthState {
  user: any;
  isLogin: boolean;
  batchOtpExpired: number | null;
  token: string | null;
  refreshToken: string | null;
  merchant: any;
  roles: IRole[];
  groups: Partial<IRoleGroup[]>;
}
