import React, { useCallback, useEffect, useState } from "react";
import {
  Typography,
  Select,
  Input,
  Button,
  Row,
  Col,
  Slider,
  Switch,
  DatePicker,
  InputNumber,
  message,
  Card,
  Radio,
  Modal,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useCreateAdsMutation } from "src/store/api/facebookApi";
import LocationPicker from "./location";
import { useTranslation } from "react-i18next";
import { useGetAnalysisQuery } from "src/store/api/ticketApi";
const { Option, OptGroup } = Select;

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const usdToVndRate = 25000;

const DETAILED_TARGETING_OPTIONS = [
  {
    category: "Nhân khẩu học",
    values: ["Học vấn", "Công việc", "Mối quan hệ", "Phụ huynh", "Sự kiện trong đời"],
  },
  {
    category: "Sở thích",
    values: ["Thời trang", "Công nghệ", "Ẩm thực", "Thể thao", "Sức khỏe", "Du lịch"],
  },
  {
    category: "Hành vi",
    values: ["Mua hàng online", "Dùng thiết bị iOS", "Người hay di chuyển"],
  },
];

const languages = [
  { label: "English (US)", value: "en" },
  { label: "English (UK)", value: "en-uk" },
  { label: "Français (France)", value: "fr" },
  { label: "Español (Spain)", value: "es" },
  { label: "Español (Latin America)", value: "es-la" },
  { label: "Italiano (Italian)", value: "it" },
  { label: "Português (Brazil)", value: "pt-br" },
  { label: "Português (Latin America)", value: "pt-la" },
  { label: "Deutsch (German)", value: "de" },
  { label: "Tiếng Việt (Vietnamese)", value: "vi" },
  { label: "العربية (Arabic)", value: "ar" },
  { label: "Čeština (Czech)", value: "cs" },
  { label: "Dansk (Danish)", value: "da" },
  { label: "Ελληνικά (Greek)", value: "el" },
  { label: "ภาษาไทย (Thai)", value: "th" },
  { label: "中文(台灣) (Chinese – Taiwan)", value: "zh-tw" },
  { label: "Magyar (Hungarian)", value: "hu" },
  { label: "Nederlands (Dutch)", value: "nl" },
  { label: "Norsk (Norwegian)", value: "no" },
  { label: "Polski (Polish)", value: "pl" },
  { label: "Română (Romanian)", value: "ro" },
  { label: "Русский (Russian)", value: "ru" },
  { label: "Suomi (Finnish)", value: "fi" },
  { label: "Svenska (Swedish)", value: "sv" },
  { label: "Türkçe (Turkish)", value: "tr" },
  { label: "Українська (Ukrainian)", value: "uk" },
  { label: "日本語 (Japanese)", value: "ja" },
  { label: "한국어 (Korean)", value: "ko" },
  { label: "עברית (Hebrew)", value: "he" },
];

interface AdsFormProps {
  id: string | null;
  pageId: string | null;
}

const DetailAds: React.FC<AdsFormProps> = ({ id, pageId }) => {
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

  const iframeSrc = `https://www.facebook.com/plugins/post.php?href=https://www.facebook.com/${pageId}/posts/${postIdOnly}&show_text=true&width=500`;

  const [budget, setBudget] = useState(2);
  const [campaignName, setCampaignName] = useState("Generated Campaign");
  const [createAds, { isLoading: creatingCase }] = useCreateAdsMutation();
  const [analysisOpen, setAnalysisOpen] = useState(false);

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
        postId: id?.toString(),
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
      // ✅ Nếu có message cụ thể từ backend thì hiện ra
      const errorMessage = err?.data?.message || err?.message || t("ads.error.generic");
      message.error(errorMessage);
      console.error("🛑 Create Ads Error:", err);
    }
  };
  const [locationMode, setLocationMode] = useState("nationwide");




  useEffect(() => {
    // Gọi ChatGPT nếu có urlPage
    if (analysisData?.targeting) {
      setInterests(analysisData?.targeting);
    }

  }, [analysisData?.targeting]);



  return (
    <Card
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
              }}
            />
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
                        flex: "0 0 calc(23% - 8px)",   // 4 nút / 1 hàng khi đủ rộng
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

          {goal === "leads" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ color: "#e2e8f0" }}>🌐 {t("ads.form_language")}</label>
              <Select
                value={language}
                onChange={setLanguage}
                style={{
                  width: "100%",
                  backgroundColor: "#1e293b",
                  color: "#e2e8f0",
                  borderColor: "#334155"
                }}
                showSearch
                optionFilterProp="label"
                dropdownStyle={{ backgroundColor: "#1e293b", color: "#e2e8f0" }}
              >
                {languages.map(lang => (
                  <Option key={lang.value} value={lang.value} label={lang.label}>
                    {lang.label}
                  </Option>
                ))}
              </Select>
            </div>
          )}

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
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={{ color: "#e2e8f0" }}>{t("ads.audience")}</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#e2e8f0" }}>👥 {t("ads.ai_targeting")}</span>
              {/* <Switch checked={aiTargeting} onChange={setAiTargeting} /> */}
            </div>
          </div>

          <Paragraph type="secondary" style={{ margin: "4px 0 12px", color: "#94a3b8" }}>
            {t("ads.ai_targeting_note")}
          </Paragraph>

          {!aiTargeting && (
            <>
              <Row gutter={12} style={{ marginBottom: 12 }}>
                <Col span={12}>
                  <label style={{ color: "#e2e8f0" }}>{t("ads.gender")}</label>
                  <Select
                    value={gender}
                    onChange={setGender}
                    style={{
                      width: "100%",
                      backgroundColor: "#e2e8f0",
                      color: "#1e293b",
                      borderColor: "#334155"
                    }}
                    dropdownStyle={{ backgroundColor: "#e2e8f0", color: "#1e293b" }}
                  >
                    <Select.Option value="all">{t("ads.gender_all")}</Select.Option>
                    <Select.Option value="male">{t("ads.gender_male")}</Select.Option>
                    <Select.Option value="female">{t("ads.gender_female")}</Select.Option>
                  </Select>
                </Col>
                <Col span={12}>
                  <label style={{ color: "#e2e8f0" }}>{t("ads.age")}</label>
                  <Slider
                    range
                    value={age}
                    onChange={val => setAge(val as [number, number])}
                    min={13}
                    max={65}
                  />
                </Col>
              </Row>
              <br />

               <label style={{ color: "#e2e8f0" }}>🎯 Phạm vi quảng cáo</label>

              <Radio.Group
                value={locationMode}
                onChange={(e) => setLocationMode(e.target.value)}
                style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "12px",
                  color: "#fff",
                }}
              >
                <Radio value="nationwide" style={{ color: "#fff" }}>
                  🌏 Toàn quốc
                </Radio>
                <Radio value="custom" style={{ color: "#fff" }}>
                  📍 Theo vị trí
                </Radio>
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
                    borderColor: "#334155"
                  }}
                  placeholder={t("ads.select_targeting_group")}
                  value={interests}
                  onChange={setInterests}
                  optionLabelProp="label"
                  dropdownStyle={{ backgroundColor: "#e2e8f0", color: "#1e293b" }}
                >
                  {DETAILED_TARGETING_OPTIONS.map(group => (
                    <OptGroup key={group.category} label={t(group.category)}>
                      {group.values.map(value => (
                        <Option key={value} value={value} label={t(value)}>
                          {t(value)}
                        </Option>
                      ))}
                    </OptGroup>
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
                }}
              />
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
                }}
              />

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
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              />
            </div>

            {/* Nút phân tích bài viết ngay dưới iframe */}
            <div style={{ textAlign: "right", padding: "10px" }}>
              <button
                style={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #4cc0ff",
                  borderRadius: "8px",
                  padding: "2px 8px",
                  margin: "2px",
                  fontSize: "20px",
                  color: "#ffffff",
                  fontWeight: 500,
                  boxShadow: "0 0 6px #4cc0ff",
                  cursor: "pointer",
                }}
                onClick={() => setAnalysisOpen(true)}
              >
                📊 Phân tích bài viết
              </button>

            </div>
          </Card>
        </Col>


        {/* Modal phân tích */}
        <Modal
          open={analysisOpen}
          centered
          title={
            <div style={{ textAlign: "center", width: "100%", fontSize: "20px", color: "#000102ff" }}>
              📊 Phân tích bài viết
            </div>
          }
          onCancel={() => setAnalysisOpen(false)}
          footer={null}
          width={820}
          styles={{
            body: { background: "#fff", padding: 0 },
            header: { background: "#fff", textAlign: "center", borderBottom: "1px solid #334155" }
          }}
        >
          <div
            style={{
              background: "#fff",
              color: "#010811ff",
              padding: "12px 16px 16px",
              borderRadius: "12px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {/* Header bảng */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 1fr 1.6fr",
                gap: "12px",
                alignItems: "center",
                position: "sticky",
                top: 0,
                background: "#fff",
                padding: "10px 12px",
                borderBottom: "1px solid #334155",
                fontWeight: 600,
                color: "#000205ff",
                zIndex: 1,
              }}
            >
              <div>Tiêu chí</div>
              <div>Đánh giá</div>
              <div>Điểm (Tối đa)</div>
              <div>Nhận xét gợi ý</div>
            </div>

            {/* Body bảng */}
            <div style={{ maxHeight: "460px", overflow: "auto", padding: "4px 12px 0" }}>
              {[
                "Từ khóa",
                "Số ký tự",
                "CTA",
                "Giọng văn / Tone",
                "Ngữ pháp / lỗi chính tả",
                "Tương thích landing page",
                "Màu sắc",
                "Độ sáng",
                "Tỷ lệ văn bản trên ảnh",
                "Khuôn mặt / Người",
                "Sản phẩm",
                "Kích thước / độ phân giải",
                "Match audience",
                "Lịch sử campaign / xu hướng"
              ].map((label, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr 1fr 1.6fr",
                    gap: "12px",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid #2a3446",
                    color: "#000000ff",
                  }}
                >
                  <div style={{ fontWeight: 600, color: "#000000ff" }}>{label}</div>
                  <div style={{ fontWeight: 500, color: "#000000ff" }}>Đánh giá</div>
                  <div style={{ fontWeight: 500, color: "#000000ff" }}>Điểm (Tối đa)</div>
                  <div style={{ fontWeight: 500, color: "#000000ff" }}>Nhận xét gợi ý</div>
                </div>
              ))}
            </div>

            {/* Footer ghi chú */}
            <div
              style={{
                marginTop: "12px",
                borderTop: "1px solid #334155",
                padding: "12px 12px 4px",
                color: "#000000ff",
              }}
            >
              <ul style={{ margin: "0 0 8px 18px" }}>
                <li>Text: 36/40 → 90% → đóng góp 40 × 0.9 = 36</li>
                <li>Image: 40/40 → 100% → đóng góp 40 × 1.0 = 40</li>
                <li>Performance: 17/20 → 85% → đóng góp 85 × 0.2 = 17</li>
              </ul>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #fff",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  color: "#000205ff",
                }}
              >
                <strong>
                  Final Score = 36 + 40 + 17 = 93 / 100 → Xuất sắc, có thể chạy và scale ngay.
                </strong>
              </div>
            </div>
          </div>
        </Modal>


      </Row>
    </Card>

  );
};

export default DetailAds;
