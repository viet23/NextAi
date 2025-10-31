import React, { useEffect, useState } from "react";
import { Row, Card, Table, message, Modal, Select, Slider, Button } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useLazyDetailAdsQuery } from "src/store/api/ticketApi";
import "./styles.scss";
import { useSelector } from "react-redux";
import { useGetAccountQuery } from "src/store/api/accountApi";
import { IRootState } from "src/interfaces/app.interface";
import qs from "qs";
import axios from "axios";
import { useUpdateAdInsightMutation } from "src/store/api/facebookApi";

interface AdsFormProps {
  id: string | null;
  detailRecord: any;
  pageId: string | null;
}

export type RowType = {
  id?: string;
  adId?: string;
  campaignName?: string;
  createdAt?: string;
  createdByEmail?: string;

  impressions?: string | number;
  reach?: string | number;
  frequency?: string | number;
  clicks?: string | number;
  inlineLinkClicks?: string | number;
  spendVnd?: string | number;
  ctrPercent?: string | number;
  cpmVnd?: string | number;
  cpcVnd?: string | number;
  totalEngagement?: string | number;

  engagementDetails?: string;
  recommendation?: string;
  htmlReport?: string;
  keywordSuggestions?: string[] | string;
  userId?: string;
  isActive?: boolean;
  linkClicks?: string | number;

  conversions?: string | number;
  purchaseValueVnd?: string | number;
  cpaVnd?: string | number;
  roas?: string | number;

  reportDate?: string;
  aiKpis?: Array<{
    kpi?: string;
    level?: "Tốt" | "Trung bình" | "Kém" | string;
    comment?: string;
    action?: string;
    reason?: string;
  }>;
  breakdownAgeGenderHtml?: string;
  breakdownRegionHtml?: string;
  breakdownPlacementHtml?: string;
  summary?: string;

  targetingAI?: {
    keywordsForInterestSearch?: string[];
    defaultAgeRange?: [number, number];
  };
  interests?: string[];
  ageRange?: [number, number];
};

const num = (v: any) => {
  const n = Number(String(v ?? 0).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const fmtInt = (v: any) => num(v).toLocaleString("vi-VN");
const fmtCurrency = (v: any) => num(v).toLocaleString("vi-VN");
const fmtPercent = (v: any, digits = 2) => `${num(v).toFixed(digits)}%`;

type TargetingAI = {
  keywordsForInterestSearch?: string[];
  defaultAgeRange?: [number, number];
};

const sanitizeInterests = (vals: string[]) => {
  const uniq = Array.from(new Set(vals.map((v) => v.trim()).filter(Boolean)));
  return uniq.map((v) => (v.length > 60 ? v.slice(0, 60) : v));
};

// ---- Parse interests from htmlReport (chưa dùng, giữ lại nếu cần fallback) ----
const htmlToText = (html?: string) => {
  if (!html) return "";
  try {
    if (typeof window !== "undefined" && "DOMParser" in window) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      return doc.body.textContent || "";
    }
  } catch {}
  return String(html).replace(/<[^>]*>/g, " ");
};
// ---------------------------------------------------------------------------

// ✅ Ép keywordSuggestions về string[] (an toàn kiểu)
const coerceKeywordSuggestions = (
  input: string[] | string | undefined
): string[] => {
  if (!input) return [];
  if (Array.isArray(input)) return sanitizeInterests(input.map(String));

  // input là string: thử parse JSON trước
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) return sanitizeInterests(parsed.map(String));
  } catch {
    // ignore
  }
  // fallback: tách theo dấu phẩy
  return sanitizeInterests(
    String(input)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
};

const DetailAdsReport: React.FC<AdsFormProps> = ({ id, detailRecord, pageId }) => {
  const { t } = useTranslation();
  const { user } = useSelector((state: IRootState) => state.auth);
  const { data: accountDetailData } = useGetAccountQuery(user?.id || "0", { skip: !user?.id });

  const [updateAdInsight] = useUpdateAdInsightMutation();
  const [getDetailTicket] = useLazyDetailAdsQuery();

  const [dataSource, setDataSource] = useState<RowType[]>([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<RowType | null>(null);

  // Targeting states
  const [targetingAI, setTargetingAI] = useState<TargetingAI | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [age, setAge] = useState<[number, number]>([22, 45]);

  // NEW: loading khi bấm "Áp dụng tối ưu"
  const [applyLoading, setApplyLoading] = useState(false);

  const handleOnClickDetail = (record: RowType) => {
    const patchedHtml = record.htmlReport;
    setCurrent({ ...record, htmlReport: patchedHtml });
    setOpen(true);
  };

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      if (!id) {
        setDataSource([]);
        return;
      }
      try {
        setLoading(true);
        const res = await getDetailTicket(id).unwrap();
        const items: RowType[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (mounted) setDataSource(items);
      } catch {
        if (mounted) {
          setDataSource([]);
          message.error("Error getting article information!");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, [id, getDetailTicket]);

  // Prefill Targeting (ưu tiên state/record, fallback keywordSuggestions)
  useEffect(() => {
    if (!current) return;

    const ai = (current as any)?.targetingAI || (detailRecord as any)?.targetingAI || null;
    setTargetingAI(ai);

    const presetInterests: string[] =
      (current as any)?.interests || (detailRecord as any)?.interests || [];
    let sanitized = sanitizeInterests(presetInterests);

    // Nếu chưa có interests từ record thì lấy từ keywordSuggestions
    if (!sanitized || sanitized.length === 0) {
      sanitized =
        coerceKeywordSuggestions(current?.keywordSuggestions) ||
        coerceKeywordSuggestions((detailRecord as any)?.keywordSuggestions);
    }
    setInterests(sanitized);

    const aiAge = ai?.defaultAgeRange;
    const presetAge: [number, number] =
      (current as any)?.ageRange ||
      (detailRecord as any)?.ageRange ||
      (Array.isArray(aiAge) && aiAge.length === 2 ? (aiAge as [number, number]) : [22, 45]);

    const min = Math.max(13, Math.min(65, presetAge[0]));
    const max = Math.max(min, Math.min(65, presetAge[1]));
    setAge([min, max]);
  }, [current, detailRecord]);

  // Nút "Chấp nhận" trong bảng KPI (giữ nguyên): bật isActive + gửi targeting
  const handleApply = (id?: string | number) => {
    Modal.confirm({
      title: "Xác nhận đồng ý?",
      content: "Hành động này sẽ được thực hiện ngay.",
      okText: "Đồng ý",
      cancelText: "Hủy",
      async onOk() {
        try {
          updateAdInsight({
            id,
            body: {
              isActive: true,
              targeting: {
                interests,
                ageRange: age,
              },
            },
          })
            .unwrap()
            .then(() => message.success("Cập nhật tài khoản thành công!"))
            .catch(() => message.error("Đã xảy ra lỗi khi cập nhật tài khoản!"));
          message.success("Đã thực thi khuyến nghị!");
          setOpen(false); // đóng modal sau khi áp dụng trong confirm
        } catch {
          message.error("Thao tác thất bại. Vui lòng thử lại!");
        }
      },
    });
  };

  // ✅ Nút “Áp dụng tối ưu” riêng cho Targeting: chỉ gửi interests + ageRange
  //    Sau khi xử lý xong -> đóng Modal
  const handleApplyTargeting = async () => {
    if (!current?.id) {
      message.error("Thiếu ID bản ghi để cập nhật.");
      return;
    }
    setApplyLoading(true);
    try {
      await updateAdInsight({
        id: current.id,
        body: {
          isActive: true,
          targeting: {
            interests,
            ageRange: age,
          },
        },
      }).unwrap();
      message.success("Đã áp dụng tối ưu Targeting!");
      setOpen(false); // <-- đóng Modal ngay sau khi thành công
    } catch (e) {
      message.error("Không thể áp dụng tối ưu Targeting. Vui lòng thử lại!");
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <>
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
          <Table<RowType>
            className="table-scroll dark-header-table"
            rowKey={(r) => r.id || r.adId || Math.random().toString(36).slice(2)}
            columns={[
              {
                title: "Ngày Báo cáo",
                dataIndex: "createdAt",
                key: "createdAt",
                width: 180,
                render: (text) => (!text ? "" : dayjs(text).format("HH:mm:ss DD/MM/YYYY")),
              },
              {
                title: t("dashboard.action"),
                key: "action",
                width: 100,
                align: "center",
                render: (_, record) => (
                  <button className="ads-button-glow" onClick={() => handleOnClickDetail(record)}>
                    Chi tiết
                  </button>
                ),
              },
              { title: "Ad ID", dataIndex: "adId", key: "adId", width: 180 },
              { title: "Chiến dịch", dataIndex: "campaignName", key: "campaignName", ellipsis: true },
              { title: "Hiển thị", dataIndex: "impressions", key: "impressions", align: "right", render: (v) => fmtInt(v) },
              { title: "Clicks", dataIndex: "clicks", key: "clicks", align: "right", render: (v) => fmtInt(v) },
              { title: "Chi phí (VNĐ)", dataIndex: "spendVnd", key: "spendVnd", align: "right", render: (v) => fmtCurrency(v) },
              { title: "CTR (%)", dataIndex: "ctrPercent", key: "ctrPercent", align: "right", render: (v) => fmtPercent(v, 2) },
              { title: "CPM (VNĐ)", dataIndex: "cpmVnd", key: "cpmVnd", align: "right", render: (v) => fmtCurrency(v) },
            ]}
            dataSource={dataSource}
            pagination={false}
            loading={loading}
            scroll={{ x: 900, y: 380 }}
          />
        </Row>
      </Card>

      <Modal
        open={open}
        centered
        title={
          <div style={{ textAlign: "center", width: "100%" }}>
            All One Ads – Báo cáo quảng cáo (Daily Report) – {current?.adId ?? "-"}
          </div>
        }
        onCancel={() => setOpen(false)}
        width={900}
        styles={{
          body: { background: "#ffffff" }, // đổi thành #070719 nếu muốn dark
          header: { textAlign: "center" },
        }}
        footer={<div style={{ display: "flex", justifyContent: "space-between", padding: "0 16px" }} />}
      >
        <div style={{ lineHeight: 1.7 }}>
          {/* (1) Nếu có htmlReport thì render trước; nếu không, render layout mặc định */}
          {current?.htmlReport ? (
            <div className="prose prose-invert" dangerouslySetInnerHTML={{ __html: current.htmlReport }} />
          ) : (
            <>
              <div style={{ marginBottom: 12, textAlign: "center" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: 14,
                    background: "#f0f5ff",
                    color: "#1d39c4",
                    fontWeight: 600,
                  }}
                >
                  Ngày báo cáo: {current?.reportDate ?? "-"}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <strong>Ad ID:</strong> {current?.adId ?? "-"}
                </div>
                <div>
                  <strong>Chiến dịch:</strong> {current?.campaignName ?? "-"}
                </div>
                <div>
                  <strong>Người tạo:</strong> {current?.createdByEmail ?? "-"}
                </div>
                <div>
                  <strong>Trạng thái:</strong> {detailRecord?.status ?? "-"}
                </div>
              </div>

              <hr />

              <h4 style={{ marginTop: 12, marginBottom: 8 }}>📊 Chỉ số cơ bản</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10 }}>
                <div>
                  <strong>Hiển thị:</strong> {fmtInt?.(current?.impressions) ?? "-"}
                </div>
                <div>
                  <strong>Reach:</strong> {fmtInt?.(current?.reach) ?? "-"}
                </div>
                <div>
                  <strong>Tần suất:</strong> {current?.frequency ?? "-"}
                </div>
                <div>
                  <strong>Clicks:</strong> {fmtInt?.(current?.clicks) ?? "-"}
                </div>
                <div>
                  <strong>Link Clicks:</strong> {fmtInt?.(current?.inlineLinkClicks ?? current?.linkClicks) ?? "-"}
                </div>
                <div>
                  <strong>Chi phí:</strong> {fmtCurrency?.(current?.spendVnd)} VNĐ
                </div>
                <div>
                  <strong>CTR:</strong> {fmtPercent?.(current?.ctrPercent) ?? "-"}
                </div>
                <div>
                  <strong>CPM:</strong> {fmtCurrency?.(current?.cpmVnd)} VNĐ
                </div>
                <div>
                  <strong>CPC:</strong> {fmtCurrency?.(current?.cpcVnd)} VNĐ
                </div>
                {current?.totalEngagement != null && (
                  <div style={{ gridColumn: "span 3" }}>
                    <strong>📌 Tổng tương tác:</strong> {fmtInt?.(current?.totalEngagement)}
                  </div>
                )}
              </div>

              {(current?.conversions != null ||
                current?.purchaseValueVnd != null ||
                current?.cpaVnd != null ||
                current?.roas != null) && (
                <>
                  <h4 style={{ marginTop: 16, marginBottom: 8 }}>💰 Chỉ số kinh doanh (Pixel/CAPI)</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 10 }}>
                    {current?.conversions != null && (
                      <div>
                        <strong>Conversions:</strong> {fmtInt?.(current?.conversions)}
                      </div>
                    )}
                    {current?.purchaseValueVnd != null && (
                      <div>
                        <strong>Doanh thu:</strong> {fmtCurrency?.(current?.purchaseValueVnd)} VNĐ
                      </div>
                    )}
                    {current?.cpaVnd != null && (
                      <div>
                        <strong>CPA:</strong> {fmtCurrency?.(current?.cpaVnd)} VNĐ
                      </div>
                    )}
                    {current?.roas != null && (
                      <div>
                        <strong>ROAS:</strong> {Number(current?.roas).toFixed(2)}
                      </div>
                    )}
                  </div>
                </>
              )}

              {(current?.breakdownAgeGenderHtml ||
                current?.breakdownRegionHtml ||
                current?.breakdownPlacementHtml) && (
                <>
                  <h4 style={{ marginTop: 16, marginBottom: 8 }}>🔍 Phân tích chi tiết (Breakdown)</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10 }}>
                    {current?.breakdownAgeGenderHtml && (
                      <div style={{ border: "1px solid #f0f0f0", borderRadius: 8, padding: 10 }}>
                        <strong>Theo độ tuổi/giới tính</strong>
                        <div dangerouslySetInnerHTML={{ __html: current?.breakdownAgeGenderHtml }} />
                      </div>
                    )}
                    {current?.breakdownRegionHtml && (
                      <div style={{ border: "1px solid #f0f0f0", borderRadius: 8, padding: 10 }}>
                        <strong>Theo khu vực</strong>
                        <div dangerouslySetInnerHTML={{ __html: current?.breakdownRegionHtml }} />
                      </div>
                    )}
                    {current?.breakdownPlacementHtml && (
                      <div style={{ border: "1px solid #f0f0f0", borderRadius: 8, padding: 10 }}>
                        <strong>Theo vị trí hiển thị</strong>
                        <div dangerouslySetInnerHTML={{ __html: current?.breakdownPlacementHtml }} />
                      </div>
                    )}
                  </div>
                </>
              )}

              <h4 style={{ marginTop: 16, marginBottom: 8 }}>🧠 Đánh giá & Gợi ý tối ưu từ AI</h4>
              {(() => {
                const aiKpis = Array.isArray(current?.aiKpis) ? current?.aiKpis! : [];
                if (aiKpis.length > 0) {
                  return (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr>
                          {["Chỉ số / KPI", "Mức", "Nhận xét AI", "Hành động gợi ý", "Lý do (KPI)", "Nút"].map((h) => (
                            <th key={h} style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {aiKpis.map((row: any, idx: number) => {
                          const lvl = row?.level;
                          const badgeColor = lvl === "Tốt" ? "#52c41a" : lvl === "Trung bình" ? "#faad14" : "#f5222d";
                          return (
                            <tr key={row?.key ?? row?.kpi ?? idx}>
                              <td style={{ padding: 8, borderBottom: "1px solid #f5f5f5" }}>{row?.kpi ?? "-"}</td>
                              <td style={{ padding: 8, borderBottom: "1px solid #f5f5f5" }}>
                                <span style={{ background: badgeColor, color: "#fff", padding: "2px 8px", borderRadius: 12 }}>
                                  {row?.level ?? "-"}
                                </span>
                              </td>
                              <td style={{ padding: 8, borderBottom: "1px solid #f5f5f5" }}>{row?.comment ?? "-"}</td>
                              <td style={{ padding: 8, borderBottom: "1px solid #f5f5f5" }}>{row?.action ?? "-"}</td>
                              <td style={{ padding: 8, borderBottom: "1px solid #f5f5f5" }}>{row?.reason ?? "-"}</td>
                              <td style={{ padding: 8, borderBottom: "1px solid #f5f5f5" }}>
                                <button
                                  style={{
                                    backgroundColor: "#1677ff",
                                    border: "none",
                                    color: "#fff",
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => handleApply?.(current?.id)}
                                >
                                  Chấp nhận
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  );
                }
                if (current?.recommendation) {
                  return <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>{current?.recommendation}</pre>;
                }
                return <p style={{ fontStyle: "italic", color: "#8c8c8c" }}>Chưa có bảng khuyến nghị chi tiết.</p>;
              })()}
            </>
          )}

          {/* (2) Targeting — luôn hiển thị (kể cả khi có htmlReport) */}
          <div style={{ marginTop: 16 }}>
            <h4 style={{ marginTop: 0, marginBottom: 8 }}>🎯 Targeting gợi ý</h4>

            {/* Interests */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6, color: "#0f172a", fontWeight: 600 }}>
                {t("ads.detailed_targeting") ?? "Detailed targeting (interests)"}
              </label>
              <Select
                mode="tags"
                value={interests}
                onChange={(vals) => setInterests(sanitizeInterests(vals as string[]))}
                tokenSeparators={[","]}
                style={{ width: "100%" }}
                placeholder={t("Nhập từ khoá rồi nhấn Enter hoặc dấu phẩy (,)") ?? "Type keywords, press Enter or comma"}
                options={(targetingAI?.keywordsForInterestSearch ?? []).map((k: string) => ({ label: k, value: k }))}
              />
              <div style={{ color: "#64748b", fontSize: 12, marginTop: 6 }}>
                {t("Nhập từ khoá rồi nhấn Enter hoặc dấu phẩy (,) . Ví dụ:")} <code>fitness</code>, <code>wellness</code>,{" "}
                <code>vitamin C</code>
              </div>
            </div>

            {/* Age range */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6, color: "#0f172a", fontWeight: 600 }}>👤 Độ tuổi</label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <Slider range min={13} max={65} value={age} onChange={(val) => setAge(val as [number, number])} tooltip={{ open: false }} />
                </div>
                <div
                  style={{
                    width: 120,
                    textAlign: "center",
                    color: "#0f172a",
                    background: "#f8fafc",
                    border: "1px solid ",
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {age[0]} – {age[1]}
                </div>
              </div>
            </div>

            {/* ✅ Nút Áp dụng tối ưu (chỉ gửi interests + ageRange) */}
            {current?.isActive === false && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 20,
                }}
              >
                <Button
                  type="primary"
                  onClick={handleApplyTargeting}
                  disabled={!current?.id}
                  loading={applyLoading} // <-- hiển thị loading trong lúc gọi API
                  style={{
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                    boxShadow: "0 0 12px rgba(82,196,26,0.6)",
                  }}
                >
                  Áp dụng tối ưu
                </Button>
              </div>
            )}
          </div>

          {/* (3) Kết luận — tránh trùng lặp nếu htmlReport đã chứa */}
          {!current?.htmlReport && current?.summary && (
            <>
              <hr />
              <h4 style={{ marginTop: 12, marginBottom: 8 }}>✅ Kết luận & Khuyến nghị tổng quan</h4>
              <div>{current?.summary}</div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default DetailAdsReport;
