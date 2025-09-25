// src/store/api/capiApi.ts
import { api } from "./base";

const capiApi = api.injectEndpoints({
  endpoints: (build) => ({
    sendCapiEvent: build.mutation<any, { body: any }>({
      query: ({ body }) => ({
        url: `/api/v1/capi-events`,   // khớp globalPrefix bạn đang set
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res,
    }),
  }),
  overrideExisting: false,
});

export const { useSendCapiEventMutation } = capiApi;
export default capiApi;
