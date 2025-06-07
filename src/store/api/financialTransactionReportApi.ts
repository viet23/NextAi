import { buildQueryString } from "src/utils/common-utils";
import { api } from "./base";
import {
  IFinancialTransactionReportFailed,
  IFinancialTransactionReportFilter,
  IFinancialTransactionReportSuccess,
  IFinancialTransactionReportSuccessChart,
  IFinancialTransactionReportTotal,
} from "src/interfaces/financial-transaction-reports.interface";

const FinancialTransactionReportApi = api.injectEndpoints({
  endpoints: (build) => ({
    getFinancialTransactions: build.query<
      IFinancialTransactionReportTotal,
      IFinancialTransactionReportFilter | null
    >({
      query: (filter) => ({
        url: `/api/v1/reports/transactions?${buildQueryString(filter || {})}`,
        method: "GET",
      }),
    }),
    getFinancialTransactionsSuccess: build.query<
      IFinancialTransactionReportSuccess,
      IFinancialTransactionReportFilter | null
    >({
      query: (filter) => ({
        url: `/api/v1/reports/transactions/success?${buildQueryString(
          filter || {}
        )}`,
        method: "GET",
      }),
    }),
    getFinancialTransactionsSuccessChart: build.query<
      IFinancialTransactionReportSuccessChart,
      IFinancialTransactionReportFilter | null
    >({
      query: (filter) => ({
        url: `/api/v1/reports/transactions/chart?${buildQueryString(
          filter || {}
        )}`,
        method: "GET",
      }),
    }),
    getFinancialTransactionsFailed: build.query<
      IFinancialTransactionReportFailed,
      IFinancialTransactionReportFilter | null
    >({
      query: (filter) => ({
        url: `/api/v1/reports/transactions/fail?${buildQueryString(
          filter || {}
        )}`,
        method: "GET",
      }),
    }),
    exportFinancialTransactionReportExcel: build.query<
      any,
      IFinancialTransactionReportFilter
    >({
      query: (filter) => ({
        url: `/api/v1/reports/export?${buildQueryString(filter || {})}`,
        method: "GET",
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
  }),
});
export const {
  useGetFinancialTransactionsQuery,
  useGetFinancialTransactionsSuccessChartQuery,
  useGetFinancialTransactionsSuccessQuery,
  useLazyExportFinancialTransactionReportExcelQuery,
  useGetFinancialTransactionsFailedQuery,
} = FinancialTransactionReportApi;
export default FinancialTransactionReportApi;
