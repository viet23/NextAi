import React, { useState } from "react";
import { Layout, Input, Button, Typography, Card, message } from "antd";

const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;

const FacebookPageAnalysis = () => {
  const [url, setUrl] = useState("");
  const [analysis, setAnalysis] = useState({
    overview: "",
    products: "",
    engagement: "",
    strategy: "",
  });
  const [channelPlan, setChannelPlan] = useState("");
  const [loading, setLoading] = useState(false);

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
Đây là phân tích nội dung một Fanpage nhà hàng:

${rawAnalysis}

Hãy đề xuất kế hoạch phát triển kênh Facebook Page cho nhà hàng này, gồm:
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
      console.error("❌ Lỗi GPT phát triển kênh:", err);
    }
  };

  const analyzeFacebookPage = async () => {
    if (!url) {
      message.warning("Vui lòng nhập đường link Facebook Page.");
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
        message.error("Không lấy được dữ liệu từ Facebook Page.");
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
          max_tokens: 700,
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
      } else {
        message.error("GPT không phân tích được nội dung.");
      }
    } catch (err) {
      console.error("❌ Lỗi toàn bộ quá trình:", err);
      message.error("Đã xảy ra lỗi khi phân tích.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#fff" }}>
      <Content style={{ padding: 24 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", marginBottom: 24 }}>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Nhập link Facebook Page"
            style={{ marginBottom: 16 }}
          />
          <Button style={{
            backgroundColor: "#D2E3FC",
            color: "#000", // màu chữ đen cho dễ đọc
            border: "1px solid #D2E3FC",
            borderRadius: 6,
          }} type="primary" loading={loading} onClick={analyzeFacebookPage}>
            Phân tích page & Gợi ý phát triển kênh
          </Button>
        </div>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
          {/* Cột trái */}
          <div style={{ flex: 1, minWidth: 400 }}>
            <Title level={4}>📊 Phân tích Page</Title>
            <Card>
              <Title level={5}>THÔNG TIN CHUNG</Title>
              <TextArea
                value={analysis.overview}
                readOnly
                autoSize
                style={{ marginBottom: 12, whiteSpace: "pre-wrap" }}
              />

              <Title level={5}>SẢN PHẨM / DỊCH VỤ</Title>
              <TextArea
                value={analysis.products}
                readOnly
                autoSize
                style={{ marginBottom: 12, whiteSpace: "pre-wrap" }}
              />

              <Title level={5}>TƯƠNG TÁC KHÁCH HÀNG</Title>
              <TextArea
                value={analysis.engagement}
                readOnly
                autoSize
                style={{ marginBottom: 12, whiteSpace: "pre-wrap" }}
              />

              <Title level={5}>CHIẾN LƯỢC TRUYỀN THÔNG</Title>
              <TextArea
                value={analysis.strategy}
                readOnly
                autoSize
                style={{ whiteSpace: "pre-wrap" }}
              />
            </Card>
          </div>


          {/* Cột phải */}
          <div style={{ flex: 1, minWidth: 400 }}>
            <Title level={4}>🚀 Đề xuất phát kênh Facebook Page</Title>
            <Card>
              <TextArea value={channelPlan} rows={28} readOnly />
            </Card>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default FacebookPageAnalysis;
