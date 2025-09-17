import { buildQueryString } from "src/utils/common-utils";
import { api } from "./base";
import {
  IAccount,
  IAccountFilter,
  IAccounts,
  IUpdateAccountForm,
} from "src/interfaces/accounts.interface";

/** Tối thiểu hoá type để dùng ngay; nếu bạn có file interface riêng, có thể tách ra */
export interface IBuyPlanBody {
  name: "Free" | "Starter" | "Pro" | "Enterprise";
  months: number;
}
export interface IConfirmPlanBody {
  subscriptionId: string;
}
export interface ICurrentPlan {
  currentPlan: {
    name: string;
    price: number;
    startDate: string;
    endDate: string;
    isPaid: boolean;
  } | null;
}

const AccountApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAccounts: build.query<IAccounts, IAccountFilter | null>({
      query: (filter) => ({
        url: `/api/v1/users?${buildQueryString(filter || {})}`,
        method: "GET",
      }),
    }),
    getAccount: build.query<IAccount, string>({
      query: (id) => ({
        url: `/api/v1/users/${id}`,
        method: "GET",
      }),
    }),
    updateAccount: build.mutation<IUpdateAccountForm, any>({
      query: (body) => ({
        url: "/api/v1/users",
        method: "PUT",
        body,
      }),
    }),
    updateAccountGroup: build.mutation<any, any>({
      query: ({ id, body }) => ({
        url: `/api/v1/users/groups/${id}`,
        method: "PUT",
        body,
      }),
    }),

    createAccount: build.mutation<any, any>({
      query: (body) => ({
        url: "/api/v1/users/register",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res,
    }),
    forgotPassword: build.mutation<any, any>({
      query: (body) => ({
        url: "/api/v1/users/forgot-password",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res,
    }),
    resetUserPassword: build.mutation<any, any>({
      query: (body) => ({
        url: "/api/v1/users/reset-password",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res,
    }),

    // ====== NEW: Subscriptions ======
    buyPlan: build.mutation<any, IBuyPlanBody>({
      query: (body) => ({
        url: "/api/v1/users/buy-plan",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res,
    }),
    confirmPlan: build.mutation<any, IConfirmPlanBody>({
      query: (body) => ({
        url: "/api/v1/users/confirm-plan",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res,
    }),
    getCurrentPlan: build.query<ICurrentPlan | any, void>({
      query: () => ({
        url: "/api/v1/users/current-plan",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useGetAccountQuery,
  useLazyGetAccountQuery,
  useUpdateAccountMutation,
  useUpdateAccountGroupMutation,
  useCreateAccountMutation,
  useForgotPasswordMutation,
  useResetUserPasswordMutation,

  // NEW hooks
  useBuyPlanMutation,
  useConfirmPlanMutation,
  useGetCurrentPlanQuery,
  useLazyGetCurrentPlanQuery,
} = AccountApi;

export default AccountApi;
