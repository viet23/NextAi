import { buildQueryString } from "src/utils/common-utils";
import { api } from "./base";
// (nếu cần) import type cho kết quả search
// import type { GeoSearchItem } from "src/components/ads/types";

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
      transformResponse: (res: any) => res,
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

    // ================= NEW: Targeting Search =================
    targetingSearch: build.query<
      any[], // hoặc GeoSearchItem[]
      { q: string; country_code?: string; location_types?: string; limit?: number; version?: string; normalize?: 0 | 1 }
    >({
      query: (params) => {
        // BE controller: GET /api/v1/facebook-ads/targeting-search
        const query = buildQueryString({
          normalize: 1,
          location_types: '["city","region","country","subcity"]',
          ...params,
        });
        return {
          url: `/api/v1/facebook-ads/targeting-search?${query}`,
          method: "GET",
        };
      },
      transformResponse: (res: any) => res, // BE đã normalize
      // keepUnusedDataFor: 60, // (tuỳ chọn)
    }),
  }),
});

export const {
  // Ads
  useCreateAdsMutation,
  useUpdateAdInsightMutation,
  useSetAdStatusMutation,

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

  // NEW: Targeting Search
  useTargetingSearchQuery,
  useLazyTargetingSearchQuery,
} = facebookApi;

export default facebookApi;
