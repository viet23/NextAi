// src/store/api/facebookApi.ts
import { buildQueryString } from "src/utils/common-utils";
import { api } from "./base";

const facebookApi = api.injectEndpoints({
  endpoints: build => ({
    // ====== Ads (đang có) ======
    createAds: build.mutation<any, any>({
      query: body => ({
        url: "/api/v1/facebook-ads/create",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res,
    }),

    updateAdInsight: build.mutation<any, any>({
      query: ({ id, body }) => ({
        url: `/api/v1/facebook-ads/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (res: any) => res,
    }),

    // ✅ NEW: đổi trạng thái quảng cáo
    setAdStatus: build.mutation<
      { success: boolean; adId: string; status: "ACTIVE" | "PAUSED"; message?: string },
      { adId: string; isActive: boolean }
    >({
      query: ({ adId, isActive }) => ({
        url: `/api/v1/facebook-ads/${adId}/status`,
        method: "PUT",
        body: { isActive },
      }),
      transformResponse: (res: any) => res, // BE trả { success, adId, status, message }
    }),

    // ====== Facebook Post CRUD (mới thêm) ======
    getFacebookPosts: build.query<any, any>({
      query: filter => ({
        url: `/api/v1/facebook-posts?${buildQueryString(filter)}`,
        method: "GET",
      }),
      transformResponse: (res: any) => res,
    }),

    detailFacebookPost: build.query<any, any>({
      query: id => ({
        url: `/api/v1/facebook-posts/${id}`,
        method: "GET",
      }),
      transformResponse: (res: any) => res,
    }),

    createFacebookPost: build.mutation<any, any>({
      query: body => ({
        url: "/api/v1/facebook-posts",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res,
    }),

    updateFacebookPost: build.mutation<any, any>({
      query: ({ id, body }) => ({
        url: `/api/v1/facebook-posts/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res: any) => res,
    }),

    deleteFacebookPost: build.mutation<any, any>({
      query: id => ({
        url: `/api/v1/facebook-posts/${id}`,
        method: "DELETE",
      }),
      transformResponse: (res: any) => res,
    }),

    restoreFacebookPost: build.mutation<any, any>({
      query: id => ({
        url: `/api/v1/facebook-posts/${id}/restore`,
        method: "PATCH",
      }),
      transformResponse: (res: any) => res,
    }),

    getFacebookPageViews: build.query<any, { days?: number; pageId?: string } | void>({
      query: (params) => {
        const q = params ? `?${buildQueryString(params)}` : "";
        return {
          url: `/api/v1/facebook-posts/insights/page-views${q}`,
          method: "GET",
        };
      },
      transformResponse: (res: any) => res,
    }),
  }),
});

export const {
  // Ads
  useCreateAdsMutation,
  useUpdateAdInsightMutation,
  useSetAdStatusMutation,           // 👈 NEW

  // Facebook Post
  useGetFacebookPostsQuery,
  useLazyGetFacebookPostsQuery,
  useDetailFacebookPostQuery,
  useLazyDetailFacebookPostQuery,
  useCreateFacebookPostMutation,
  useUpdateFacebookPostMutation,
  useDeleteFacebookPostMutation,
  useRestoreFacebookPostMutation,
  useGetFacebookPageViewsQuery,
} = facebookApi;

export default facebookApi;
