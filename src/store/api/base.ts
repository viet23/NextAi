import { Mutex } from "async-mutex";
import {
  type BaseQueryFn,
  createApi,
  type FetchArgs,
  fetchBaseQuery,
  type FetchBaseQueryArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { message } from "antd";
import { store } from "../store";
import { setCurrentUser, setIsLogin, setToken } from "../slice/auth.slice";

const mutex = new Mutex();
export const baseQuery = fetchBaseQuery({
  cache: "no-cache",
  credentials: 'include',
  prepareHeaders: (headers) => {
    const { auth } = store.getState();
    const token = auth.token || null;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = (await baseQuery(args, api, extraOptions)) as any;
  if (result.error) {
    if (result.error?.status === 401) {
      store.dispatch(setCurrentUser({}));
      store.dispatch(setIsLogin(false));
      store.dispatch(setToken(null));
      localStorage.clear();
      // window.location.replace("/signin");
    } else {
      const { data } = result.error;
      data?.meta?.msg && message.error(data?.meta?.msg);
    }
  }
  return result;
};
export const api = createApi({
  baseQuery: baseQueryWithReauth,
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true,
  reducerPath: "api",
  tagTypes: ["all"],
  endpoints: () => ({}),
  keepUnusedDataFor: 0,
});
