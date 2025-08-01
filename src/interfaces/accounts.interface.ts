import { IRole, IRoleGroup } from "./roles.interface";

export interface IAccounts {
  data: IAccount[];
  total: number;
}

export interface IAccount {
  id: string;
  fullName: string;
  extension: string;
  idPage: string;
  accessToken: string;
  accessTokenUser: string;
  accountAdsId: string;
  username: string;
  phone: string;
  email: string;
  roles: IRole[];
  groups: IRoleGroup[];
  isActive: boolean;
  credits: number;
  zalo?: string;
}

export interface IAccountFilter {
  where: {
    keyword: string;
    status?: boolean;
  };
  page: number;
  pageSize: number;
}

export interface IUpdateAccountForm {
  fullName: string;
  phone: string;
  group: IRole[];
}
