import React, { useEffect, useState } from "react";
import { Row, Card, Table, message, Modal } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useLazyDetailAdsQuery } from "src/store/api/ticketApi";
import "./styles.scss";

interface AdsFormProps {
  id: string | null;
  pageId: string | null;
}

type RowType = {
  id?: string;
  adId?: string;
  campaignName?: string;
  createdAt?: string;
  createdByEmail?: string;
  // metrics phẳng theo backend mới
  impressions?: string | number;
  reach?: string | number;
  frequency?: string | number;
  clicks?: string | number;
  inlineLinkClicks?: string | number;
  spendVnd?: string | number;
  ctrPercent?: string | number; // ví dụ "0.140384" (đơn vị: %)
  cpmVnd?: string | number;
  cpcVnd?: string | number;
  totalEngagement?: string | number;
  engagementDetails?: string; // html <li>...</li>
  recommendation?: string; // text
  htmlReport?: string; // html đầy đủ
  userId?: string;
  isActive?: boolean;
};

const num = (v: any) => {
  const n = Number(String(v ?? 0).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const fmtInt = (v: any) => num(v).toLocaleString("vi-VN");
const fmtCurrency = (v: any) => num(v).toLocaleString("vi-VN");
const fmtPercent = (v: any, digits = 2) => `${num(v).toFixed(digits)}%`;

const DetailAdsReport: React.FC<AdsFormProps> = ({ id, pageId }) => {
  const { t } = useTranslation();

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
            Báo cáo quảng cáo - {current?.adId ?? "-"}
          </div>
        }
        onCancel={() => setOpen(false)}
        width={800}
        styles={{
          body: { background: "#ffffff" }, // đổi thành #070719 nếu muốn tối
          header: { textAlign: "center" }
        }}
        footer={
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0 16px" }}>
            {/* Nút Tạm dừng chiến dịch */}
            <button
              style={{
                backgroundColor: "#f5222d",
                border: "none",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: "6px",
                fontWeight: 500,
                cursor: "pointer"
              }}
              onClick={() => {
                Modal.confirm({
                  title: "Bạn có chắc muốn tạm dừng chiến dịch này?",
                  content: "Chiến dịch sẽ bị tạm dừng ngay lập tức.",
                  okText: "Xác nhận",
                  cancelText: "Hủy",
                  okButtonProps: { danger: true },
                  async onOk() {
                    try {
                      // TODO: gọi API tạm dừng chiến dịch tại đây, ví dụ:
                      // await pauseCampaign(current?.adId)
                      message.success("Đã tạm dừng chiến dịch!");
                      setOpen(false);
                    } catch (e) {
                      message.error("Tạm dừng thất bại. Vui lòng thử lại!");
                    }
                  }
                });
              }}
            >
              ⏸ Tạm dừng chiến dịch
            </button>

            {/* Nút Đồng ý */}
            <button
              style={{
                backgroundColor: "#4cc0ff",
                border: "none",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: "6px",
                fontWeight: 500,
                cursor: "pointer"
              }}
              onClick={() => {
                Modal.confirm({
                  title: "Xác nhận đồng ý?",
                  content: "Hành động này sẽ được thực hiện ngay.",
                  okText: "Đồng ý",
                  cancelText: "Hủy",
                  async onOk() {
                    try {
                      // TODO: xử lý đồng ý ở đây, ví dụ cập nhật trạng thái...
                      message.success("Đã thực thi khuyến nghị!");
                      setOpen(false);
                    } catch (e) {
                      message.error("Thao tác thất bại. Vui lòng thử lại!");
                    }
                  }
                });
              }}
            >
              ✔ Đồng ý
            </button>
          </div>
        }
      >
        {/* Ưu tiên htmlReport nếu backend trả sẵn; fallback render nhanh các trường chính */}
        {current?.htmlReport ? (
          <div
            className="prose prose-invert"
            dangerouslySetInnerHTML={{ __html: current.htmlReport }}
          />
        ) : (
          <div style={{ lineHeight: 1.7 }}>
            <p><strong>Ad ID:</strong> {current?.adId}</p>
            <p><strong>Chiến dịch:</strong> {current?.campaignName}</p>
            <p><strong>Người tạo:</strong> {current?.createdByEmail}</p>
            <p><strong>👁 Hiển thị:</strong> {fmtInt(current?.impressions)}</p>
            <p><strong>🖱 Click:</strong> {fmtInt(current?.clicks)}</p>
            <p>
              <strong>💸 Chi phí:</strong> {fmtCurrency(current?.spendVnd)} VNĐ
            </p>
            <p>
              <strong>📊 CTR:</strong> {fmtPercent(current?.ctrPercent)} —{" "}
              <strong>CPM:</strong> {fmtCurrency(current?.cpmVnd)} VNĐ —{" "}
              <strong>CPC:</strong> {fmtCurrency(current?.cpcVnd)} VNĐ
            </p>
            {current?.engagementDetails && (
              <>
                <p><strong>📌 Tổng tương tác:</strong> {fmtInt(current?.totalEngagement)}</p>
                <ul
                  dangerouslySetInnerHTML={{
                    __html: current.engagementDetails,
                  }}
                />
              </>
            )}
            {current?.recommendation && (
              <>
                <hr />
                <h4>📈 Gợi ý tối ưu hóa:</h4>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "inherit",
                    margin: 0,
                  }}
                >
                  {current.recommendation}
                </pre>
              </>
            )}
          </div>
        )}
      </Modal>


    </>
  );
};

export default DetailAdsReport;
