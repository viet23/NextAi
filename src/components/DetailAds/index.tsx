import React, { useEffect, useState } from "react";
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
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useCreateAdsMutation } from "src/store/api/facebookApi";
import LocationPicker from "./location";
import { useTranslation } from "react-i18next";
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
  const [aiTargeting, setAiTargeting] = useState(true);
  const [gender, setGender] = useState("all");
  const [age, setAge] = useState<[number, number]>([18, 65]);
  const [interests, setInterests] = useState(["Sức khỏe"]);
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs(), dayjs().add(5, "day")]);
  const [language, setLanguage] = useState<string>("en");
  const [location, setLocation] = useState({ lat: 21.023556274318445, lng: 105.55110069580077 });
  const [radius, setRadius] = useState(16000); // 16km
  const postIdOnly = id?.split("_")[1];
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

  return (
    <Card
      style={{
        backgroundColor: "#0f172a",
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
            <Select
              value={goal}
              onChange={setGoal}
              style={{
                width: "100%",
                backgroundColor: "#1e293b",
                color: "#e2e8f0",
                borderColor: "#334155"
              }}
              dropdownStyle={{ backgroundColor: "#1e293b", color: "#e2e8f0" }}
            >
              <Select.Option value="message">{t("ads.goal.message")}</Select.Option>
              <Select.Option value="engagement">{t("ads.goal.engagement")}</Select.Option>
              <Select.Option value="leads">{t("ads.goal.leads")}</Select.Option>
              <Select.Option value="traffic">{t("ads.goal.traffic")}</Select.Option>
            </Select>
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
              <Switch checked={aiTargeting} onChange={setAiTargeting} />
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

              <div style={{ marginBottom: 12 }}>
                <LocationPicker
                  location={location}
                  setLocation={setLocation}
                  radius={radius}
                  setRadius={setRadius}
                />
              </div>

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
            <Col span={12}>
              <label style={{ color: "#e2e8f0" }}>💰 {t("ads.daily_budget")}</label>
              <InputNumber
                value={budget}
                onChange={val => setBudget(val!)}
                min={1}
                formatter={value => `$ ${value}`}
                style={{
                  width: "100%",
                  backgroundColor: "#1e293b",
                  color: "#e2e8f0",
                  borderColor: "#334155"
                }}
              />
            </Col>
          </Row>

          <Button
            type="primary"
            block
            onClick={handlePublish}
            loading={creatingCase}
            style={{
              backgroundColor: "#2563eb",
              borderColor: "#2563eb"
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
              backgroundColor: "#1e293b",
              borderRadius: 12,
              marginTop: 0,
              color: "#e2e8f0"
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
                  backgroundColor: "#e2e8f0"
                }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              />
            </div>
          </Card>
        </Col>
      </Row>
    </Card>

  );
};

export default DetailAds;
