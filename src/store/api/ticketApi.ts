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
      transformResponse: (res: any) => res,
    }),

    getCasesAll: build.query<any, any>({
      query: filter => ({
        url: `/api/v1/case/all?${buildQueryString(filter)}`,
        method: "GET",
      }),
      transformResponse: (res: any) => res,
    }),

    getAnalysis: build.query<any, any>({
      query: filter => ({
        url: `/api/v1/case/analysis?${buildQueryString(filter)}`,
        method: "GET",
      }),
      transformResponse: (res: any) => res,
    }),

    getCredit: build.query<any, any>({
      query: filter => ({
        url: `/api/v1/case/credit?${buildQueryString(filter)}`,
        method: "GET",
      }),
      transformResponse: (res: any) => res,
    }),

    getFacebookads: build.query<any, any>({
      query: filter => ({
        url: `/api/v1/case/facebookads?${buildQueryString(filter)}`,
        method: "GET",
      }),
      transformResponse: (res: any) => res,
    }),

    // ================= NEW: Lấy posts từ BE (đã ép Cookie/Bearer ở server) =================
    getFacebookPostsGraph: build.query<
      { data: any[]; meta: { total: number; monthlyCount: any[]; page?: number; pageSize?: number; totalPages?: number } },
      { page?: number; pageSize?: number; pageId?: string }
    >({
      query: (filter) => ({
        url: `/api/v1/facebook-ads/graph?${buildQueryString(filter)}`,
        method: "GET",
      }),
      transformResponse: (res: any) => res,
      // Nếu bạn cần gửi thêm header (ví dụ x-user-email) ở từng request:
      // providesTags: ['FacebookPostsGraph'], // tuỳ nhu cầu cache
    }),

    getReportCases: build.query<any, any>({
      query: filter => ({
        url: `/api/v1/case/report?${buildQueryString(filter)}`,
        method: "GET",
      }),
      transformResponse: (res: any) => res,
    }),

    detailCase: build.query<any, any>({
      query: id => ({
        url: `/api/v1/case/${id}`,
        method: "GET",
      }),
      transformResponse: (res: any) => res,
    }),

    detailAds: build.query<any, any>({
      query: id => ({
        url: `/api/v1/case/ads/${id}`,
        method: "GET",
      }),
      transformResponse: (res: any) => res,
    }),

    detailCredit: build.query<any, any>({
      query: id => ({
        url: `/api/v1/case/credit/${id}`,
        method: "GET",
      }),
      transformResponse: (res: any) => res,
    }),

    getCaseCustomers: build.query<any, any>({
      query: filter => ({
        url: `/api/v1/case/customers?filter[where][fullName]=${filter}`,
        method: "GET",
      }),
      transformResponse: (res: any) => res,
    }),

    getCaseStaff: build.query<any, any>({
      query: filter => ({
        url: `/api/v1/case/users?filter[where][fullName]=${filter}`,
        method: "GET",
      }),
      transformResponse: (res: any) => res,
    }),

    updateCase: build.mutation<any, any>({
      query: ({ id, body }) => ({
        url: `/api/v1/case/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (res: any) => res,
    }),

    createCase: build.mutation<any, any>({
      query: body => ({
        url: "/api/v1/case",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res,
    }),

    createAnalysis: build.mutation<any, any>({
      query: body => ({
        url: "/api/v1/case/analysis",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res,
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
  useGetFacebookadsQuery,
  useGetCreditQuery,
  useLazyDetailCreditQuery,
  useLazyDetailAdsQuery,

  // ===== NEW hooks
  useGetFacebookPostsGraphQuery,
  useLazyGetFacebookPostsGraphQuery,
} = TicketApi;

export default TicketApi;
