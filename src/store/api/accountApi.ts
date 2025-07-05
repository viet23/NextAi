import { buildQueryString } from "src/utils/common-utils";
import { api } from "./base";
import {
  IAccount,
  IAccountFilter,
  IAccounts,
  IUpdateAccountForm,
} from "src/interfaces/accounts.interface";

const AccountApi = api.injectEndpoints({
  endpoints: build => ({
    getAccounts: build.query<IAccounts, IAccountFilter | null>({
      query: filter => ({
        url: `/api/v1/users?${buildQueryString(filter || {})}`,
        method: "GET",
      }),
    }),
    getAccount: build.query<IAccount, string>({
      query: id => ({
        url: `/api/v1/users/${id}`,
        method: "GET",
      }),
    }),
    updateAccount: build.mutation<IUpdateAccountForm, any>({
      query: body => ({
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
      query: body => ({
        url: "/api/v1/users/register",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useGetAccountQuery,
  useUpdateAccountMutation,
  useUpdateAccountGroupMutation,
  useCreateAccountMutation,
} = AccountApi;
export default AccountApi;
