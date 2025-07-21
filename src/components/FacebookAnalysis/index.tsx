import React, { useEffect, useState } from "react";
import { Layout, Input, Button, Typography, Card, message } from "antd";
import { useCreateAnalysisMutation, useGetAnalysisQuery } from "src/store/api/ticketApi";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import AutoPostModal from "../AutoPostModal";
import { DatePicker, Progress, Row, Col } from "antd";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;



const styles = {
  container: {
    minHeight: "100vh",
    background: "#fff",
    padding: 24,
  },
  inputSection: {
    maxWidth: 1000,
    margin: "0 auto",
    marginBottom: 24,
    padding: "0 16px",
  },
  twoColumns: {
    display: "flex",
    gap: 24,
    flexWrap: "wrap" as "wrap",
    justifyContent: "center",
    padding: "0 16px",
  },
  column: {
    flex: 1,
    minWidth: 320, // phù hợp cả iPhone chiều ngang
    maxWidth: 600,
  },
};

const FacebookPageAnalysis = () => {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [analysis, setAnalysis] = useState({
    overview: "",
    products: "",
    engagement: "",
    strategy: "",
  });

  const [createAnalysis, { isLoading: createAnaly }] = useCreateAnalysisMutation();
  const [showModal, setShowModal] = useState(false);
  const [channelPlan, setChannelPlan] = useState("");
  const [loading, setLoading] = useState(false);

  // Gọi API ngay khi component render
  const { data, isSuccess } = useGetAnalysisQuery({});

  // Khi có dữ liệu, cập nhật vào state
  useEffect(() => {
    if (isSuccess && data) {
      setUrl(data.urlPage || "");
      setAnalysis({
        overview: data.analysis?.overview || "",
        products: data.analysis?.products || "",
        engagement: data.analysis?.engagement || "",
        strategy: data.analysis?.strategy || "",
      });
      setChannelPlan(data.channelPlan || "");
    }
  }, [data, isSuccess]);

  const getChannelPlan = async (rawAnalysis: string) => {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "user",
              content: `
Đây là phân tích nội dung một Fanpage Facebook:

${rawAnalysis}

Hãy đề xuất kế hoạch phát triển kênh Facebook Page này, gồm:
1. Mục tiêu kênh
2. Định vị nội dung gợi ý (tỷ lệ %)
3. Lịch đăng bài mẫu tuần
4. Gợi ý định dạng nội dung + Ý tưởng viral
(Trình bày rõ ràng theo bố cục 2 cột giống bản kế hoạch truyền thông)`,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || "";
      setChannelPlan(content);
    } catch (err) {
      console.error("❌ GPT channel development error:", err);
    }
  };

  const analyzeFacebookPage = async () => {
    if (!url) {
      message.warning("Please enter Facebook Page link.");
      return;
    }

    setLoading(true);
    setChannelPlan("");
    setAnalysis({
      overview: "",
      products: "",
      engagement: "",
      strategy: "",
    });

    try {
      // 1. Crawl dữ liệu từ page
      const crawlRes = await fetch(`${process.env.REACT_APP_URL}/analyze-facebook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const crawlData = await crawlRes.json();
      if (!crawlData.success) {
        message.error("Unable to get data from Facebook Page.");
        setLoading(false);
        return;
      }

      const { name, description, bodyPreview } = crawlData.data;

      // 2. Gửi GPT để phân tích thành 4 phần
      const prompt = `
Đây là nội dung của một Fanpage Facebook:

Tên page: ${name}
Mô tả: ${description}
Nội dung sơ lược: ${bodyPreview}

Hãy phân tích nội dung thành 4 phần:
1. THÔNG TIN CHUNG
2. SẢN PHẨM/DỊCH VỤ
3. TƯƠNG TÁC KHÁCH HÀNG
4. CHIẾN LƯỢC TRUYỀN THÔNG
`;

      const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      const gptData = await gptRes.json();
      const content = gptData?.choices?.[0]?.message?.content;

      if (content) {
        const sections = content.split(/\n{2,}/);
        const result = {
          overview: sections.find((s: string) => s.toLowerCase().includes("thông tin chung")) || "",
          products: sections.find((s: string) => s.toLowerCase().includes("sản phẩm")) || "",
          engagement: sections.find((s: string) => s.toLowerCase().includes("tương tác")) || "",
          strategy: sections.find((s: string) => s.toLowerCase().includes("chiến lược")) || "",
        };
        setAnalysis(result);

        // 3. Gửi GPT tiếp để đề xuất phát triển kênh
        const rawAnalysis = `
THÔNG TIN CHUNG: ${result.overview}
SẢN PHẨM/DỊCH VỤ: ${result.products}
TƯƠNG TÁC KHÁCH HÀNG: ${result.engagement}
CHIẾN LƯỢC TRUYỀN THÔNG: ${result.strategy}
`;
        await getChannelPlan(rawAnalysis);
        saveAnalyzeFacebookPage();
      } else {
        message.error("GPT cannot parse the content.");
      }
    } catch (err) {
      console.error("❌ Whole process error:", err);
      message.error("An error occurred while parsing.");
    } finally {
      setLoading(false);
    }
  };

  /////
  const saveAnalyzeFacebookPage = async () => {
    if (!url) {
      message.warning("Please enter Facebook Page link.");
      return;
    }
    if (!analysis) {
      message.warning("No information yet Facebook Page Analysis.");
      return;
    }
    if (!channelPlan) {
      message.warning("No information yet Suggested Facebook Page Channel.");
      return;
    }
    try {
      const body = { analysis, channelPlan, urlPage: url };
      await createAnalysis(body).unwrap();
    } catch (err) {
      console.error("❌ Whole process error:", err);
      message.error("An error occurred while parsing.");
    } finally {
      setLoading(false);
    }
  };

  const dataChart = [
    { name: "01/07", views: 0 },
    { name: "02/07", views: 5 },
    { name: "03/07", views: 10 },
    { name: "04/07", views: 20 },
    { name: "05/07", views: 25 },
    { name: "06/07", views: 30 },
    { name: "07/07", views: 40 },
  ];

  const percentageFollow = 0;
  const percentageContact = 0;

  return (
    <>
      <Helmet>
        <title>All One Ads – Phân tích fanpage & đề xuất phát triển kênh</title>
        <meta
          property="og:title"
          content="All One Ads – AI analyzes and suggests fanpage content"
        />
        <meta
          property="og:description"
          content="Automatically analyze fanpage and suggest content development plans and communication strategies in a professional style."
        />
        <meta property="og:image" content="https://alloneads.com/og-image.png" />
        <meta property="og:url" content="https://alloneads.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="All One Ads" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="All One Ads – Analyze & recommend fanpage channels using AI"
        />
        <meta
          name="twitter:description"
          content="Optimize fanpage easily with AI: analysis - strategy - posting schedule - viral ideas."
        />
        <meta name="twitter:image" content="https://alloneads.com/og-image.png" />
      </Helmet>
      <Layout style={{ minHeight: "100vh", background: "#0D0F1A" }}>
        <Content style={{ padding: 24, color: "#F1F5F9" }}>

          {/* Modal hiển thị khi click */}
          <AutoPostModal visible={showModal} onClose={() => setShowModal(false)} />

          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h3 style={{ color: "#F8FAFC", marginBottom: 4 }}>
              {t("facebook_analysis.title")} {/* Phân tích Facebook */}
            </h3>
            <p style={{ color: "#94A3B8", fontSize: 14 }}>
              {t("facebook_analysis.subtitle")} {/* Khám phá trang Facebook của bạn */}
            </p>
          </div>

          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center", // căn giữa toàn khối
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                maxWidth: 800, // ✅ Thu gọn chiều ngang tại đây
                width: "100%",
              }}
            >
              <Input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={t("facebook_analysis.enter_page_link")}
                style={{
                  flex: 1,
                  background: "#1E293B",
                  border: "1px solid #334155",
                  color: "#F1F5F9",
                  height: 40,
                }}
              />

              <Button
                style={{
                  background: "transparent",
                  border: "1px solid #3B82F6",
                  color: "#E0F2FE",
                  borderRadius: 6,
                  height: 40,
                  padding: "0 16px",
                  whiteSpace: "nowrap",
                  boxShadow: "0 0 6px #3B82F6",
                }}
                type="default"
                loading={loading}
                onClick={analyzeFacebookPage}
              >
                {t("facebook_analysis.button_analyze")}
              </Button>
            </div>
          </div>
          <br />
          {/* <div
            style={styles.twoColumns}
          >
           
            <Row gutter={16} justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <DatePicker.RangePicker
                  style={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#CBD5E1",
                    borderRadius: 8,
                  }}
                />
              </Col>
              <Col>
                <Button
                  style={{
                    background: "linear-gradient(to right, #3b82f6, #60a5fa)",
                    border: "1px solid #3b82f6",
                    boxShadow: "0 0 8px #3b82f6",
                    color: "#fff",
                    padding: "6px 16px",
                    borderRadius: 6,
                    fontWeight: 350,
                  }}
                >
                  Kết nối page để xem thông tin
                </Button>
              </Col>
            </Row>

           
            <Row gutter={16}>
            
              <Col span={16}>
                <Card
                  style={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  <div style={{ marginBottom: 16, fontWeight: 600, color: "#E2E8F0" }}>Lượt xem</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={dataChart}>
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ background: "#0f172a", borderColor: "#334155" }} />
                      <Line type="monotone" dataKey="views" stroke="#6cc3ff" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>

                  <Row gutter={12} style={{ marginTop: 16 }}>
                    {[
                      "Tổng lượt xem",
                      "Trung bình",
                      "Xem tối thiểu 3 giây",
                      "Xem tối thiểu 1 giây",
                    ].map((label, idx) => (
                      <Col span={6} key={idx}>
                        <div
                          style={{
                            background: "#0f172a",
                            border: "1px solid #334155",
                            borderRadius: 8,
                            padding: "6px 10px",
                            textAlign: "center",
                            fontSize: 13,
                            color: "#CBD5E1",
                          }}
                        >
                          0<br />
                          {label}
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </Col>

            
              <Col span={8}>
                <Card
                  style={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  <Row gutter={[8, 16]}>
                    <Col span={12}>
                      
                      <div style={{ textAlign: "center" }}>
                        <div style={{ width: 70, margin: "0 auto" }}>
                          <CircularProgressbar
                            value={percentageFollow}
                            text={`${percentageFollow}%`}
                            styles={buildStyles({
                              textColor: "#fff",
                              pathColor: "#00d084",
                              trailColor: "#334155",
                            })}
                          />
                        </div>
                        <div style={{ fontSize: 13, marginTop: 8 }}>Tỉ lệ người theo dõi</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>● Theo dõi<br />● Không theo dõi</div>
                      </div>
                    </Col>

                    <Col span={12}>
                     
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                          Tuổi và giới tính
                        </div>
                        {["35-44", "25-34", "45-54", "54+"].map((age) => (
                          <div key={age} style={{ marginBottom: 6 }}>
                            <span style={{ fontSize: 11 }}>{age}</span>
                            <Progress percent={0} size="small" showInfo={false} />
                          </div>
                        ))}
                      </div>
                    </Col>

                    <Col span={12}>
                     
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Thành Phố</div>
                        {["Hà Nội", "HCM", "Hải Phòng", "Đà Nẵng"].map((c) => (
                          <div key={c} style={{ fontSize: 12, display: "flex", justifyContent: "space-between" }}>
                            <span>{c}</span>
                            <span>0%</span>
                          </div>
                        ))}
                      </div>
                    </Col>

                    <Col span={12}>
                   
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Tin nhắn</div>
                        <div style={{ fontSize: 12 }}>Tổng cộng: 0 tin</div>
                        <div style={{ fontSize: 12 }}>⏱ Trả lời TB: 0 giờ</div>
                        <div style={{ fontSize: 12 }}>✅ % chốt đơn: 0%</div>
                      </div>
                    </Col>

                    <Col span={24}>
                     
                      <div style={{ textAlign: "center" }}>
                        <div style={{ width: 70, margin: "0 auto" }}>
                          <CircularProgressbar
                            value={percentageContact}
                            text={`${percentageContact}%`}
                            styles={buildStyles({
                              textColor: "#fff",
                              pathColor: "#ff8c00",
                              trailColor: "#334155",
                            })}
                          />
                        </div>
                        <div style={{ fontSize: 13, marginTop: 8 }}>Liên hệ lại</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>● Tự nhiên<br />● Trả phí</div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </div> */}


          <div style={styles.twoColumns}>
            {/* Cột trái */}
            <div style={styles.column}>
              <Title level={4} style={{ color: "#E2E8F0" }}>📊 {t("facebook_analysis.section_page_analysis")}</Title>
              <Card style={{
                background: "#1E293B",
                border: "1px solid #334155",
                color: "#F1F5F9",
              }}
                bodyStyle={{ padding: 16 }}>
                <Title level={5} style={{ color: "#CBD5E1" }}>{t("facebook_analysis.general_info")}</Title>
                <TextArea
                  value={analysis.overview}
                  readOnly
                  autoSize
                  style={{ marginBottom: 12, whiteSpace: "pre-wrap" }}
                />

                <Title level={5} style={{ color: "#CBD5E1" }}>{t("facebook_analysis.products_services")}</Title>
                <TextArea
                  value={analysis.products}
                  readOnly
                  autoSize
                  style={{ marginBottom: 12, whiteSpace: "pre-wrap" }}
                />

                <Title level={5} style={{ color: "#CBD5E1" }}>{t("facebook_analysis.customer_engagement")}</Title>
                <TextArea
                  value={analysis.engagement}
                  readOnly
                  autoSize
                  style={{ marginBottom: 12, whiteSpace: "pre-wrap" }}
                />

                <Title level={5} style={{ color: "#CBD5E1" }}>{t("facebook_analysis.strategy")}</Title>
                <TextArea
                  value={analysis.strategy}
                  readOnly
                  autoSize
                  style={{ whiteSpace: "pre-wrap" }}
                />
              </Card>
            </div>

            {/* Cột phải */}
            <div style={styles.column}>
              <Title level={4} style={{ color: "#E2E8F0" }}>
                🚀 {t("facebook_analysis.section_channel_plan")}
              </Title>
              <Card
                style={{
                  background: "#1E293B",
                  border: "1px solid #334155",
                  color: "#F1F5F9",
                }}
                bodyStyle={{
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <TextArea
                  value={channelPlan}
                  rows={25}
                  readOnly
                  style={{
                    background: "#0F172A",
                    border: "1px solid #334155",
                    color: "#F8FAFC",
                  }}
                />

                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    background: "#0F172A",
                    border: "1px solid #3B82F6",
                    color: "#E0F2FE",
                    borderRadius: 6,
                    height: 30,
                    padding: "0 16px",
                    width: "100%", // ✅ full width như ảnh
                    boxShadow: "0 0 6px #3B82F6", // ✅ viền phát sáng
                    fontWeight: 500,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  {t("image.auto_post_setting")}
                </button>
              </Card>
            </div>

          </div>
        </Content>
      </Layout>
    </>
  );
};

export default FacebookPageAnalysis;
