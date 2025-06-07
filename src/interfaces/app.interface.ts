import { IAuthState } from "./auth.interface";

export interface IAppMenuState {
  menu: string[] | any;
  navbarCollapsed: boolean;
  pageTitle: string;
}
export interface IRootState {
  app: IAppMenuState;
  auth: IAuthState;
}

export interface IDetailVA {
  id: string | null;
  handleClose: any;
}
export interface IPagination {
  offset?: number;
  order?: string;
  page: number;
  per_page: number;
  total_item?: number;
}
export interface IDynamicObject {
  [key: string]: any; // Kiểu `any` để cho phép bất kỳ loại dữ liệu nào
}
