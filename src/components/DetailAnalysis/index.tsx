import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { useTranslation } from "react-i18next";
import { useGetAnalysisQuery } from "src/store/api/ticketApi";
import TextArea from "antd/es/input/TextArea";
const { Option, OptGroup } = Select;

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const usdToVndRate = 25000;


interface AdsFormProps {
  id: string | null;
  pageId: string | null;
}

const DetailAnalysis: React.FC<AdsFormProps> = ({ id, pageId }) => {
  const { t } = useTranslation();

  // ====== State ======
  const [interests, setInterests] = useState<string[]>([]);
  const { data: analysisData } = useGetAnalysisQuery({});

  const [desc, setDesc] = useState<string>("");
  const [crawlLoading, setCrawlLoading] = useState<boolean>(false);
  const [crawlResult, setCrawlResult] = useState<{
    name?: string;
    description?: string;
    bodyPreview?: string;
  }>({});




  const postIdOnly = id?.split("_")[1] || "";
  const postUrl =
    pageId && postIdOnly ? `https://www.facebook.com/${pageId}/posts/${postIdOnly}` : "";

  // iFrame preview (encode để chắc chắn hiển thị)
  const iframeSrc = postUrl
    ? `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(postUrl)}&show_text=true&width=500`
    : "";

  // Lấy targeting (nếu hệ thống bạn có)
  useEffect(() => {
    if (analysisData?.targeting) setInterests(analysisData.targeting);
  }, [analysisData?.targeting]);

  // ====== Gọi API /analyze-facebook khi có id & pageId ======
  const callAnalyze = async () => {
    if (!postUrl) {
      message.error("Thiếu pageId hoặc postId.");
      return;
    }
    try {
      setCrawlLoading(true);
      const crawlRes = await fetch(`${process.env.REACT_APP_URL}/fb-post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: postUrl }),
      });
      const crawlData = await crawlRes.json();

      const payload = crawlData|| {};
      setCrawlResult(payload);

      // Đổ mô tả/preview vào textarea cho tiện phân tích
      const fallback =
        payload.description?.trim() ||
        payload.bodyPreview?.trim() ||
        "";
      setDesc(fallback);
      message.success("Đã lấy nội dung từ /fb-post.");
    } catch (err: any) {
      message.error(err?.message || "Lỗi khi gọi /fb-post");
    } finally {
      setCrawlLoading(false);
    }
  };

  useEffect(() => {
    if (postUrl) {
      callAnalyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postUrl]);


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
        </Col>


        <Col xs={24} md={12}>

          <div style={{ padding: 10 }}>
            <iframe
              src={iframeSrc}
              width="100%"
              height="500"
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
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: "#f8fafc" }}>
              Gợi ý mô tả cho bài viết
            </label>
            <TextArea
              rows={6}
              // value={description}
              // onChange={e => setDescription(e.target.value)}
              placeholder={t("image.enter_description")}
              className="image-textarea image-description-textarea"
            />
          </div>
        </Col>
      </Row>
    </Card>

  );
};

export default DetailAnalysis;
