import React, { useEffect, useState } from "react";
import { Layout, Input, Button, Typography, Card, message } from "antd";
import { useCreateAnalysisMutation, useGetAnalysisQuery } from "src/store/api/ticketApi";
import { Helmet } from "react-helmet";

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
  const [url, setUrl] = useState("");
  const [analysis, setAnalysis] = useState({
    overview: "",
    products: "",
    engagement: "",
    strategy: "",
  });

  const [createAnalysis, { isLoading: createAnaly }] = useCreateAnalysisMutation();

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
        saveAnalyzeFacebookPage()
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

  return (
      <><Helmet>
      <title>All One Ads – Phân tích fanpage & đề xuất phát triển kênh</title>
      <meta property="og:title" content="All One Ads – AI analyzes and suggests fanpage content" />
      <meta property="og:description" content="Automatically analyze fanpage and suggest content development plans and communication strategies in a professional style." />
      <meta property="og:image" content="https://alloneads.com/og-image.png" />
      <meta property="og:url" content="https://alloneads.com/" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="All One Ads" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="All One Ads – Analyze & recommend fanpage channels using AI" />
      <meta name="twitter:description" content="Optimize fanpage easily with AI: analysis - strategy - posting schedule - viral ideas." />
      <meta name="twitter:image" content="https://alloneads.com/og-image.png" />
    </Helmet><Layout style={{ minHeight: "100vh", background: "#fff" }}>
        <Content style={styles.container}>
          <div style={styles.inputSection}>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter the Facebook Page link"
              style={{ marginBottom: 16 }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <Button
                style={{
                  backgroundColor: "#D2E3FC",
                  color: "#000",
                  border: "1px solid #D2E3FC",
                  borderRadius: 6,
                  height: 40,
                  padding: "0 16px", // tạo khoảng đệm vừa đủ
                  whiteSpace: "nowrap", // không xuống dòng
                  width: "auto", // chiều ngang bám sát nội dung
                }}
                type="primary"
                loading={loading}
                onClick={analyzeFacebookPage}
              >
                Page Analysis & Channel Development Suggestions
              </Button>
            </div>
          </div>


          <div style={styles.twoColumns}>
            {/* Cột trái */}
            <div style={styles.column}>
              <Title level={4}>📊 Page Analysis</Title>
              <Card>
                <Title level={5}>GENERAL INFORMATION</Title>
                <TextArea
                  value={analysis.overview}
                  readOnly
                  autoSize
                  style={{ marginBottom: 12, whiteSpace: "pre-wrap" }} />

                <Title level={5}>PRODUCTS / SERVICES</Title>
                <TextArea
                  value={analysis.products}
                  readOnly
                  autoSize
                  style={{ marginBottom: 12, whiteSpace: "pre-wrap" }} />

                <Title level={5}>CUSTOMER INTERACTION</Title>
                <TextArea
                  value={analysis.engagement}
                  readOnly
                  autoSize
                  style={{ marginBottom: 12, whiteSpace: "pre-wrap" }} />

                <Title level={5}>COMMUNICATIONS STRATEGY</Title>
                <TextArea
                  value={analysis.strategy}
                  readOnly
                  autoSize
                  style={{ whiteSpace: "pre-wrap" }} />
              </Card>
            </div>

            {/* Cột phải */}
            <div style={styles.column}>
              <Title level={4}>🚀 Suggested Facebook Page Channel</Title>
              <Card>
                <TextArea value={channelPlan} rows={28} readOnly />
              </Card>
            </div>
          </div>
        </Content>
      </Layout></>
  );
};

export default FacebookPageAnalysis;
