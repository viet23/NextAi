import React, { useEffect, useState } from "react";
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
} from "antd";
import dayjs from "dayjs";
import {
  useCreateAdsMutation,
  useCreateFacebookPostMutation,
  useDetailFacebookPostQuery,
} from "src/store/api/facebookApi";
import LocationPicker from "./location";
import { useTranslation } from "react-i18next";
import FullscreenLoader from "../FullscreenLoader";
import { useOpenaiTargetingMutation } from "src/store/api/openaiApi";

const { Option } = Select;
const { Title } = Typography;
const { RangePicker } = DatePicker;
const usdToVndRate = 25000;

interface AdsFormProps {
  id: string | null;
  postRecot: any;
  pageId: string | null;
}

const DetailAds: React.FC<AdsFormProps> = ({ id, postRecot, pageId }) => {
  // i18n
  const { t } = useTranslation();

  // Form state
  const [goal, setGoal] = useState<"message" | "engagement" | "leads" | "traffic">("message");
  const [caption, setCaption] = useState("");
  const [urlWebsite, setUrleWbsite] = useState<string | undefined>(undefined);
  const [aiTargeting, setAiTargeting] = useState(false);
  const [gender, setGender] = useState("all");
  const [age, setAge] = useState<[number, number]>([18, 65]);
  const [interests, setInterests] = useState<string[]>(["Sức khỏe"]);
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs(), dayjs().add(5, "day")]);
  const [language, setLanguage] = useState<string>("en");
  const [location, setLocation] = useState({ lat: 21.024277327355822, lng: 105.77426048583983 }); // Hà Nội
  const [radius, setRadius] = useState(16000); // 16km
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [targetingAI, setTargetingAI] = useState<any>({});
  const [budget, setBudget] = useState(2);
  const [campaignName, setCampaignName] = useState("Generated Campaign");
  const [locationMode, setLocationMode] = useState<"nationwide" | "custom">("nationwide");

  const postIdOnly = id?.split("_")[1];
  const isMessage = goal === "message";

  // API hooks
  const { data, isSuccess, isError } = useDetailFacebookPostQuery(id, { skip: !id });
  const [createPost, { isLoading: creatingPost }] = useCreateFacebookPostMutation();
  const [openaiTargeting, { isLoading: isTargeting }] = useOpenaiTargetingMutation();
  const [createAds, { isLoading: creatingCase }] = useCreateAdsMutation();

  // ---- Preview data (thay iframe) ----
  const previewImg =
    postRecot?.media?.props?.src ||
    postRecot?.url ||
    "https://via.placeholder.com/720x720?text=Image+not+available";

  const previewAlt = postRecot?.media?.props?.alt || "facebook post media";

  const previewCaption =
    postRecot?.caption ||
    caption ||
    "";

  const previewPermalink =
    postRecot?.permalink_url ||
    (pageId && postIdOnly ? `https://www.facebook.com/${pageId}/posts/${postIdOnly}` : undefined);

  // ---- Prompt cho AI ----
  const buildPrompt = (content: string, imageUrl: string) => `
Bạn là hệ thống phân tích Facebook post để xây dựng TARGETING cho Facebook Ads.
NHIỆM VỤ: Đọc "Content" và "Image URL", suy luận sản phẩm/chủ đề trong post và trả về DUY NHẤT MỘT MẢNG JSON.

YÊU CẦU BẮT BUỘC:
1) CHỈ TRẢ VỀ MẢNG JSON (không text, không chú thích, không \`\`\`json).
2) Mỗi phần tử trong mảng đại diện cho 1 cụm sản phẩm/chủ đề tìm thấy trong post.
3) Điền đầy đủ các trường theo SCHEMA sau. Nếu thiếu dữ liệu, để chuỗi rỗng hoặc mảng rỗng.
4) "keywordsForInterestSearch" dùng TIẾNG ANH để gọi Facebook Targeting Search API (type=adinterest).
5) "sampleTargetingJson" là OBJECT gợi ý body targeting (thay ID sau khi search), KHÔNG chứa text giải thích.

SCHEMA:
[
  {
    "product": "Tên sản phẩm/chủ đề (ví dụ: Samsung Galaxy S25 Edge 5G, Dầu xả hoa bưởi, Plum wine)",
    "signals": ["Các tín hiệu nổi bật trong content (tốc độ, 5G, organic, thảo dược, quà biếu... )"],
    "persona": {
      "age_min": 0,
      "age_max": 0,
      "genders": [0],
      "locations": ["VN"],
      "notes": "Mô tả ngắn về nhóm khách hàng (thu nhập, thói quen, bối cảnh mua... nếu suy luận được)"
    },
    "behaviors": [
      { "id": "6007101597783", "name": "Engaged Shoppers" }
    ],
    "keywordsForInterestSearch": [
      "Các từ khóa TIẾNG ANH để gọi /search?type=adinterest (vd: Samsung Galaxy, Smartphones, Hair care, Organic cosmetics, Plum wine, Alcoholic beverage)"
    ],
    "complianceNotes": "Lưu ý chính sách (vd: đồ uống có cồn → age_min >= 25)",
    "sampleTargetingJson": {
      "age_min": 0,
      "age_max": 0,
      "genders": [0],
      "geo_locations": { "countries": ["VN"] },
      "interests": [
        { "id": "ID_PLACEHOLDER_1", "name": "REPLACE_WITH_INTEREST_NAME_1" },
        { "id": "ID_PLACEHOLDER_2", "name": "REPLACE_WITH_INTEREST_NAME_2" }
      ],
      "behaviors": [
        { "id": "6007101597783", "name": "Engaged Shoppers" }
      ]
    }
  }
]

Content: ${content || ""}
Image URL: ${imageUrl || "Không có"}
`;

  // ---- Phân tích post để lấy targeting ----
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

      // Lưu lại bản phân tích + link preview (dùng permalink nếu có)
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

  // ---- Tải dữ liệu chi tiết / chạy AI nếu cần ----
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

  // ---- Tạo quảng cáo ----
  const handlePublish = async () => {
    try {
      if (goal === "traffic" && (!urlWebsite || urlWebsite.trim() === "")) {
        message.error("Please enter website link when selecting goal as 'Get more website visitors'");
        return;
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
        dailyBudget: Math.round(Number(budget) * usdToVndRate),
        targetingAI,
        ...(isMessage && {
          imageUrl: postRecot?.url || previewImg,
          messageDestination: "MESSENGER",
        }),
        ...(!isMessage && { postId: id?.toString() }),
      };

      if (!aiTargeting) {
        body.gender = gender;
        body.ageRange = [age[0], age[1]];
        body.location = location;
        body.radius = radius;
        body.detailedTargeting = interests;
      }

      const res = await createAds(body).unwrap();
      message.success(t("ads.success"));
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
      <FullscreenLoader spinning={analysisLoading} />

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
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder={t("ads.placeholder.campaign_name")}
                style={{
                  backgroundColor: "#1e293b",
                  color: "#e2e8f0",
                  borderColor: "#334155",
                }}
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
                    { value: "engagement", label: t("ads.goal.leads") },
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
                  style={{
                    backgroundColor: "#1e293b",
                    color: "#e2e8f0",
                    borderColor: "#334155",
                  }}
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
                  <div style={{ marginBottom: 12 }}>
                    <LocationPicker
                      location={location}
                      setLocation={setLocation}
                      radius={radius}
                      setRadius={setRadius}
                    />
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
              </>
            )}

            <Row gutter={12} style={{ marginBottom: 12 }}>
              <Col span={12}>
                <label style={{ color: "#e2e8f0" }}>📆 {t("ads.duration")}</label>
                <RangePicker
                  value={range}
                  onChange={(val) => setRange(val as [dayjs.Dayjs, dayjs.Dayjs])}
                  style={{
                    width: "100%",
                    backgroundColor: "#1e293b",
                    color: "#e2e8f0",
                    borderColor: "#334155",
                  }}
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
                <label style={{ color: "#f8fafc" }}>💰 {t("ads.daily_budget")}</label>
                <InputNumber
                  className="daily-budget-input"
                  value={budget}
                  onChange={(val) => setBudget(val ?? 0)}
                  min={1}
                  formatter={(value) => `$ ${value ?? ""}`}
                  style={{
                    width: "100%",
                    backgroundColor: "#1e293b",
                    borderColor: "#334155",
                  }}
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

          {/* RIGHT - PREVIEW KHÔNG DÙNG IFRAME */}
          <Col xs={24} md={12}>
            <Card
              title={t("ads.preview")}
              bordered={false}
              style={{
                backgroundColor: "#070719",
                borderRadius: 12,
                marginTop: 0,
                color: "#e2e8f0",
              }}
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
                  {/* Ảnh */}
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

                  {/* Caption */}
                  <div style={{ padding: 12 }}>
                    <Typography.Paragraph style={{ margin: 0, color: "#e2e8f0" }}>
                      {previewCaption}
                    </Typography.Paragraph>

                    {/* Link Xem trên Facebook */}
                    {previewPermalink && (
                      <Button
                        type="link"
                        href={previewPermalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ paddingLeft: 0 }}
                      >
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
