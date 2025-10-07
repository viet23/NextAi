import React, { useEffect, useMemo, useState } from "react";
import {
  Typography,
  Select,
  Input,
  Button,
  Row,
  Col,
  DatePicker,
  InputNumber,
  message,
  Card,
  Radio,
  Slider,
  Tag,
  Checkbox,
} from "antd";
import dayjs from "dayjs";
import {
  useCreateAdsMutation,
  useCreateFacebookPostMutation,
  useDetailFacebookPostQuery,
} from "src/store/api/facebookApi";
import { useTranslation } from "react-i18next";
import FullscreenLoader from "../FullscreenLoader";
import { useOpenaiTargetingMutation } from "src/store/api/openaiApi";
import { ReloadOutlined } from "@ant-design/icons";

import LocationSelector from "./LocationSelector";
import type { SelectedLocation } from "./types";
import { PROMPT_ADS } from "./constans";

const { Option } = Select;
const { Title } = Typography;
const { RangePicker } = DatePicker;

interface AdsFormProps {
  id: string | null;
  postRecot: any;
  pageId: string | null;
  selectedPosts?: any[]; // expects fields including id, caption, media/url, permalink_url, react/comment/share, hasMessageCTA, cta
}

const DetailAds: React.FC<AdsFormProps> = ({ id, postRecot, pageId, selectedPosts = [] }) => {
  const { t } = useTranslation();

  const isMulti = Array.isArray(selectedPosts) && selectedPosts.length > 0;

  // states
  const [goal, setGoal] = useState<"message" | "engagement" | "leads" | "traffic">("message");
  const [caption, setCaption] = useState("");
  const [urlWebsite, setUrleWbsite] = useState<string | undefined>(undefined);
  const [aiTargeting, setAiTargeting] = useState(false);
  const [gender, setGender] = useState<"all" | "male" | "female">("all");
  const [age, setAge] = useState<[number, number]>([18, 65]);
  const [interests, setInterests] = useState<string[]>(["Sức khỏe"]);
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs(), dayjs().add(5, "day")]);
  const [language, setLanguage] = useState<string>("en");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [targetingAI, setTargetingAI] = useState<any>({});
  const [budgetVnd, setBudgetVnd] = useState<number>(100000);
  const [locationMode, setLocationMode] = useState<"nationwide" | "custom">("nationwide");
  const [isCampaignEdited, setIsCampaignEdited] = useState(false);
  const [locations, setLocations] = useState<SelectedLocation[]>([]);

  const postIdOnly = id?.split("_")[1];
  const isMessage = goal === "message";

  // API hooks
  const { data, isSuccess, isError } = useDetailFacebookPostQuery(id, { skip: !id || isMulti });
  const [createPost, { isLoading: creatingPost }] = useCreateFacebookPostMutation();
  const [openaiTargeting, { isLoading: isTargeting }] = useOpenaiTargetingMutation();
  const [createAds, { isLoading: creatingCase }] = useCreateAdsMutation();

  // multi-select active ids
  const [activeIds, setActiveIds] = useState<string[]>(
    isMulti ? selectedPosts.map((p) => p.id) : []
  );

  useEffect(() => {
    if (isMulti) {
      // keep only ids that still exist + add any new posts (merge)
      setActiveIds((prev) => {
        const all = selectedPosts.map((p) => p.id);
        const merged = Array.from(new Set(prev.filter((id) => all.includes(id)).concat(all)));
        return merged;
      });
    } else {
      setActiveIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMulti, selectedPosts]);

  // helper detect CTA
  const postHasMessageCTA = (p: any) => {
    if (!p) return false;
    if (typeof p.hasMessageCTA === "boolean") return p.hasMessageCTA;
    if (p?.cta && typeof p.cta?.type === "string") {
      return p.cta.type.toString().toLowerCase().includes("message");
    }
    if (Array.isArray(p?.attachments)) {
      try {
        for (const a of p.attachments) {
          const text = `${a?.title ?? ""} ${a?.description ?? ""} ${a?.name ?? ""}`.toLowerCase();
          if (text.includes("send message") || text.includes("gửi tin") || text.includes("nhắn") || text.includes("message")) return true;
        }
      } catch { }
    }
    return false;
  };

  /**
   * EFFECT: when goal changes
   * - if goal === "message": remove active posts that don't have CTA message and notify user
   * - else (other goals): auto-select ALL posts
   */
  useEffect(() => {
    if (!isMulti) return;

    if (goal === "message") {
      const removed: string[] = [];
      const newActive = activeIds.filter((id) => {
        const p = selectedPosts.find((x) => x.id === id);
        const ok = !!postHasMessageCTA(p);
        if (!ok) removed.push(id);
        return ok;
      });

      if (removed.length > 0) {
        setActiveIds(newActive);
        message.error(
          `Bỏ ${removed.length} bài không có hành động Nhắn tin. Vui lòng gắn CTA "Nhắn tin" trên bài hoặc chọn bài khác.`,
          6
        );
      }
    } else {
      // goal != "message" -> auto select all posts
      const allIds = selectedPosts.map((p) => p.id);
      setActiveIds(allIds);
      // optionally inform user
      message.success(`Tự động chọn ${allIds.length} bài vì mục tiêu không phải là Nhắn tin.`, 3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal, isMulti, selectedPosts]);

  const activeSelectedPosts = isMulti
    ? selectedPosts.filter((p) => activeIds.includes(p.id))
    : [];

  const toggleOne = (id: string) => {
    // If goal is message, prevent selecting posts without CTA
    if (goal === "message") {
      const p = selectedPosts.find((x) => x.id === id);
      if (!postHasMessageCTA(p)) {
        message.error("Bài này chưa gắn hành động Nhắn tin — không thể chọn khi mục tiêu là Tăng tin nhắn.");
        return;
      }
    }
    setActiveIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.concat(id)
    );
  };

  // preview helpers
  const firstPost = isMulti ? (activeSelectedPosts[0] ?? selectedPosts[0]) : postRecot;
  const previewImg =
    firstPost?.media?.props?.src ||
    firstPost?.url ||
    "https://via.placeholder.com/720x720?text=Image+not+available";
  const previewAlt = firstPost?.media?.props?.alt || "facebook post media";
  const previewCaptionSingle = firstPost?.caption || caption || "";
  const previewPermalinkSingle =
    firstPost?.permalink_url ||
    (pageId && postIdOnly ? `https://www.facebook.com/${pageId}/posts/${postIdOnly}` : undefined);

  const combinedCaption = useMemo(() => {
    if (!isMulti) return previewCaptionSingle;
    const caps = activeSelectedPosts
      .map((p) => (p?.caption || "").toString().trim())
      .filter(Boolean)
      .slice(0, 3)
      .map((c) => (c.length > 120 ? c.slice(0, 120) + "…" : c));
    return caps.join(" | ");
  }, [isMulti, activeSelectedPosts, previewCaptionSingle]);

  const initialCampaignName = useMemo(() => {
    const now = dayjs().format("YYYY-MM-DD HH:mm");
    const raw = (
      isMulti
        ? (activeSelectedPosts[0]?.caption ?? selectedPosts[0]?.caption ?? "")
        : (postRecot?.caption ?? "")
    )
      .toString()
      .trim()
      .replace(/\s+/g, " ");
    const snippet = raw ? raw.slice(0, 30) : "";
    return snippet ? `Campaign ${now} - ${snippet}` : `Campaign ${now}`;
  }, [isMulti, activeSelectedPosts, selectedPosts, postRecot?.caption]);

  const [campaignName, setCampaignName] = useState<string>(initialCampaignName);
  useEffect(() => {
    if (!isCampaignEdited) setCampaignName(initialCampaignName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCampaignName]);

  const buildPrompt = (content: string, imageUrl: string) => `
${PROMPT_ADS}

Content: ${content || ""}
Image URL: ${imageUrl || "Không có"}
`;

  async function analyzePostForTargeting(captionText: string, imageUrl: string) {
    const prompt = buildPrompt(captionText, imageUrl);
    setAnalysisLoading(true);

    try {
      const body: any = { prompt };
      const response = await openaiTargeting(body).unwrap();

      let raw: string = response.raw ?? "[]";
      raw = raw.trim();
      if (raw.startsWith("```")) {
        raw = raw.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
      }

      let parsed: any[] = [];
      try {
        const json = JSON.parse(raw);
        parsed = Array.isArray(json) ? json : [json];
      } catch {
        parsed = Array.isArray(response.result) ? response.result : [];
      }

      const first = parsed[0] || {};
      setInterests(first.keywordsForInterestSearch || []);
      setAge([first?.persona?.age_min || 18, first?.persona?.age_max || 65]);
      setTargetingAI(first);

      const urlPostForSaving = previewPermalinkSingle || imageUrl || "";
      await createPost({
        postId: isMulti ? (activeSelectedPosts[0]?.id ?? selectedPosts[0]?.id ?? id) : id,
        urlPost: urlPostForSaving,
        dataTargeting: first,
      }).unwrap();

      message.success(`Tạo taget thành công`);
      return parsed;
    } catch (err) {
      console.error("OpenAI error:", err);
      return [];
    } finally {
      setAnalysisLoading(false);
    }
  }

  useEffect(() => {
    if (isMulti) {
      analyzePostForTargeting(combinedCaption, previewImg);
      return;
    }

    if (isSuccess && data) {
      if (data?.dataTargeting?.keywordsForInterestSearch?.length > 0) {
        setInterests(data.dataTargeting.keywordsForInterestSearch);
        setAge([
          data.dataTargeting?.persona?.age_min || 18,
          data.dataTargeting?.persona?.age_max || 65,
        ]);
        setTargetingAI(data.dataTargeting);
      } else if (postRecot) {
        analyzePostForTargeting(postRecot.caption, previewImg);
      }
    }
    if (isError && postRecot) {
      analyzePostForTargeting(postRecot.caption, previewImg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMulti, isSuccess, isError, data, postRecot, combinedCaption]);

  function buildGeoLocationsPayload(selections: SelectedLocation[]) {
    const countries: string[] = [];
    const regions: any[] = [];
    const cities: any[] = [];
    const subcities: any[] = [];
    const custom_locations: any[] = [];

    for (const s of selections) {
      if (s.type === "country" && s.country_code) {
        if (!countries.includes(s.country_code)) countries.push(s.country_code);
      } else if (s.type === "region") {
        regions.push({ key: s.key });
      } else if (s.type === "city") {
        cities.push({
          key: s.key,
          radius: Math.round(((s.radius ?? 10000) as number) / 1000),
          distance_unit: "kilometer",
        });
      } else if (s.type === "subcity" || s.type === "neighborhood") {
        subcities.push({
          key: s.key,
          radius: Math.round(((s.radius ?? 10000) as number) / 1000),
          distance_unit: "kilometer",
        });
      } else if (s.type === "custom") {
        if (s.latitude && s.longitude && s.radius) {
          custom_locations.push({
            latitude: s.latitude,
            longitude: s.longitude,
            radius: Math.round(((s.radius ?? 1000) as number) / 1000),
            distance_unit: "kilometer",
          });
        }
      }
    }

    const geo_locations: any = {};
    if (countries.length) geo_locations.countries = countries;
    if (regions.length) geo_locations.regions = regions;
    if (cities.length) geo_locations.cities = cities;
    if (subcities.length) geo_locations.subcities = subcities;
    if (custom_locations.length) geo_locations.custom_locations = custom_locations;
    if (!Object.keys(geo_locations).length) {
      geo_locations.countries = ["VN"];
    }
    return geo_locations;
  }

  const handlePublish = async () => {
    try {
      if (goal === "traffic" && (!urlWebsite || urlWebsite.trim() === "")) {
        message.error("Please enter website link when selecting goal as 'Get more website visitors'");
        return;
      }
      if (goal === "leads") setGoal("engagement");

      // Chuẩn hoá dữ liệu posts gửi lên BE: CHỈ các bài đang chọn
      const minimalPosts = isMulti
        ? activeSelectedPosts.map((p) => ({
          id: p.id,
          caption: (p.caption ?? "").toString(),
          media: p.media?.props?.src ?? p.url ?? "",
          permalink_url: p.permalink_url ?? "",
        }))
        : [];

      if (isMulti && minimalPosts.length === 0) {
        message.warning("Bạn chưa chọn bài viết nào để tạo quảng cáo.");
        return;
      }

      const postIds = minimalPosts.map((p) => p.id);
      const images = minimalPosts.map((p) => p.media);
      const contents = minimalPosts.map((p) => p.caption);

      // BUILD BODY
      let body: any = {
        goal,
        campaignName,
        caption,
        language,
        urlWebsite,
        aiTargeting: Boolean(aiTargeting),
        startTime: range[0].toISOString(),
        endTime: range[1].toISOString(),
        dailyBudget: Math.round(Number(budgetVnd)),
        targetingAI,
      };

      if (isMulti) {
        if (goal === "message") {
          // Khi mục tiêu là Nhắn tin: tạo ad từ postId(s)
          body = {
            ...body,
            selectedPosts: minimalPosts, // để BE có context (title/url)
            postIds, // BE dùng postIds để tạo ad từ post
            messageDestination: "MESSENGER",
          };
        } else {
          // Các mục tiêu khác: giữ behavior cũ (gửi creative nếu cần)
          body = {
            ...body,
            selectedPosts: minimalPosts,
            postIds,
            images,
            contents,
            imageUrl: images[0] || previewImg,
          };
        }
      } else {
        // Single-case
        if (goal === "message") {
          body = {
            ...body,
            postId: id?.toString(),
            messageDestination: "MESSENGER",
          };
        } else {
          // Single & not message -> preserve previous intent:
          body = {
            ...body,
            ...(isMessage
              ? { imageUrl: firstPost?.url || previewImg, messageDestination: "MESSENGER" }
              : { postId: id?.toString() }),
          };
        }
      }

      // Thêm targeting nếu không dùng AI
      if (!aiTargeting) {
        body.gender = gender;
        body.ageRange = [age[0], age[1]];
        body.detailedTargeting = interests;
        body.geo_locations =
          locationMode === "nationwide" ? { countries: ["VN"] } : buildGeoLocationsPayload(locations);
      }

      // Gọi API tạo quảng cáo
      const res = await createAds(body).unwrap();

      // Hiển thị số ad theo số bài đang chọn (1 ad/post)
      const createdCount = isMulti ? minimalPosts.length : 1;
      message.success(`${t("ads.success")} (${createdCount} ad${createdCount > 1 ? "s" : ""})`);
      console.log("Ad Created:", res?.data ?? res);
      window.location.reload();
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.message || t("ads.error.generic");
      message.error(errorMessage);
      console.error("🛑 Create Ads Error:", err);
    }
  };


  return (
    <>
      <FullscreenLoader spinning={analysisLoading || creatingPost} />

      <Card
        style={{
          backgroundColor: "#070719",
          borderRadius: 16,
          padding: 24,
          color: "#e2e8f0",
          fontFamily: "Inter, sans-serif",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Row gutter={32}>
          {/* LEFT */}
          <Col xs={24} md={12}>
            <Title level={4} style={{ color: "#e2e8f0" }}>
              {t("ads.create_ads")}
            </Title>

            <div style={{ marginBottom: 12 }}>
              <label style={{ color: "#e2e8f0" }}>📛 {t("ads.campaign_name")}</label>
              <Input
                value={campaignName}
                onChange={(e) => {
                  setCampaignName(e.target.value);
                  if (!isCampaignEdited) setIsCampaignEdited(true);
                }}
                placeholder={t("ads.placeholder.campaign_name")}
                style={{ backgroundColor: "#1e293b", color: "#e2e8f0", borderColor: "#334155" }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ color: "#e2e8f0" }}>🎯 {t("ads.ads_goal")}</label>
              <div id="goal-group">
                <Radio.Group
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  style={{ display: "flex", flexWrap: "wrap", gap: 8, width: "100%" }}
                >
                  {[
                    { value: "message", label: t("ads.goal.message") },
                    { value: "engagement", label: t("ads.goal.engagement") },
                    { value: "leads", label: t("ads.goal.leads") },
                    { value: "traffic", label: t("ads.goal.traffic") },
                  ].map((item) => {
                    const isSelected = goal === item.value;
                    return (
                      <Radio.Button
                        key={item.value}
                        value={item.value as any}
                        style={{
                          flex: "0 0 calc(23% - 8px)",
                          minWidth: 120,
                          textAlign: "center",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          height: "auto",
                          lineHeight: 1.2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#0f172a",
                          border: isSelected ? "1px solid #4cc0ff" : "1px solid #2a3446",
                          padding: "2px 8px",
                          margin: 2,
                          fontSize: 14,
                          color: "#ffffff",
                          fontWeight: 500,
                          cursor: "pointer",
                          boxShadow: isSelected ? "0 0 6px #4cc0ff" : "none",
                          borderRadius: 8,
                        }}
                      >
                        {item.label}
                      </Radio.Button>
                    );
                  })}
                </Radio.Group>
              </div>
            </div>

            {goal === "traffic" && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: "#e2e8f0" }}>📝 {t("ads.website_link")}</label>
                <Input.TextArea
                  rows={1}
                  value={urlWebsite}
                  onChange={(e) => setUrleWbsite(e.target.value)}
                  placeholder={t("ads.placeholder.website")}
                  style={{ backgroundColor: "#1e293b", color: "#e2e8f0", borderColor: "#334155" }}
                />
              </div>
            )}

            {!aiTargeting && (
              <>
                <br />
                <label style={{ color: "#e2e8f0" }}>🎯 Phạm vi quảng cáo</label>

                <Radio.Group
                  value={locationMode}
                  onChange={(e) => setLocationMode(e.target.value)}
                  style={{ display: "flex", gap: 8, width: "100%", flexWrap: "wrap" }}
                >
                  {[
                    { value: "nationwide", label: "🌏 Toàn quốc" },
                    { value: "custom", label: "📍 Theo vị trí" },
                  ].map((item) => {
                    const isSelected = locationMode === item.value;
                    return (
                      <Radio.Button
                        key={item.value}
                        value={item.value as any}
                        style={{
                          flex: "0 0 calc(25% - 8px)",
                          minWidth: 140,
                          textAlign: "center",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          height: "auto",
                          lineHeight: 1.2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#0f172a",
                          border: isSelected ? "1px solid #4cc0ff" : "1px solid #2a3446",
                          padding: "6px 12px",
                          margin: 2,
                          fontSize: 14,
                          color: "#ffffff",
                          fontWeight: 500,
                          cursor: "pointer",
                          boxShadow: isSelected ? "0 0 6px #4cc0ff" : "none",
                          borderRadius: 8,
                          transition: "all 0.2s ease",
                        }}
                      >
                        {item.label}
                      </Radio.Button>
                    );
                  })}
                </Radio.Group>

                {locationMode === "custom" && (
                  <div style={{ marginBottom: 12, marginTop: 8 }}>
                    <LocationSelector value={locations} onChange={setLocations} defaultCountryCode="VN" />
                  </div>
                )}

                <br />
                <div style={{ marginBottom: 12 }}>
                  <label style={{ color: "#e2e8f0" }}>🎯 {t("ads.detailed_targeting")}</label>
                  <Select
                    mode="multiple"
                    style={{
                      width: "100%",
                      backgroundColor: "#e2e8f0",
                      color: "#1e293b",
                      borderColor: "#334155",
                    }}
                    placeholder={t("ads.select_targeting_group")}
                    value={interests}
                    onChange={setInterests}
                    optionLabelProp="label"
                    dropdownStyle={{ backgroundColor: "#e2e8f0", color: "#1e293b" }}
                  >
                    {interests.map((value) => (
                      <Option key={value} value={value} label={t(value)}>
                        {t(value)}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ color: "#e2e8f0" }}>👤 Độ tuổi</label>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <Slider
                        range
                        min={13}
                        max={65}
                        value={age}
                        onChange={(val) => setAge(val as [number, number])}
                        tooltip={{ open: false }}
                      />
                    </div>
                    <div
                      style={{
                        width: 110,
                        textAlign: "right",
                        color: "#e2e8f0",
                        background: "#0f172a",
                        border: "1px solid #2a3446",
                        borderRadius: 8,
                        padding: "6px 10px",
                      }}
                    >
                      {age[0]} – {age[1]}
                    </div>
                  </div>
                </div>
              </>
            )}

            <Row gutter={12} style={{ marginBottom: 12 }}>
              <Col span={12}>
                <label style={{ color: "#e2e8f0" }}>📆 {t("ads.duration")}</label>
                <RangePicker
                  value={range}
                  onChange={(val) => setRange(val as [dayjs.Dayjs, dayjs.Dayjs])}
                  style={{ width: "100%", backgroundColor: "#1e293b", color: "#e2e8f0", borderColor: "#334155" }}
                />
              </Col>

              <style>{`
                .ant-input-number,
                .ant-input-number-input {
                  background-color: #1e293b;
                  color: #f8fafc;
                }
                .ant-input-number { border-color: #334155; }
                .ant-input-number:hover,
                .ant-input-number-focused {
                  border-color: #4cc0ff;
                  box-shadow: 0 0 0 2px rgba(76,192,255,0.15);
                }
              `}</style>

              <Col span={12}>
                <label style={{ color: "#f8fafc" }}>💰 Ngân sách hàng ngày (VNĐ)</label>
                <InputNumber
                  className="daily-budget-input"
                  value={budgetVnd}
                  onChange={(val) => setBudgetVnd((val ?? 0) as number)}
                  min={1000}
                  step={1000}
                  style={{ width: "100%", backgroundColor: "#1e293b", borderColor: "#334155" }}
                  formatter={(value) => {
                    if (value === undefined || value === null) return "";
                    const onlyDigits = String(value).replace(/[^\d]/g, "");
                    return onlyDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " ₫";
                  }}
                  parser={(val) => Number((val ?? "0").toString().replace(/[^\d]/g, ""))}
                  placeholder="Nhập số tiền VND, ví dụ 200000"
                />
                <style>{`
                  .daily-budget-input .ant-input-number-input { color: #ffffff !important; }
                  .daily-budget-input .ant-input-number-input::placeholder { color: #94a3b8 !important; }
                `}</style>
              </Col>
            </Row>

            <Button
              type="primary"
              block
              onClick={handlePublish}
              loading={creatingCase}
              style={{
                backgroundColor: "#0f172a",
                border: "1px solid #4cc0ff",
                borderRadius: 8,
                padding: "2px 8px",
                margin: 2,
                fontSize: 14,
                color: "#ffffff",
                fontWeight: 500,
                boxShadow: "0 0 6px #4cc0ff",
                cursor: "pointer",
              }}
            >
              {t("ads.publish")}
            </Button>
          </Col>

          {/* RIGHT - PREVIEW */}
          <Col xs={24} md={12}>
            <Card
              title={t("ads.preview")}
              bordered={false}
              extra={
                <Button
                  size="small"
                  onClick={() =>
                    analyzePostForTargeting(
                      isMulti ? combinedCaption : (postRecot?.caption ?? caption ?? ""),
                      previewImg
                    )
                  }
                  loading={analysisLoading || isTargeting}
                  icon={<ReloadOutlined />}
                  style={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #4cc0ff",
                    borderRadius: 8,
                    padding: "2px 8px",
                    margin: 2,
                    fontSize: 14,
                    color: "#ffffff",
                    fontWeight: 500,
                    boxShadow: "0 0 6px #4cc0ff",
                    cursor: "pointer",
                  }}
                >
                  Phân tích lại
                </Button>
              }
              style={{ backgroundColor: "#070719", borderRadius: 12, marginTop: 0, color: "#e2e8f0" }}
              headStyle={{ color: "#e2e8f0", borderBottom: "1px solid #334155" }}
            >
              <div style={{ padding: 10 }}>
                <div
                  style={{
                    background: "#0f172a",
                    border: "1px solid #2a3446",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  {!isMulti ? (
                    <>
                      <a
                        href={previewPermalinkSingle}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "block" }}
                      >
                        <img
                          src={previewImg}
                          alt={previewAlt}
                          style={{ width: "100%", height: "auto", display: "block" }}
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "https://via.placeholder.com/720x720?text=Image+not+available";
                          }}
                        />
                      </a>

                      <div style={{ padding: 12 }}>
                        <Typography.Paragraph style={{ margin: 0, color: "#e2e8f0" }}>
                          {previewCaptionSingle}
                        </Typography.Paragraph>

                        {previewPermalinkSingle && (
                          <Button
                            type="link"
                            href={previewPermalinkSingle}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ paddingLeft: 0 }}
                          >
                            Xem trên Facebook
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        padding: 12,
                        maxHeight: 560,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      {selectedPosts.slice(0, 15).map((p) => {
                        const imgSrc = p.media?.props?.src ?? p.url ?? "https://via.placeholder.com/720x720?text=Image";
                        const cap = (p.caption || "").toString();
                        const shortCap = cap.length > 180 ? cap.slice(0, 180) + "…" : cap;
                        const permalink = p.permalink_url || undefined;
                        const react = p.react ?? p.reactions ?? null;
                        const comment = p.comment ?? p.comments ?? null;
                        const share = p.share ?? p.shares ?? null;
                        const checked = activeIds.includes(p.id);
                        const hasCTA = postHasMessageCTA(p);

                        return (
                          <div
                            key={p.id}
                            data-row="multi-preview-row"
                            style={{
                              background: "#0b1020",
                              border: "1px solid #1e293b",
                              borderRadius: 10,
                              padding: 10,
                              display: "grid",
                              gridTemplateColumns: "24px 180px 1fr",
                              gap: 12,
                              alignItems: "stretch",
                              opacity: checked ? 1 : 0.45,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", paddingTop: 4 }}>
                              <Checkbox
                                checked={checked}
                                onChange={() => toggleOne(p.id)}
                              />
                            </div>

                            <a
                              href={permalink}
                              target={permalink ? "_blank" : undefined}
                              rel={permalink ? "noopener noreferrer" : undefined}
                              style={{ display: "block" }}
                            >
                              <img
                                src={imgSrc}
                                alt="post"
                                style={{
                                  width: "100%",
                                  height: 160,
                                  objectFit: "cover",
                                  borderRadius: 8,
                                  display: "block",
                                }}
                                loading="lazy"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src =
                                    "https://via.placeholder.com/720x720?text=Image+not+available";
                                }}
                              />
                            </a>

                            <div style={{ display: "flex", flexDirection: "column", minHeight: 160 }}>
                              <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
                                <Typography.Paragraph
                                  style={{
                                    margin: 0,
                                    color: "#e2e8f0",
                                    whiteSpace: "pre-wrap",
                                    lineHeight: 1.45,
                                    flex: 1,
                                  }}
                                >
                                  {shortCap || "(No content)"}
                                </Typography.Paragraph>

                                {goal === "message" && !hasCTA && (
                                  <div style={{ marginLeft: 8 }}>
                                    <Tag color="red" style={{ borderRadius: 6, padding: "4px 8px" }}>
                                      Chưa gắn hành động Nhắn tin
                                    </Tag>
                                  </div>
                                )}
                              </div>

                              {(react || comment || share) && (
                                <div
                                  style={{
                                    marginTop: 8,
                                    display: "flex",
                                    gap: 12,
                                    flexWrap: "wrap",
                                    color: "#94a3b8",
                                    fontSize: 12,
                                  }}
                                >
                                  {react != null && <span>👍 {react}</span>}
                                  {comment != null && <span>💬 {comment}</span>}
                                  {share != null && <span>🔁 {share}</span>}
                                </div>
                              )}

                              <div style={{ marginTop: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                                {permalink && (
                                  <Button
                                    type="link"
                                    href={permalink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ paddingLeft: 0 }}
                                  >
                                    Xem bài viết
                                  </Button>
                                )}
                                <Button
                                  size="small"
                                  onClick={() => toggleOne(p.id)}
                                  style={{
                                    background: checked ? "#1f2937" : "#111827",
                                    border: "1px solid #2a3446",
                                    color: "#e2e8f0",
                                    borderRadius: 6,
                                    height: 26,
                                  }}
                                >
                                  {checked ? "Bỏ chọn" : "Chọn lại"}
                                </Button>
                              </div>
                            </div>

                            <style>{`
                              @media (max-width: 768px) {
                                [data-row="multi-preview-row"] {
                                  grid-template-columns: 24px 1fr !important;
                                }
                              }
                            `}</style>
                          </div>
                        );
                      })}

                      {selectedPosts.length > 15 && (
                        <div
                          style={{
                            marginTop: 2,
                            color: "#94a3b8",
                            fontSize: 12,
                            textAlign: "center",
                          }}
                        >
                          +{selectedPosts.length - 15} bài nữa…
                        </div>
                      )}

                      <div
                        style={{
                          marginTop: 10,
                          padding: 10,
                          background: "#0f172a",
                          border: "1px dashed #2a3446",
                          borderRadius: 8,
                          color: "#cbd5e1",
                        }}
                      >
                        <b>Tổng hợp nội dung:</b> {combinedCaption}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default DetailAds;
