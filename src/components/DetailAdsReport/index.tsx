import React, { useEffect, useState } from "react";
import { Row, Card, Table, message, Modal } from "antd";
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
  detailRecord: any; // Thêm prop này để nhận record chi tiết từ Dashboard
  pageId: string | null;
}

const onAcceptRecommendation = undefined; // hoặc một no-op: () => {}


// types.ts (hoặc đặt ngay trên component)
export type RowType = {
  id?: string;
  adId?: string;
  campaignName?: string;
  createdAt?: string;
  createdByEmail?: string;

  // metrics phẳng (backend mới)
  impressions?: string | number;
  reach?: string | number;
  frequency?: string | number;
  clicks?: string | number;
  inlineLinkClicks?: string | number;  // ✅ tên mới
  spendVnd?: string | number;
  ctrPercent?: string | number;        // vd "0.140384" -> 0.14%
  cpmVnd?: string | number;
  cpcVnd?: string | number;
  totalEngagement?: string | number;

  engagementDetails?: string;          // html <li>...</li>
  recommendation?: string;             // text
  htmlReport?: string;                 // html đầy đủ
  userId?: string;
  isActive?: boolean;

  // ====== BỔ SUNG để hết lỗi TS2339 ======
  // alias cũ để code không vỡ (giữ tùy chọn)
  linkClicks?: string | number;

  // Chỉ số kinh doanh (nếu backend có trả)
  conversions?: string | number;
  purchaseValueVnd?: string | number;
  cpaVnd?: string | number;
  roas?: string | number;

  // Phần mở rộng cho layout báo cáo
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
};



const num = (v: any) => {
  const n = Number(String(v ?? 0).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const fmtInt = (v: any) => num(v).toLocaleString("vi-VN");
const fmtCurrency = (v: any) => num(v).toLocaleString("vi-VN");
const fmtPercent = (v: any, digits = 2) => `${num(v).toFixed(digits)}%`;

const DetailAdsReport: React.FC<AdsFormProps> = ({ id, detailRecord, pageId }) => {
  const { t } = useTranslation();
  const { user } = useSelector((state: IRootState) => state.auth);
  const { data: accountDetailData } = useGetAccountQuery(user?.id || "0", {
    skip: !user?.id,
  });


  const [updateAdInsight, { isSuccess: isUpdateSuccess }] = useUpdateAdInsightMutation();


  const [getDetailTicket] = useLazyDetailAdsQuery();
  const [dataSource, setDataSource] = useState<RowType[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal xem chi tiết (render htmlReport nếu có)
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<RowType | null>(null);

  const handleOnClickDetail = (record: RowType) => {
    setCurrent(record);
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
        // Backend mới trả mảng item phẳng như mẫu bạn gửi
        const items: RowType[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (mounted) setDataSource(items);
      } catch (e) {
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


  // Gọi Graph API để bật/tắt Ad theo adId
  async function setAdStatus(adId: string, isActive: boolean) {
    try {
      if (!accountDetailData?.accessTokenUser) {
        message.error("Thiếu access token");
        return false;
      }

      const url = `https://graph.facebook.com/v19.0/${adId}`;
      const body = qs.stringify({
        status: isActive ? "ACTIVE" : "PAUSED",
        access_token: accountDetailData.accessTokenUser,
      });

      const res = await axios.post(url, body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const data = res.data as { success?: boolean };

      if (data.success === true) {
        message.success(isActive ? "Đã bật quảng cáo" : "Đã tắt quảng cáo");
        return true;
      } else {
        message.error("Facebook API không trả về thành công");
        return false;
      }
    } catch (error: any) {
      console.error(
        "❌ Lỗi khi đổi trạng thái quảng cáo:",
        error?.response?.data || error.message
      );
      message.error(
        error?.response?.data?.error?.message || "Không thể cập nhật trạng thái quảng cáo"
      );
      return false;
    }
  }

  const handleApply = (id?: string | number) => {
    Modal.confirm({
      title: "Xác nhận đồng ý?",
      content: "Hành động này sẽ được thực hiện ngay.",
      okText: "Đồng ý",
      cancelText: "Hủy",
      async onOk() {
        try {

          updateAdInsight({
            id: id,
            body: { isActive: true },
          })
            .unwrap()
            .then(() => {
              message.success("Cập nhật tài khoản thành công!");
            })
            .catch(() => {
              message.error("Đã xảy ra lỗi khi cập nhật tài khoản!");
            });
          message.success("Đã thực thi khuyến nghị!");
          // Ví dụ cập nhật UI:
          // setCurrent(p => ({ ...p, isActive: true }));
          setOpen(false);
        } catch {
          message.error("Thao tác thất bại. Vui lòng thử lại!");
        }
      },
    });
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
            rowKey={(r) =>
              r.id || r.adId || Math.random().toString(36).slice(2)
            }
            columns={[
              {
                title: "Ngày Báo cáo",
                dataIndex: "createdAt",
                key: "createdAt",
                width: 180,
                render: (text) => {
                  if (!text) return "";
                  return dayjs(text).format("HH:mm:ss DD/MM/YYYY");
                },
              },

              {
                title: t("dashboard.action"),
                key: "action",
                width: 100,
                align: "center",
                render: (_, record) => (
                  <button
                    className="ads-button-glow"
                    onClick={() => handleOnClickDetail(record)}
                  >
                    Chi tiết
                  </button>
                ),
              },
              {
                title: "Ad ID",
                dataIndex: "adId",
                key: "adId",
                width: 180,
              },

              {
                title: "Chiến dịch",
                dataIndex: "campaignName",
                key: "campaignName",
                ellipsis: true,
              },
              {
                title: "Hiển thị",
                dataIndex: "impressions",
                key: "impressions",
                align: "right",
                render: (v) => fmtInt(v),
              },
              {
                title: "Clicks",
                dataIndex: "clicks",
                key: "clicks",
                align: "right",
                render: (v) => fmtInt(v),
              },
              {
                title: "Chi phí (VNĐ)",
                dataIndex: "spendVnd",
                key: "spendVnd",
                align: "right",
                render: (v) => fmtCurrency(v),
              },
              {
                title: "CTR (%)",
                dataIndex: "ctrPercent",
                key: "ctrPercent",
                align: "right",
                render: (v) => fmtPercent(v, 2), // "0.140384" -> "0.14%"
              },
              {
                title: "CPM (VNĐ)",
                dataIndex: "cpmVnd",
                key: "cpmVnd",
                align: "right",
                render: (v) => fmtCurrency(v),
              },

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
  footer={
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0 16px" }}>
      {/* Nút Tạm dừng/Bật lại chiến dịch: giữ nguyên logic cũ */}
      <button
        style={{
          backgroundColor: detailRecord?.status === "ACTIVE" ? "#f5222d" : "#52c41a",
          border: "none",
          color: "#fff",
          padding: "8px 16px",
          borderRadius: "6px",
          fontWeight: 500,
          cursor: "pointer",
        }}
        onClick={() => {
          Modal.confirm({
            title: detailRecord?.status === "ACTIVE" ? "Tạm dừng chiến dịch?" : "Bật lại chiến dịch?",
            content:
              detailRecord?.status === "ACTIVE"
                ? "Chiến dịch sẽ bị tạm dừng ngay."
                : "Chiến dịch sẽ được bật lại.",
            okText: "Xác nhận",
            cancelText: "Hủy",
            okButtonProps: { danger: detailRecord?.status === "ACTIVE" },
            async onOk() {
              const ok = await setAdStatus(
                detailRecord?.adId,
                detailRecord?.status !== "ACTIVE" // nếu đang ACTIVE thì sẽ tắt, ngược lại thì bật
              );
              if (ok) setOpen(false);
            },
          });
        }}
      >
        {detailRecord?.status === "ACTIVE" ? "⏸ Tạm dừng" : "▶ Bật lại"} chiến dịch
      </button>

      {/* Nút Áp dụng khuyến nghị: giữ nguyên logic cũ */}
      <button
        disabled={current?.isActive}
        style={{
          backgroundColor: current?.isActive ? "#d9d9d9" : "#52c41a",
          border: "none",
          color: "#fff",
          padding: "8px 16px",
          borderRadius: "6px",
          fontWeight: 500,
          cursor: current?.isActive ? "not-allowed" : "pointer",
        }}
        onClick={!current?.isActive ? () => handleApply(current?.id) : undefined}
      >
        {current?.isActive ? "✔ Đã áp dụng" : "✔ Áp dụng khuyến nghị"}
      </button>
    </div>
  }
>
  {/* Nếu có htmlReport thì ưu tiên render sẵn */}
  {current?.htmlReport ? (
    <div className="prose prose-invert" dangerouslySetInnerHTML={{ __html: current?.htmlReport }} />
  ) : (
    <div style={{ lineHeight: 1.7 }}>
      {/* ===== Thông tin chiến dịch ===== */}
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

      {/* ===== Chỉ số cơ bản ===== */}
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

      {/* ===== Chỉ số kinh doanh (nếu có) ===== */}
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

      {/* ===== Breakdown (nếu có) ===== */}
      {(current?.breakdownAgeGenderHtml || current?.breakdownRegionHtml || current?.breakdownPlacementHtml) && (
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

      {/* ===== Gợi ý tối ưu từ AI ===== */}
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

      {/* ===== Kết luận ===== */}
      {current?.summary && (
        <>
          <hr />
          <h4 style={{ marginTop: 12, marginBottom: 8 }}>✅ Kết luận & Khuyến nghị tổng quan</h4>
          <div>{current?.summary}</div>
        </>
      )}
    </div>
  )}
</Modal>



    </>
  );
};

export default DetailAdsReport;
