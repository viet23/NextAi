import { buildQueryString } from "src/utils/common-utils";
import { api } from "./base";

const CustomerApi = api.injectEndpoints({
  endpoints: build => ({
    getCustomers: build.query<any, any>({
      query: filter => ({
        url: `/api/v1/customers?${buildQueryString(filter)}`,
        method: "GET",
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
    detailCustomer: build.query<any, any>({
      query: id => ({
        url: `/api/v1/customers/${id}`,
        method: "GET",
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
    updateNotBlacklist: build.mutation<any, any>({
      query: id => ({
        url: `/api/v1/customers/update-not-black-list/${id}`,
        method: "PUT",
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
    exportExcel: build.query<any, any>({
      query: filter => ({
        url: `/api/v1/customers/export?${buildQueryString(filter)}`,
        method: "GET",
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
  }),
});
export const {
  useGetCustomersQuery,
  useDetailCustomerQuery,
  useLazyDetailCustomerQuery,
  useUpdateNotBlacklistMutation,
  useLazyExportExcelQuery,
} = CustomerApi;
export default CustomerApi;
