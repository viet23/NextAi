export interface IRole {
  id: string;
  name: string;
  description: string;
}

export interface IRoleRow extends IRole {
  access: boolean;
}

export interface IRoleGroup {
  id: string;
  name: string;
  description: string;
  roles: IRole[];
}

export interface IRoleGroupCreateForm {
  name: string;
  description: string;
  roles: IRole[];
}
