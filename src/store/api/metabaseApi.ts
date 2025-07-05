import { api } from "./base";

const MetabaseApi = api.injectEndpoints({
  endpoints: build => ({
    getMetabase: build.query<any, any>({
      query: () => ({
        url: `/api/v1/metabase`,
        method: "GET",
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
  }),
});
export const { useGetMetabaseQuery } = MetabaseApi;
export default MetabaseApi;
