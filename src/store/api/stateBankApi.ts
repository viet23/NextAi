import { buildQueryString } from "src/utils/common-utils";
import { api } from "./base";
import { EXPORT_FILE_NAME_STATE } from "src/constants/financial-transaction-reports.constant";

const StateApi = api.injectEndpoints({
  endpoints: build => ({
    getState: build.query<any, any>({
      query: () => ({
        url: `/api/v1/reports/state-bank`,
        method: "GET",
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
    exportStateExcel: build.query<any, any>({
      query: filter => ({
        url: `/api/v1/reports/export/state-bank`,
        method: "GET",
        responseHandler: response => response.blob(),
      }),
      transformResponse: (response: Blob) => {
        const fileName = EXPORT_FILE_NAME_STATE;
        const url = URL.createObjectURL(new Blob([response]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
      },
    }),
    getSyncTcp: build.query<any, any>({
      query: () => ({
        url: `/api/v1/reports/sync-tcp`,
        method: "GET",
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
  }),
});
export const { useGetStateQuery, useLazyExportStateExcelQuery, useLazyGetSyncTcpQuery } = StateApi;
export default StateApi;
