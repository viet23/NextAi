import React, { useEffect, useMemo, useState } from "react";
import { Typography, Row, Col, message as AntMessage, Card, Modal, Spin } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useTranslation } from "react-i18next";
import { useGetAnalysisQuery } from "src/store/api/ticketApi";
import FullscreenLoader from "../FullscreenLoader";

const { Title } = Typography;

interface AdsFormProps {
  id: string | null;
  postRecot:any
  pageId: string | null;
}

type ReviewRow = {
  "Tiêu chí": string;
  "Đánh giá": string;
  "Điểm (tối đa)": string; // để an toàn khi model trả "8/10"
  "Nhận xét & Gợi ý": string;
};

const DetailAnalysis: React.FC<AdsFormProps> = ({ id,postRecot, pageId }) => {
  const { t } = useTranslation();

  const [interests, setInterests] = useState<string[]>([]);
  const { data: analysisData } = useGetAnalysisQuery({});
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ReviewRow[]>([]);
  const [descDraft, setDescDraft] = useState<string>("");

  const postIdOnly = id?.split("_")[1] || "";
  const postUrl =
    pageId && postIdOnly ? `https://www.facebook.com/${pageId}/posts/${postIdOnly}` : "";

  const iframeSrc = postUrl
    ? `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(postUrl)}&show_text=true&width=500`
    : "";

  useEffect(() => {
    if (analysisData?.targeting) setInterests(analysisData.targeting);
  }, [analysisData?.targeting]);

  // ========= HÀM PHỤ: Tóm tắt gợi ý từ bảng điểm để feed cho prompt viết lại
  const buildSuggestionSummary = (rows: ReviewRow[]) => {
    const pick = (name: string) =>
      rows.find(r => r["Tiêu chí"].toLowerCase().includes(name.toLowerCase()));
    const getNote = (name: string) =>
      rows
        .filter(r => r["Tiêu chí"].toLowerCase().includes(name.toLowerCase()))
        .map(r => r["Nhận xét & Gợi ý"])
        .filter(Boolean)
        .join(" | ");

    return {
      keyword: getNote("Từ khóa"),
      length: getNote("Số ký tự"),
      cta: getNote("CTA"),
      tone: getNote("Giọng văn"),
      grammar: getNote("Ngữ pháp"),
      match: getNote("landing"),
      imageTips: [
        getNote("Màu sắc"),
        getNote("Độ sáng"),
        getNote("Text ratio"),
        getNote("Khuôn mặt"),
        getNote("Sản phẩm"),
      ].filter(Boolean).join(" | "),
      final: (pick("Final Score")?.["Nhận xét & Gợi ý"] || "").trim()
    };
  };

  // ========= GỌI OPENAI VIẾT LẠI CONTENT THEO GỢI Ý
  const callOpenAIRewrite = async (
    fallback:any,
    rows: ReviewRow[]
  ) => {
    try {
      setRewriteLoading(true);

      // tự động lấy vài keyword từ sở thích + fallback
      const kw = Array.from(new Set([...(interests || []).slice(0, 5), "Best Mall", "thực phẩm chức năng", "huyết áp"]))
        .filter(Boolean)
        .join(", ");

      const s = buildSuggestionSummary(rows);

      const rewritePrompt = `
Bạn là copywriter quảng cáo Facebook nói tiếng Việt.
Nhiệm vụ: dựa trên bài viết gốc và các gợi ý phân tích, hãy VIẾT LẠI một nội dung mới, sẵn sàng để đăng, ngắn gọn – súc tích – thuyết phục.

YÊU CẦU ĐẦU RA:
- Ngôn ngữ: tiếng Việt.
- Có tiêu đề/hook 1 dòng ở đầu (<= 40 ký tự) và nên chứa từ khóa chính.
- Đoạn nội dung chính ~80–150 ký tự (có thể dài hơn nếu hợp lý, nhưng ưu tiên súc tích cho feed).
- Chỉ 1 CTA rõ ràng đặt ở cuối (ví dụ: "Tham gia group để nhận hướng dẫn", "Đăng ký tư vấn", hoặc hành động phù hợp).
- Đưa từ khóa vào 1–2 câu đầu và tiêu đề nếu tự nhiên.
- Giọng văn phù hợp theo gợi ý (nếu gợi ý nghiêng về cảm xúc/đồng cảm, hãy phản ánh điều đó).
- Không dùng quá nhiều emoji; tối đa 1–2 emoji nếu cần nhấn mạnh.
- Không trả lời giải thích; chỉ in ra NỘI DUNG CUỐI CÙNG ở dạng văn bản thuần.

Bài gốc:
${fallback.caption || "(trống)"}

Gợi ý tóm tắt từ phân tích:
- Từ khóa: ${s.keyword || "-"}
- Độ dài: ${s.length || "-"}
- CTA: ${s.cta || "-"}
- Giọng văn: ${s.tone || "-"}
- Ngữ pháp: ${s.grammar || "-"}
- Landing match: ${s.match || "-"}
- Gợi ý hình ảnh: ${s.imageTips || "-"}

Từ khóa tham khảo (không bắt buộc phải dùng hết): ${kw}
`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: "Bạn là copywriter. Hãy chỉ trả về đoạn nội dung cuối cùng, không kèm giải thích." },
            { role: "user", content: rewritePrompt },
          ],
          temperature: 0.4,
          max_tokens: 600,
        }),
      });

      const data = await response.json();
      const newText =
        data?.choices?.[0]?.message?.content?.trim() ||
        "【Không tạo được nội dung gợi ý】";

      setDescDraft(newText);
      AntMessage.success("Đã viết lại nội dung theo gợi ý.");
    } catch (err) {
      console.error("Rewrite error:", err);
      AntMessage.error("Lỗi khi viết lại nội dung.");
    } finally {
      setRewriteLoading(false);
    }
  };

  // ========= PHÂN TÍCH
  const callOpenAIAnalyze = async (fallback:any) => {

    console.log(`fallback========`,fallback);
    
    try {
      setAnalysisLoading(true);

      const prompt = `
Phân tích bài viết và hình ảnh Facebook theo các tiêu chí sau và TRẢ VỀ DUY NHẤT MỘT MẢNG JSON (không thêm chữ, không markdown), dạng:
[
  { "Tiêu chí": "...", "Đánh giá": "...", "Điểm (tối đa)": số hoặc "x/y", "Nhận xét & Gợi ý": "..." }
]

Mỗi bài viết nên được “bóc tách” theo các yếu tố sau — kèm cách đánh giá + gợi ý cải thiện.

Từ khóa (Keyword relevance)
Kiểm tra: có xuất hiện từ khóa chính/biến thể, số lần, vị trí (dòng đầu, tiêu đề).
Điểm: 0–10.
Nếu chứa từ khóa chính + biến thể → điểm cao.
Gợi ý: đặt từ khóa trong 1–2 câu đầu và tiêu đề.

Số ký tự (Length)
Kiểm tra: tổng ký tự tiêu đề / mô tả.
Gợi ý phạm vi: Tiêu đề: ~20–40 ký tự; Mô tả ngắn: ~50–150 ký tự cho quảng cáo feed.
Điểm: 0–5 (cộng điểm nếu nằm trong khoảng khuyến nghị).

CTA (Call To Action)
Kiểm tra: có CTA rõ ràng không? (Ví dụ: Mua ngay, Đăng ký, Xem thêm)
Đánh giá: rõ ràng, động từ mạnh, 1 CTA duy nhất → điểm cao.
Điểm: 0–10.

Giọng văn / Tone
Kiểm tra: phù hợp persona? (thân mật / chuyên nghiệp / khuyến mãi)
Điểm: 0–5.

Ngữ pháp / lỗi chính tả
Kiểm tra tự động, điểm 0–5. Lỗi nhiều trừ nhiều.

Tương thích landing page (match)
Kiểm tra: promise trong ad có đúng landing không (sản phẩm/khuyến mãi)
→ 0–5.

Phân tích Hình ảnh (Image Analysis)
Màu sắc (Dominant color & palette) — 0–8
Độ sáng / phơi sáng (Brightness / Exposure) — 0–6
Tỷ lệ văn bản trên ảnh (Text ratio) — 0–8
Khuôn mặt / Người (Face detection) — 0–9
Sản phẩm (Product visibility / focus) — 0–9
Kích thước / tỉ lệ & độ phân giải — nếu không đạt chuẩn thì cảnh báo (có thể không cộng điểm riêng)

Điểm xếp hạng tổng thể (Score)
Text analysis (40%) — max 40 điểm
Image analysis (40%) — max 40 điểm
Performance prediction / context (20%) — max 20 điểm

Cách tính (0–100):
Final = (T / 40 × 100) × 0.4 + (I / 40 × 100) × 0.4 + (P / 20 × 100) × 0.2

Quy ước đánh giá:
≥ 75: Tốt — có thể chạy / scale.
50–74: Trung bình — cần tối ưu trước khi scale.
< 50: Yếu — KHÔNG nên scale, chỉnh hoặc thay creative.

YÊU CẦU BẮT BUỘC VỀ CẤU TRÚC KẾT QUẢ:
1) Có các hàng thành phần cho từng tiêu chí ở nhóm Text analysis, Image analysis, Performance (ghi rõ tên tiêu chí).
2) Có 3 hàng tổng kết nhóm:
   - "Text analysis — tổng" với "Đánh giá" = "TổngĐiểm/40"
   - "Image analysis — tổng" với "Đánh giá" = "TổngĐiểm/40"
   - "Performance — tổng" với "Đánh giá" = "TổngĐiểm/20"
3) Có hàng "Final Score" với "Đánh giá" = "ĐiểmCuối/100" và "Nhận xét & Gợi ý" nêu "Tốt" / "Trung bình" / "Yếu" theo quy ước.
4) Không trả thêm bất cứ text nào ngoài MẢNG JSON.

Content: ${fallback.caption}
Image URL: ${fallback.url || "Không có"}
`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: "Bạn là máy chấm điểm quảng cáo. Chỉ trả về JSON hợp lệ (một MẢNG), không thêm chữ nào khác." },
            { role: "user", content: prompt },
          ],
          temperature: 0,
          max_tokens: 1800,
        }),
      });

      const data = await response.json();
      let jsonText = data?.choices?.[0]?.message?.content?.trim() || "[]";

      // Lấy phần mảng nếu lỡ kèm text ngoài
      if (!jsonText.startsWith("[")) {
        const start = jsonText.indexOf("[");
        const end = jsonText.lastIndexOf("]");
        if (start >= 0 && end >= 0) jsonText = jsonText.slice(start, end + 1);
      }

      let parsed: ReviewRow[] = [];
      try {
        const raw = JSON.parse(jsonText);
        const arr = Array.isArray(raw) ? raw : (raw?.rows ?? []);
        parsed = (arr || []).map((it: any) => ({
          "Tiêu chí": String(it["Tiêu chí"] ?? ""),
          "Đánh giá": String(it["Đánh giá"] ?? ""),
          "Điểm (tối đa)": String(
            it["Điểm (tối đa)"] ??
            it["Điểm tối đa"] ??
            it["Diem (toi da)"] ??
            it["max"] ??
            ""
          ),
          "Nhận xét & Gợi ý": String(it["Nhận xét & Gợi ý"] ?? it["Nhận xét"] ?? it["Gợi ý"] ?? ""),
        }));
      } catch (e) {
        console.error("Parse JSON error:", e);
      }

      setAnalysisResult(parsed);
      AntMessage.success("Đã phân tích nội dung.");

      // >>> Sau khi có gợi ý, tự động viết lại content và set vào descDraft:
      await callOpenAIRewrite(fallback, parsed);

    } catch (error) {
      console.error("Analyze error:", error);
      AntMessage.error("Lỗi khi phân tích bằng AI.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  useEffect(() => {
    if (postRecot) callOpenAIAnalyze(postRecot); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postRecot]);

  const finalScore = useMemo(() => {
    const row = analysisResult.find((r) => r["Tiêu chí"] === "Final Score");
    if (!row) return null;
    const m = (row["Đánh giá"] || "").match(/(\d+)\s*\/\s*100/);
    return m ? Number(m[1]) : null;
  }, [analysisResult]);

  return (

    <><FullscreenLoader
      spinning={analysisLoading} /><Card style={{ backgroundColor: "#070719", borderRadius: 16, padding: 24, color: "#e2e8f0" }} bodyStyle={{ padding: 0 }}>
        <Row gutter={32}>
          <Col xs={24} md={12}>
            <div style={{ background: "#fff", color: "#000", padding: "12px 16px", borderRadius: "12px", minHeight: 760 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Title level={4} style={{ margin: 0 }}>
                  Phân tích & gợi ý nội dung
                </Title>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1.6fr", gap: "12px", fontWeight: 600 }}>
                <div>Tiêu chí</div>
                <div>Đánh giá</div>
                <div>Điểm (Tối đa)</div>
                <div>Nhận xét gợi ý</div>
              </div>
              <div style={{ maxHeight: 660, overflow: "auto", padding: "4px 12px 0" }}>
                {analysisLoading ? (
                  <div style={{ display: "flex", gap: 12, padding: 16 }}>
                    <Spin /> <span>Đang phân tích bằng AI…</span>
                  </div>
                ) : analysisResult.length > 0 ? (
                  analysisResult.map((item, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1.6fr", gap: "12px", padding: "12px 0", borderBottom: "1px solid #ccc" }}>
                      <div>{item["Tiêu chí"]}</div>
                      <div>{item["Đánh giá"]}</div>
                      <div>{item["Điểm (tối đa)"]}</div>
                      <div>{item["Nhận xét & Gợi ý"]}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: 16, color: "#666" }}>Chưa có dữ liệu phân tích</div>
                )}
              </div>
              {finalScore !== null && (
                <div style={{ marginTop: 12, background: "#fff", padding: 10, borderRadius: 10 }}>
                  <strong>Final Score = {finalScore} / 100</strong>
                </div>
              )}
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ padding: 10 }}>
              {iframeSrc ? (
                <iframe src={iframeSrc} width="100%" height="560" style={{ border: "none", borderRadius: 8, backgroundColor: "#e2e8f0" }} />
              ) : (
                <div style={{ height: 500, borderRadius: 8, background: "#0b1220", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  Chưa có preview post
                </div>
              )}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: "#f8fafc" }}>
                Gợi ý mô tả cho bài viết {rewriteLoading && <Spin size="small" style={{ marginLeft: 8 }} />}
              </label>
              <TextArea rows={5} value={descDraft} onChange={(e) => setDescDraft(e.target.value)} placeholder={t("image.enter_description")} />
            </div>
          </Col>
        </Row>
      </Card></>
  );
};

export default DetailAnalysis;
