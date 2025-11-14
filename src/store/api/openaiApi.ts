import { api } from "./base";

const openaiApi = api.injectEndpoints({
  endpoints: build => ({
    /** 🟢 Gọi API phân tích targeting */
    openaiTargeting: build.mutation<any, any>({
      query: body => ({
        url: "/api/v1/openai/analyze-targeting",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res,
    }),

    /** 🟢 Gọi API rewrite content */
    openaiRewrite: build.mutation<any, any>({
      query: body => ({
        url: "/api/v1/openai/rewrite",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res,
    }),

    /** 🟢 Gọi API chấm điểm quảng cáo */
    openaiScoreAd: build.mutation<any, any>({
      query: body => ({
        url: "/api/v1/openai/score-ad",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res,
    }),

    /** 🟢 Gọi API generate content general */
    openaiGenerate: build.mutation<any, any>({
      query: body => ({
        url: "/api/v1/openai/generate",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res,
    }),

    /** 🟢 Gọi API simple chat (1 prompt) */
    openaiSimpleChat: build.mutation<any, any>({
      query: body => ({
        url: "/api/v1/openai/simple-chat",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res,
    }),

    openaiCreativeChat: build.mutation<any, any>({
      query: body => ({
        url: "/api/v1/openai/creative-chat",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res,
    }),

    openaiScoreCaption: build.mutation<
      { ok: boolean; score: number | null; raw: string },
      { contentFetchOpportunityScore: string; captionText: string }
    >({
      query: body => ({
        url: "/api/v1/openai/score-caption",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => ({
        ok: !!res?.ok,
        score: typeof res?.score === "number" ? res.score : null,
        raw: res?.raw ?? "",
      }),
    }),

    openaiTranslateExpand: build.mutation<any, { text: string }>({
      query: body => ({
        url: "/api/v1/openai/translate-expand",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res,
    }),

    openaiGenerateCaption: build.mutation<
      { ok: boolean; caption: string },
      { contentGenerateCaption: string; description: string }
    >({
      query: body => ({
        url: "/api/v1/openai/generate-caption",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => ({
        ok: !!res?.ok,
        caption: res?.caption ?? "",
      }),
    }),

    openaiPromptChat: build.mutation<
      { ok: boolean; text: string },
      { promptContent: string }
    >({
      query: body => ({
        url: "/api/v1/openai/prompt-chat",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => ({
        ok: !!res?.ok,
        text: res?.text ?? "",
      }),
    }),

    /** 🟢 Gọi API chat widget (đa turn, có previousResponseId) */
    openaiChatWidget: build.mutation<
      { reply: string; responseId?: string | null },
      {
        messages: { role: string; content: string }[];
        previousResponseId?: string | null;
      }
    >({
      query: body => ({
        url: "/api/v1/openai/chat-widget",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => ({
        reply: res?.reply ?? "",
        responseId: res?.responseId ?? null,
      }),
    }),
  }),
});

export const {
  useOpenaiTargetingMutation,
  useOpenaiRewriteMutation,
  useOpenaiScoreAdMutation,
  useOpenaiGenerateMutation,
  useOpenaiSimpleChatMutation,
  useOpenaiCreativeChatMutation,
  useOpenaiScoreCaptionMutation,
  useOpenaiTranslateExpandMutation,
  useOpenaiGenerateCaptionMutation,
  useOpenaiPromptChatMutation,
  useOpenaiChatWidgetMutation,   // 👈 hook mới
} = openaiApi;

export default openaiApi;
