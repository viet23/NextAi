import React, { useCallback, useEffect, useState } from "react";
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
  Modal,
  Spin,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useCreateAdsMutation } from "src/store/api/facebookApi";
import LocationPicker from "./location";
import { useTranslation } from "react-i18next";
import { useGetAnalysisQuery } from "src/store/api/ticketApi";
import FullscreenLoader from "../FullscreenLoader";
const { Option, OptGroup } = Select;

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const usdToVndRate = 25000;

interface AdsFormProps {
  id: string | null;
  postRecot: any;
  pageId: string | null;
}

const DetailAds: React.FC<AdsFormProps> = ({ id, postRecot, pageId }) => {
  // Form state
  const { t } = useTranslation();
  const [goal, setGoal] = useState("message");
  const [caption, setCaption] = useState("");
  const [urlWebsite, setUrleWbsite] = useState<string | undefined>(undefined);
  const [aiTargeting, setAiTargeting] = useState(false);
  const [gender, setGender] = useState("all");
  const [age, setAge] = useState<[number, number]>([18, 65]);
  const [interests, setInterests] = useState(["Sức khỏe"]);
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs(), dayjs().add(5, "day")]);
  const [language, setLanguage] = useState<string>("en");
  const [location, setLocation] = useState({ lat: 21.024277327355822, lng: 105.77426048583983 }); // Default to Hanoi, Vietnam
  const [radius, setRadius] = useState(16000); // 16km
  const postIdOnly = id?.split("_")[1];
  const { data: analysisData } = useGetAnalysisQuery({});
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [targetingAI, setTargetingAI] = useState({});
  const isMessage = goal === 'message'

  const iframeSrc = `https://www.facebook.com/plugins/post.php?href=https://www.facebook.com/${pageId}/posts/${postIdOnly}&show_text=true&width=500`;

  const [budget, setBudget] = useState(2);
  const [campaignName, setCampaignName] = useState("Generated Campaign");
  const [createAds, { isLoading: creatingCase }] = useCreateAdsMutation();

  const handlePublish = async () => {
    try {
      if (goal === "traffic" && (!urlWebsite || urlWebsite.trim() === "")) {
        message.error(
          "Please enter website link when selecting goal as 'Get more website visitors'"
        );
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
        // ---- CTM fields ----
        ...(isMessage && {
          imageUrl: postRecot.url,
          // optional:
          messageDestination: 'MESSENGER',           // hoặc 'WHATSAPP' | 'INSTAGRAM_DIRECT'
          // whatsappNumber: '84xxxxxxxxx',          // bật nếu dùng WHATSAPP
          // linkUrl: 'https://your-site.com',       // tuỳ chọn, mặc định fb.com
        }),
        // ---- postId chỉ cho non-MESSAGE ----
        ...(!isMessage && { postId: id?.toString() }),
      }

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
      // ✅ Nếu có message cụ thể từ backend thì hiện ra
      const errorMessage = err?.data?.message || err?.message || t("ads.error.generic");
      message.error(errorMessage);
      console.error("🛑 Create Ads Error:", err);
    }
  };
  const [locationMode, setLocationMode] = useState("nationwide");



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


  async function analyzePostForTargeting(caption: string, url: string) {
    console.log(`utl----------`, url);

    const prompt = buildPrompt(caption, url);

    setAnalysisLoading(true);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4", // có thể đổi "gpt-4o-mini" để nhanh/rẻ hơn
          messages: [
            {
              role: "system",
              content:
                "Bạn là máy phân tích targeting. Chỉ trả về JSON HỢP LỆ (DUY NHẤT MỘT MẢNG). Không trả thêm ký tự nào khác."
            },
            { role: "user", content: prompt },
          ],
          temperature: 0,
          max_tokens: 2000,
        }),
      });

      const data = await response.json();
      let raw = data?.choices?.[0]?.message?.content ?? "[]";

      // Làm sạch mọi khả năng model trả về kèm ```json ... ```
      raw = raw.trim();
      if (raw.startsWith("```")) {
        raw = raw.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
      }

      // Một số model có thể trả xuống dạng object => ép về array
      let parsed;
      try {
        parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) parsed = [parsed];
      } catch {
        // Thử tìm JSON array trong chuỗi (phòng trường hợp có ký tự rác)
        const match = raw.match(/\[[\s\S]*\]$/);
        parsed = match ? JSON.parse(match[0]) : [];
      }

      // Đảm bảo đúng cấu trúc mảng
      if (!Array.isArray(parsed)) parsed = [];

      console.log(`parsed==========`, parsed);
      setInterests(parsed[0]?.keywordsForInterestSearch)
      setAge([parsed[0]?.persona.age_min, parsed[0]?.persona.age_max])
      setTargetingAI(parsed[0])

      setAnalysisLoading(false);
      return parsed;
    } catch (err) {
      console.error("OpenAI error:", err);
      setAnalysisLoading(false);
      return [];
    }
  }

  useEffect(() => {
    if (postRecot) analyzePostForTargeting(postRecot.caption, postRecot.url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postRecot]);




  // useEffect(() => {
  //   // Gọi ChatGPT nếu có urlPage
  //   if (analysisData?.targeting) {
  //     setInterests(analysisData?.targeting);
  //   }

  // }, [analysisData?.targeting]);



  return (
    <><FullscreenLoader
      spinning={analysisLoading} /><Card
        style={{
          backgroundColor: "#070719",
          borderRadius: 16,
          padding: 24,
          color: "#e2e8f0",
          fontFamily: "Inter, sans-serif"
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Row gutter={32}>
          <Col xs={24} md={12}>
            {/* {(analysisLoading) && <Spin size="small" />} */}
            <Title level={4} style={{ color: "#e2e8f0" }}>{t("ads.create_ads")}</Title>

            <div style={{ marginBottom: 12 }}>
              <label style={{ color: "#e2e8f0" }}>📛 {t("ads.campaign_name")}</label>
              <Input
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                placeholder={t("ads.placeholder.campaign_name")}
                style={{
                  backgroundColor: "#1e293b",
                  color: "#e2e8f0",
                  borderColor: "#334155"
                }} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ color: "#e2e8f0" }}>🎯 {t("ads.ads_goal")}</label>
              {/* CSS nhúng thẳng vào code để xoá gạch trắng & bo góc */}
              <style>
                {`
  /* Ẩn vạch ngăn giữa các Radio.Button của AntD */
  #goal-group .ant-radio-button-wrapper::before {
    display: none !important;
  }

  /* Không cần border-left mặc định khi các nút tách rời nhau */
  #goal-group .ant-radio-button-wrapper:not(:first-child) {
    border-left: 1px solid transparent !important;
  }

  /* Bo góc đồng đều cho mọi nút (AntD mặc định chỉ bo nút đầu/cuối) */
  #goal-group .ant-radio-button-wrapper,
  #goal-group .ant-radio-button-wrapper:first-child,
  #goal-group .ant-radio-button-wrapper:last-child {
    border-radius: 8px !important;
  }
`}
              </style>

              <div id="goal-group">
                <Radio.Group
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  style={{ display: "flex", flexWrap: "wrap", gap: "8px", width: "100%" }}
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
                        value={item.value}
                        style={{
                          flex: "0 0 calc(23% - 8px)", // 4 nút / 1 hàng khi đủ rộng
                          minWidth: "120px",
                          textAlign: "center",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          height: "auto",
                          lineHeight: "1.2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#0f172a",
                          border: isSelected ? "1px solid #4cc0ff" : "1px solid #2a3446",
                          padding: "2px 8px",
                          margin: "2px",
                          fontSize: "14px",
                          color: "#ffffff",
                          fontWeight: 500,
                          cursor: "pointer",
                          boxShadow: isSelected ? "0 0 6px #4cc0ff" : "none",
                          borderRadius: "8px",
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
                  onChange={e => setUrleWbsite(e.target.value)}
                  placeholder={t("ads.placeholder.website")}
                  style={{
                    backgroundColor: "#1e293b",
                    color: "#e2e8f0",
                    borderColor: "#334155"
                  }} />
              </div>
            )}

            {!aiTargeting && (
              <>
                <br />

                <label style={{ color: "#e2e8f0" }}>🎯 Phạm vi quảng cáo</label>

                <Radio.Group
                  value={locationMode}
                  onChange={(e) => setLocationMode(e.target.value)}
                  style={{
                    display: "flex",
                    gap: "8px",
                    width: "100%",
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    { value: "nationwide", label: "🌏 Toàn quốc" },
                    { value: "custom", label: "📍 Theo vị trí" },
                  ].map((item) => {
                    const isSelected = locationMode === item.value;
                    return (
                      <Radio.Button
                        key={item.value}
                        value={item.value}
                        style={{
                          flex: "0 0 calc(25% - 8px)", // 4 nút / 1 hàng nếu đủ rộng
                          minWidth: "140px",
                          textAlign: "center",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          height: "auto",
                          lineHeight: "1.2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#0f172a",
                          border: isSelected ? "1px solid #4cc0ff" : "1px solid #2a3446",
                          padding: "6px 12px",
                          margin: "2px",
                          fontSize: "14px",
                          color: "#ffffff",
                          fontWeight: 500,
                          cursor: "pointer",
                          boxShadow: isSelected ? "0 0 6px #4cc0ff" : "none",
                          borderRadius: "8px",
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
                      setRadius={setRadius} />
                  </div>
                )}

                <br />
                <div style={{ marginBottom: 12 }}>
                  <label style={{ color: "#e2e8f0" }}>
                    🎯 {t("ads.detailed_targeting")}
                  </label>
                  <Select
                    mode="multiple"
                    style={{
                      width: "100%",
                      backgroundColor: "#e2e8f0",
                      color: "#1e293b",
                      borderColor: "#334155"
                    }}
                    placeholder={t("ads.select_targeting_group")}
                    value={interests}
                    onChange={setInterests}
                    optionLabelProp="label"
                    dropdownStyle={{ backgroundColor: "#e2e8f0", color: "#1e293b" }}
                  >
                    {interests.map(value => (
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
                  onChange={val => setRange(val as [dayjs.Dayjs, dayjs.Dayjs])}
                  style={{
                    width: "100%",
                    backgroundColor: "#1e293b",
                    color: "#e2e8f0",
                    borderColor: "#334155"
                  }} />
              </Col>
              <style>{`
  /* Chỉ áp dụng cho InputNumber nằm trong Col Daily Budget */
  .ant-input-number,
  .ant-input-number-input {
    background-color: #1e293b;
    color: #f8fafc; /* chữ sáng hơn */
  }
  .ant-input-number {
    border-color: #334155;
  }
  .ant-input-number:hover,
  .ant-input-number-focused {
    border-color: #4cc0ff;
    box-shadow: 0 0 0 2px rgba(76,192,255,0.15);
  }
`}</style>

              <Col span={12}>
                <label style={{ color: "#f8fafc" }}>
                  💰 {t("ads.daily_budget")}
                </label>
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
                  }} />

                <style>{`
  .daily-budget-input .ant-input-number-input {
    color: #ffffff !important; /* chữ trắng sáng */
  }
  .daily-budget-input .ant-input-number-input::placeholder {
    color: #94a3b8 !important; /* placeholder sáng hơn */
  }
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
                borderRadius: "8px",
                padding: "2px 8px",
                margin: "2px",
                fontSize: "14px",
                color: "#ffffff",
                fontWeight: 500,
                boxShadow: "0 0 6px #4cc0ff",
                cursor: "pointer",
              }}
            >
              {t("ads.publish")}
            </Button>
          </Col>


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
                <iframe
                  src={iframeSrc}
                  width="100%"
                  height="570"
                  style={{
                    border: "none",
                    overflow: "hidden",
                    borderRadius: 8,
                    backgroundColor: "#e2e8f0",
                  }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" />
              </div>
            </Card>
          </Col>

        </Row>
      </Card></>

  );
};

export default DetailAds;
