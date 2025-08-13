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
     updateAdInsight: build.mutation<any, any>({
      query: ({ id, body }) => ({
        url: `/api/v1/facebook-ads/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
  }),
});
export const { useCreateAdsMutation, useUpdateAdInsightMutation } = facebookApi;
export default facebookApi;
