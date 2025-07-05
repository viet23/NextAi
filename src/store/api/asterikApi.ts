import { api } from "./base";

const AsterikApi = api.injectEndpoints({
  endpoints: build => ({
    getAsterikCall: build.query<any, any>({
      query: phone => ({
        url: `/api/v1/asterisk/call/${phone}`,
        method: "GET",
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
  }),
});

export const { useGetAsterikCallQuery, useLazyGetAsterikCallQuery } = AsterikApi;
export default AsterikApi;
