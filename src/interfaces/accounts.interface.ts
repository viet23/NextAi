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
  cookie: string;
  accessTokenUser: string;
  internalUserAccessToken?: string;
  internalPageAccessToken?: string;
  pageInformation: any;
  internalPageInformation?: any;
  accountAdsId: string;
  username: string;
  phone: string;
  email: string;
  roles: IRole[];
  groups: IRoleGroup[];
  isActive: boolean;
  isInternal: boolean;
  currentPlan?:any
  credits: number;
  zalo?: string;
  creditsData?: any;
}

export interface IAccountFilter {
  where: {
    keyword: string;
    status?: boolean;
    plan?: string;
  };
  page: number;
  pageSize: number;
}

export interface IUpdateAccountForm {
  fullName: string;
  phone: string;
  group: IRole[];
}
