import { api } from "./base";

const EmailApi = api.injectEndpoints({
  endpoints: build => ({
    sendEmail: build.mutation<any, any>({
      query: body => ({
        url: "/api/v1/email/send-form",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
  }),
});
export const { useSendEmailMutation } = EmailApi;
export default EmailApi;
