import { buildQueryString } from "src/utils/common-utils";
import { api } from "./base";

const BlacklistApi = api.injectEndpoints({
  endpoints: (build) => ({
    getBlackList: build.query<any, any>({
      query: (filter) => ({
        url: `/api/v1/black-list?${buildQueryString(filter)}`,
        method: "GET",
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
  }),
});
export const { useGetBlackListQuery, useLazyGetBlackListQuery } = BlacklistApi;
export default BlacklistApi;
