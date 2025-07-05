import { api } from "./base";

const facebookApi = api.injectEndpoints({
  endpoints: build => ({
    createAds: build.mutation<any, any>({
      query: body => ({
        url: "/api/v1/facebook-ads/create",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
  }),
});
export const { useCreateAdsMutation } = facebookApi;
export default facebookApi;
