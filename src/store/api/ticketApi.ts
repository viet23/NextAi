import { buildQueryString } from "src/utils/common-utils";
import { api } from "./base";
import {
  EXPORT_FILE_NAME_REPORT_TICKET,
  EXPORT_FILE_NAME_TICKET,
} from "src/constants/financial-transaction-reports.constant";

const TicketApi = api.injectEndpoints({
  endpoints: build => ({
    getCases: build.query<any, any>({
      query: filter => ({
        url: `/api/v1/case?${buildQueryString(filter)}`,
        method: "GET",
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
     getCasesAll: build.query<any, any>({
      query: filter => ({
        url: `/api/v1/case/all?${buildQueryString(filter)}`,
        method: "GET",
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
    getAnalysis: build.query<any, any>({
      query: filter => ({
        url: `/api/v1/case/analysis?${buildQueryString(filter)}`,
        method: "GET",
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
    getReportCases: build.query<any, any>({
      query: filter => ({
        url: `/api/v1/case/report?${buildQueryString(filter)}`,
        method: "GET",
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
    detailCase: build.query<any, any>({
      query: id => ({
        url: `/api/v1/case/${id}`,
        method: "GET",
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
    getCaseCustomers: build.query<any, any>({
      query: filter => ({
        url: `/api/v1/case/customers?filter[where][fullName]=${filter}`,
        method: "GET",
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
    getCaseStaff: build.query<any, any>({
      query: filter => ({
        url: `/api/v1/case/users?filter[where][fullName]=${filter}`,
        method: "GET",
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
    updateCase: build.mutation<any, any>({
      query: ({ id, body }) => ({
        url: `/api/v1/case/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),

    createCase: build.mutation<any, any>({
      query: body => ({
        url: "/api/v1/case",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),

    createAnalysis: build.mutation<any, any>({
      query: body => ({
        url: "/api/v1/case/analysis",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),

    exportCaseExcel: build.query<any, any>({
      query: filter => ({
        url: `/api/v1/case/export?${buildQueryString(filter)}`,
        method: "GET",
        responseHandler: response => response.blob(),
      }),
      transformResponse: (response: Blob) => {
        const fileName = EXPORT_FILE_NAME_TICKET;
        const url = URL.createObjectURL(new Blob([response]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
      },
    }),

    exportReportCaseExcel: build.query<any, any>({
      query: filter => ({
        url: `/api/v1/case/report/export?${buildQueryString(filter)}`,
        method: "GET",
        responseHandler: response => response.blob(),
      }),
      transformResponse: (response: Blob) => {
        const fileName = EXPORT_FILE_NAME_REPORT_TICKET;
        const url = URL.createObjectURL(new Blob([response]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
      },
    }),
  }),
});
export const {
  useGetCasesQuery,
  useGetCasesAllQuery,
  useGetAnalysisQuery,
  useGetReportCasesQuery,
  useLazyDetailCaseQuery,
  useLazyGetCasesQuery,
  useUpdateCaseMutation,
  useCreateCaseMutation,
  useCreateAnalysisMutation,
  useLazyGetCaseCustomersQuery,
  useLazyGetCaseStaffQuery,
  useLazyExportCaseExcelQuery,
  useLazyExportReportCaseExcelQuery,
} = TicketApi;
export default TicketApi;
