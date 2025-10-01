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

// 👉 mới
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
}

const DetailAds: React.FC<AdsFormProps> = ({ id, postRecot, pageId }) => {
  const { t } = useTranslation();

  // ----- STATES -----
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
  const [budgetVnd, setBudgetVnd] = useState<number>(100000); // ✅ ngân sách VNĐ
  const [locationMode, setLocationMode] = useState<"nationwide" | "custom">("nationwide");

  // NEW: số lượng quảng cáo cần tạo
  const [numAds, setNumAds] = useState<number>(1);

  // Theo dõi người dùng có sửa tên campaign thủ công không
  const [isCampaignEdited, setIsCampaignEdited] = useState(false);

  // 👉 NEW: nhiều vị trí
  const [locations, setLocations] = useState<SelectedLocation[]>([]);

  const postIdOnly = id?.split("_")[1];
  const isMessage = goal === "message";

  // ----- API hooks -----
  const { data, isSuccess, isError } = useDetailFacebookPostQuery(id, { skip: !id });
  const [createPost, { isLoading: creatingPost }] = useCreateFacebookPostMutation();
  const [openaiTargeting, { isLoading: isTargeting }] = useOpenaiTargetingMutation();
  const [createAds, { isLoading: creatingCase }] = useCreateAdsMutation();

  // ---- Preview data ----
  const previewImg =
    postRecot?.media?.props?.src ||
    postRecot?.url ||
    "https://via.placeholder.com/720x720?text=Image+not+available";

  const previewAlt = postRecot?.media?.props?.alt || "facebook post media";
  const previewCaption = postRecot?.caption || caption || "";
  const previewPermalink =
    postRecot?.permalink_url ||
    (pageId && postIdOnly ? `https://www.facebook.com/${pageId}/posts/${postIdOnly}` : undefined);

  // ---- Campaign name: auto kèm 100 ký tự đầu của caption ----
  const initialCampaignName = useMemo(() => {
    const base = "Campaign";
    const raw = (postRecot?.caption || "").toString().trim();
    if (!raw) return base;
    const snippet = raw.slice(0, 30);
    return `${base} - ${snippet}`;
  }, [postRecot?.caption]);

  const [campaignName, setCampaignName] = useState<string>(initialCampaignName);

  useEffect(() => {
    if (!isCampaignEdited) {
      setCampaignName(initialCampaignName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCampaignName]);

  // ---- Prompt & phân tích AI (giữ nguyên logic cũ) ----
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

      const urlPostForSaving = previewPermalink || imageUrl || "";
      await createPost({
        postId: id,
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
  }, [isSuccess, isError, data, postRecot]);

  // ---- helper: build geo_locations từ selections ----
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

    // nếu rỗng, mặc định quốc gia VN để không bị lỗi
    if (!Object.keys(geo_locations).length) {
      geo_locations.countries = ["VN"];
    }
    return geo_locations;
  }

  // ---- Publish ----
  const handlePublish = async () => {
    try {
      if (goal === "traffic" && (!urlWebsite || urlWebsite.trim() === "")) {
        message.error("Please enter website link when selecting goal as 'Get more website visitors'");
        return;
      }
      if (goal === "leads") setGoal("engagement");

      // validate numAds
      const sanitizedNumAds = Math.max(1, Math.min(Number(numAds || 1), 10));
      if (sanitizedNumAds !== numAds) {
        setNumAds(sanitizedNumAds);
      }

      const body: any = {
        goal,
        campaignName,
        caption,
        language,
        urlWebsite,
        aiTargeting: Boolean(aiTargeting),
        startTime: range[0].toISOString(),
        endTime: range[1].toISOString(),
        dailyBudget: Math.round(Number(budgetVnd)), // ✅ gửi VND trực tiếp
        targetingAI,
        numAds: sanitizedNumAds, // ✅ GỬI LÊN BACKEND
        ...(isMessage && {
          imageUrl: postRecot?.url || previewImg,
          messageDestination: "MESSENGER",
        }),
        ...(!isMessage && { postId: id?.toString() }),
      };

      if (!aiTargeting) {
        body.gender = gender;
        body.ageRange = [age[0], age[1]];
        body.detailedTargeting = interests;

        // 👉 geo_locations mới
        body.geo_locations =
          locationMode === "nationwide" ? { countries: ["VN"] } : buildGeoLocationsPayload(locations);
      }

      const res = await createAds(body).unwrap();

      // xử lý thông báo theo số lượng ads trả về
      const created = Array.isArray(res?.data) ? res.data.length : 1;
      message.success(`${t("ads.success")} (${created} ad${created > 1 ? "s" : ""})`);
      console.log("Ad Created:", res.data);
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
              <style>{`
                #goal-group .ant-radio-button-wrapper::before { display: none !important; }
                #goal-group .ant-radio-button-wrapper:not(:first-child) { border-left: 1px solid transparent !important; }
                #goal-group .ant-radio-button-wrapper,
                #goal-group .ant-radio-button-wrapper:first-child,
                #goal-group .ant-radio-button-wrapper:last-child { border-radius: 8px !important; }
              `}</style>

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

                {/* 👤 ĐỘ TUỔI - Range Slider */}
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
                  <br />

                  {/* 🆕 SỐ LƯỢNG QUẢNG CÁO */}
                  <div
                    style={{
                      marginBottom: 16,
                      padding: 12,
                      background: "#0b1020",
                      border: "1px solid #1e293b",
                      borderRadius: 12,
                    }}
                  >
                    <label style={{ color: "#f8fafc", fontWeight: 600, marginBottom: 8, display: "block" }}>
                      🆕 Số lượng quảng cáo (1–10)
                    </label>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>
                      Chọn số lượng quảng cáo để A/B test
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <Button
                          key={n}
                          size="middle"
                          onClick={() => setNumAds(n)}
                          style={{
                            width: 40,
                            height: 40,
                            background: numAds === n ? "#16a34a" : "#0f172a",
                            color: numAds === n ? "#fff" : "#e2e8f0",
                            border: numAds === n ? "1px solid #16a34a" : "1px solid #2a3446",
                            borderRadius: 8,
                            fontWeight: 600,
                            transition: "all 0.2s ease",
                          }}
                        >
                          {n}
                        </Button>
                      ))}
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
                {/* 💰 NGÂN SÁCH HÀNG NGÀY (VNĐ) */}
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
                    analyzePostForTargeting(postRecot?.caption ?? caption ?? "", previewImg)
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
                  <a
                    href={previewPermalink}
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
                      {previewCaption}
                    </Typography.Paragraph>

                    {previewPermalink && (
                      <Button type="link" href={previewPermalink} target="_blank" rel="noopener noreferrer" style={{ paddingLeft: 0 }}>
                        Xem trên Facebook
                      </Button>
                    )}
                  </div>
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
