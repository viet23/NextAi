import React, { useEffect, useMemo, useState } from "react";
import {
  Layout,
  Typography,
  Table,
  Drawer,
  Collapse,
  Card,
  Switch,
  Popconfirm,
  Tag,
  message,
} from "antd";
import { useSelector } from "react-redux";
import { IRootState } from "src/interfaces/app.interface";
import { useGetAccountQuery } from "src/store/api/accountApi";
import { useTranslation } from "react-i18next";
import "./styles.scss";
import { CaretRightOutlined, CloseOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import { useGetFacebookadsQuery } from "src/store/api/ticketApi";
import { useSetAdStatusMutation } from "src/store/api/facebookApi";
import DetailAdsReport from "../DetailAdsReport";
import dayjs from "dayjs";

/** ===== Types khớp với dữ liệu BE mới ===== */
type AdRow = {
  adId: string;
  name?: string;
  caption?: string;
  urlPost?: string;
  status?: string;
  data?: {
    impressions?: number;
    clicks?: number;
    costPerClickNumber?: string | number;
    costPerMessageNumber?: string | number;
    messages?: number;
    spend?: string | number;
    ctr?: string | number;
    cpm?: string | number;
  };
  createdAt?: string;
};

type CampaignRow = {
  campaignRefId?: number;
  campaignId: string;
  name: string;
  objective?: string;
  startTime?: string;
  endTime?: string;
  dailyBudget?: number;
  status?: string;
  createdAt?: string;
  totals?: {
    impressions?: number;
    clicks?: number;
    costPerClickNumber?: string | number;
    costPerMessageNumber?: string | number;
    messages?: number;
    spend?: string | number;
  };
  ads: AdRow[];
};

const { Panel } = Collapse;
const { Title } = Typography;

/** utils nhỏ để format số */
const num = (v: any) => {
  const n = Number(String(v ?? 0).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const fmtInt = (v: any) => num(v).toLocaleString("vi-VN");
const fmtCurrency = (v: any) => {
  if (v == null || v === '') return '0'
  const num = parseFloat(String(v).replace(/,/g, '')) || 0
  return Math.trunc(num).toLocaleString("vi-VN")
}

const fmtPercent = (v: any, digits = 2) => `${num(v).toFixed(digits)}%`;

const CampaignReport: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: IRootState) => state.auth);
  useGetAccountQuery(user?.id || "0", { skip: !user?.id }); // giữ để đồng bộ session nếu cần

  // ====== Lấy danh sách campaigns (BE trả mảng campaign)
  const [filter] = useState<any>({ page: 1, pageSize: 100 });
  const { data: campaignsRes, isFetching } = useGetFacebookadsQuery({ filter });

  // Local state để không mutate RTK object
  const [campaignRows, setCampaignRows] = useState<CampaignRow[]>([]);
  useEffect(() => {
    const items: CampaignRow[] = Array.isArray(campaignsRes?.data)
      ? campaignsRes.data
      : Array.isArray(campaignsRes)
        ? campaignsRes
        : [];
    setCampaignRows(items);
  }, [campaignsRes?.data]);

  // ====== Drawer chi tiết báo cáo (ở cấp ad)
  const [isOpenReport, setIsOpenReport] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailRecord, setDetailRecord] = useState<any | null>(null);

  const openReport = (record: AdRow) => {
    setDetailRecord(record);
    setDetailId(record?.adId ?? null);
    setIsOpenReport(true);
  };
  const closeReport = () => {
    setDetailRecord(null);
    setDetailId(null);
    setIsOpenReport(false);
  };

  // ====== Bật/tắt ad (gọi qua BE)
  const [setAdStatusMutation] = useSetAdStatusMutation();
  const [toggleBusy, setToggleBusy] = useState<Record<string, boolean>>({});

  const setAdStatusUI = async (adId: string, isActive: boolean) => {
    setToggleBusy((s) => ({ ...s, [adId]: true }));
    const hide = message.loading(isActive ? "Đang bật quảng cáo..." : "Đang tạm dừng...", 0);
    try {
      const res: any = await setAdStatusMutation({ adId, isActive }).unwrap();
      if (res?.success) {
        message.success(res?.message || (isActive ? "Đã bật quảng cáo" : "Đã tạm dừng quảng cáo"));
        return true;
      }
      message.error("Máy chủ không xác nhận thành công");
      return false;
    } catch (e: any) {
      const msg = e?.data?.message || e?.error || e?.message || "Không thể cập nhật trạng thái quảng cáo";
      message.error(msg);
      return false;
    } finally {
      hide();
      setToggleBusy((s) => ({ ...s, [adId]: false }));
    }
  };

  /** ============== Cột bảng con (Ads trong Campaign) ============== */
  const adColumns: ColumnsType<AdRow> = useMemo(
    () => [
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        align: "center",
        width: 120,
        render: (_: any, record: AdRow) => {
          const checked = record?.status?.toUpperCase?.() === "ACTIVE";
          const loading = !!toggleBusy[record.adId];
          const next = !checked;
          return (
            <Popconfirm
              title={checked ? "Tạm dừng quảng cáo?" : "Bật quảng cáo?"}
              description={checked ? "Quảng cáo sẽ dừng phân phối." : "Quảng cáo sẽ bắt đầu phân phối."}
              okText={checked ? "Tạm dừng" : "Bật"}
              cancelText="Huỷ"
              disabled={loading}
              onConfirm={async () => {
                const ok = await setAdStatusUI(record.adId, next);
                if (ok) {
                  // cập nhật trạng thái trong state lồng (campaignRows -> ads)
                  setCampaignRows((prev) =>
                    prev.map((camp) => ({
                      ...camp,
                      ads: (camp.ads || []).map((ad) =>
                        ad.adId === record.adId ? { ...ad, status: next ? "ACTIVE" : "PAUSED" } : ad
                      ),
                    }))
                  );
                }
              }}
            >
              <Switch
                checked={checked}
                loading={loading}
                checkedChildren="Bật"
                unCheckedChildren="Tắt"
                style={{ backgroundColor: checked ? "#52c41a" : undefined }}
              />
            </Popconfirm>
          );
        },
      },
      { title: "Ad ID", dataIndex: "adId", key: "adId", width: 200 },
      { title: "Tên quảng cáo", dataIndex: "name", key: "name", ellipsis: true },
      {
        title: "Hiển thị",
        key: "impressions",
        align: "right",
        width: 110,
        render: (_: any, r) => fmtInt(r?.data?.impressions),
      },
      {
        title: "Clicks",
        key: "clicks",
        align: "right",
        width: 100,
        render: (_: any, r) => fmtInt(r?.data?.clicks),
      },
      {
        title: "Chi phí / 1 clicks",
        key: "costPerClickNumber",
        align: "right",
        width: 100,
        render: (_: any, r) => fmtCurrency(r?.data?.costPerClickNumber),
      },


      {
        title: "Tin nhắn",
        key: "messages",
        align: "right",
        width: 100,
        render: (_: any, r) => fmtInt(r?.data?.messages),
      },

      {
        title: "Chi phí / 1 Tin nhắn",
        key: "costPerMessageNumber",
        align: "right",
        width: 100,
        render: (_: any, r) => fmtCurrency(r?.data?.costPerMessageNumber),
      },

      {
        title: "Chi phí (VNĐ)",
        key: "spend",
        align: "right",
        width: 130,
        render: (_: any, r) => fmtCurrency(r?.data?.spend),
      },
      {
        title: "CTR (%)",
        key: "ctr",
        align: "right",
        width: 100,
        render: (_: any, r) => fmtPercent(r?.data?.ctr, 2),
      },
      {
        title: "CPM (VNĐ)",
        key: "cpm",
        align: "right",
        width: 120,
        render: (_: any, r) => fmtCurrency(r?.data?.cpm),
      },
      {
        title: "Hành động",
        key: "action",
        width: 110,
        align: "center",
        render: (_, record) => (
          <button className="ads-button-glow" onClick={() => openReport(record)}>
            Chi tiết
          </button>
        ),
      },
    ],
    [toggleBusy]
  );

  /** ============== Cột bảng cha (Campaigns) ============== */
  const campaignColumns: ColumnsType<CampaignRow> = useMemo(
    () => [
      {
        title: "Chiến dịch",
        dataIndex: "name",
        key: "name",
        ellipsis: true,
      },
      {
        title: "Campaign ID",
        dataIndex: "campaignId",
        key: "campaignId",
        width: 200,
      },
      {
        title: "Objective",
        dataIndex: "objective",
        key: "objective",
        width: 160,
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 110,
        render: (v: string) => (
          <Tag color={v === "ACTIVE" ? "green" : v === "PAUSED" ? "orange" : "default"}>{v || "-"}</Tag>
        ),
      },
      {
        title: "Ngân sách/ngày (VNĐ)",
        dataIndex: "dailyBudget",
        key: "dailyBudget",
        align: "right",
        width: 170,
        render: (v) => fmtCurrency(v),
      },
      {
        title: "Hiển thị (Tổng)",
        key: "total_impressions",
        align: "right",
        width: 150,
        render: (_: any, r) => fmtInt(r?.totals?.impressions),
      },
      {
        title: "Clicks (Tổng)",
        key: "total_clicks",
        align: "right",
        width: 130,
        render: (_: any, r) => fmtInt(r?.totals?.clicks),
      },
      {
        title: "Chi phí (Tổng VNĐ)",
        key: "total_spend",
        align: "right",
        width: 170,
        render: (_: any, r) => fmtCurrency(r?.totals?.spend),
      },
      {
        title: "Ngày bắt đầu",
        key: "startTime",
        width: 160,
        render: (_: any, r) =>
          r?.startTime ? dayjs(r.startTime).format("DD/MM/YYYY") : "-",
      },
      {
        title: "Ngày kết thúc",
        key: "endTime",
        width: 160,
        render: (_: any, r) =>
          r?.endTime ? dayjs(r.endTime).format("DD/MM/YYYY") : "—",
      },
    ],
    []
  );

  /** ====== Mặc định expand tất cả chiến dịch có ads ====== */
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  useEffect(() => {
    const keys = (campaignRows || [])
      .filter((c) => (c.ads || []).length > 0)
      .map((c) => c.campaignRefId ?? c.campaignId);
    setExpandedRowKeys(keys);
  }, [campaignRows]);

  return (
    <Layout className="image-layout">
      <div style={{ maxWidth: "1600px", margin: "0 auto" }}>
        <h3 style={{ textAlign: "center", color: "#fff", marginBottom: 12 }}>
          {t("menu.ads_report") || "Báo cáo quảng cáo"}
        </h3>

        <Collapse
          className="custom-collapse-content"
          defaultActiveKey={["1"]}
          ghost
          expandIconPosition="start"
          expandIcon={({ isActive }) => (
            <CaretRightOutlined rotate={isActive ? 90 : 0} style={{ color: "#ffffff" }} />
          )}
        >
          <Panel
            key="1"
            header={<span style={{ color: "#ffffff", fontWeight: 600 }}>Báo cáo chiến dịch quảng cáo</span>}
          >
            <Card
              style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, color: "#fff" }}
              bodyStyle={{ padding: 12 }}
            >
              <div style={{ overflowX: "auto" }}>
                <Table<CampaignRow>
                  className="table-scroll dark-header-table"
                  rowKey={(r) => r.campaignRefId ?? r.campaignId}
                  columns={campaignColumns}
                  dataSource={campaignRows}
                  loading={isFetching}
                  pagination={{ pageSize: 8 }}
                  bordered
                  scroll={{ x: 1100, y: 700 }}
                  expandable={{
                    expandRowByClick: true,
                    columnWidth: 48,
                    rowExpandable: (record) => (record?.ads || []).length > 0,
                    expandedRowRender: (record) => (
                      <Table<AdRow>
                        rowKey={(r) => r.adId}
                        columns={adColumns}
                        dataSource={record.ads || []}
                        pagination={false}
                        size="small"
                        style={{ margin: 0, background: "#0b0b22" }}
                        scroll={{ x: 900 }}
                      />
                    ),
                    expandedRowKeys,
                    onExpandedRowsChange: (expandedKeys) => setExpandedRowKeys([...expandedKeys]),
                  }}
                />
              </div>
            </Card>
          </Panel>
        </Collapse>

        <Drawer
          open={isOpenReport}
          onClose={closeReport}
          width="98%"
          maskClosable={false}
          closeIcon={<CloseOutlined style={{ color: "#e2e8f0", fontSize: 18 }} />}
          title={t("dashboard.ads_report")}
          className="custom-dark-drawer"
          styles={{
            header: { backgroundColor: "#070719", color: "#f8fafc", borderBottom: "1px solid #334155" },
            body: {
              backgroundColor: "#070719",
              color: "#e2e8f0",
              padding: 24,
              maxHeight: "calc(100vh - 108px)",
              overflowY: "auto",
            },
          }}
        >
          {/* truyền adId vào DetailAdsReport như trước */}
          <DetailAdsReport id={detailId} detailRecord={detailRecord} pageId={null} />
        </Drawer>
      </div>
    </Layout>
  );
};

export default CampaignReport;
