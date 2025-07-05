import {
  IUserGrowthReport,
  IUserGrowthReportFilter,
} from "src/interfaces/user-growth-reports.interface";
import { api } from "./base";
import { buildQueryString } from "src/utils/common-utils";
import { EXPORT_FILE_NAME } from "src/constants/user-growth-reports.constants";

const UserGrowthReportApi = api.injectEndpoints({
  endpoints: build => ({
    getUserGrowthReports: build.query<IUserGrowthReport, IUserGrowthReportFilter | null>({
      query: filter => ({
        url: `/api/v1/reports/users?${buildQueryString(filter || {})}`,
        method: "GET",
      }),
      transformResponse: (res: IUserGrowthReport) => res,
    }),
    exportUserGrowthReportExcel: build.query<void, IUserGrowthReportFilter | null>({
      query: filter => ({
        url: `/api/v1/reports/export?${buildQueryString(filter || {})}`,
        method: "GET",
        responseHandler: response => response.blob(),
      }),
      transformResponse: (response: Blob) => {
        const fileName = EXPORT_FILE_NAME;
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
export const { useGetUserGrowthReportsQuery, useLazyExportUserGrowthReportExcelQuery } =
  UserGrowthReportApi;
export default UserGrowthReportApi;
