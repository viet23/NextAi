import { IRoleGroup } from "src/interfaces/roles.interface";
import {
  setCurrentMerchant,
  setCurrentUser,
  setIsLogin,
  setRefreshToken,
  setToken,
} from "../slice/auth.slice";
import { store } from "../store";
import { api } from "./base";

const AuthApi = api.injectEndpoints({
  endpoints: (build) => ({
    samlSignin: build.mutation<any, any>({
      query: () => ({
        url: "api/v1/auth/saml/login",
        method: "POST",
      }),
      transformResponse: (response: any) => {
        store.dispatch(setToken(response.token));
        store.dispatch(setCurrentUser(response));
        store.dispatch(setIsLogin(true));
        return response;
      },
    }),
    signIn: build.mutation<any, any>({
      query: (body) => ({
        url: "api/v1/auth/signin",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => {
        store.dispatch(setToken(response.token));
        store.dispatch(setCurrentUser(response));
        store.dispatch(setIsLogin(true));
        return response;
      },
    }),
    signOut: build.query<any, any>({
      query: () => ({
        url: "api/v1/authentication/logout",
        method: "GET",
      }),
      transformResponse: (res: any) => {
        localStorage.clear();
        store.dispatch(setCurrentUser({}));
        store.dispatch(setIsLogin(false));
        store.dispatch(setToken(null));
        store.dispatch(setRefreshToken(null));
        store.dispatch(setCurrentMerchant(null));
        return res;
      },
    }),
    resetPassword: build.mutation<any, any>({
      query: (body) => ({
        url: "api/v1/authentication/password/reset",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
    createPassword: build.mutation<any, any>({
      query: (body) => ({
        url: "/api/v1/authentication/password",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => {
        localStorage.clear();
        store.dispatch(setCurrentUser({}));
        store.dispatch(setIsLogin(false));
        return res;
      },
    }),
    checkToken: build.mutation<any, any>({
      query: (body) => ({
        url: "/api/v1/authentication/check-token",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => {
        return res;
      },
    }),
    userDetailMerchant: build.query<any, any>({
      keepUnusedDataFor: 0,
      query: () => ({
        url: "api/v1/merchant",
        method: "GET",
      }),
      transformResponse: (res: any) => {
        const { response } = res;
        store.dispatch(setCurrentMerchant(response));
        return response;
      },
    }),
    getAuthRoles: build.query<IRoleGroup[], any>({
      query: () => ({
        url: "/api/v1/roles/user",
        method: "GET",
      }),
    }),
  }),
});
export const {
  useSignInMutation,
  useLazySignOutQuery,
  useResetPasswordMutation,
  useCreatePasswordMutation,
  useCheckTokenMutation,
  useLazyUserDetailMerchantQuery,
  useSamlSigninMutation,
  useGetAuthRolesQuery,
} = AuthApi;
export default AuthApi;
