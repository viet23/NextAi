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

const { Panel } = Collapse;
const { Title } = Typography;

const CampaignReport: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: IRootState) => state.auth);
  useGetAccountQuery(user?.id || "0", { skip: !user?.id }); // giữ để đồng bộ session nếu cần

  // ====== Lấy danh sách ads
  const [filter] = useState<any>({ page: 1, pageSize: 100 });
  const { data: adsData, isFetching } = useGetFacebookadsQuery({ filter });

  // ✅ Local state để không mutate RTK object
  const [adsRows, setAdsRows] = useState<any[]>([]);
  useEffect(() => {
    setAdsRows(adsData?.data ?? []);
  }, [adsData?.data]);

  // ====== Drawer chi tiết báo cáo
  const [isOpenReport, setIsOpenReport] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailRecord, setDetailRecord] = useState<any | null>(null);

  const openReport = (record: any) => {
    setDetailRecord(record);
    setDetailId(record?.adId ?? null);
    setIsOpenReport(true);
  };
  const closeReport = () => {
    setDetailRecord(null);
    setDetailId(null);
    setIsOpenReport(false);
  };

  // ====== Đổi trạng thái ad qua BE
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

  // ====== Columns
  const adsColumns: ColumnsType<any> = useMemo(
    () => [
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        align: "center",
        width: 120,
        render: (_: any, record: any) => {
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
                  setAdsRows((prev) =>
                    prev.map((r) =>
                      (r?.adId || r?.id) === (record?.adId || record?.id)
                        ? { ...r, status: next ? "ACTIVE" : "PAUSED" }
                        : r
                    )
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
      { title: "Ad ID", dataIndex: "adId", key: "adId", width: 160 },
      { title: "Chiến dịch", dataIndex: "campaignName", key: "campaignName", width: 240, ellipsis: true },
      { title: "Hiển thị", dataIndex: ["data", "impressions"], key: "impressions", align: "right", width: 100 },
      { title: "Clicks", dataIndex: ["data", "clicks"], key: "clicks", align: "right", width: 90 },
      { title: "Chi phí (VNĐ)", dataIndex: ["data", "spend"], key: "spend", align: "right", width: 120 },
      { title: "CTR (%)", dataIndex: ["data", "ctr"], key: "ctr", align: "right", width: 90 },
      { title: "CPM (VNĐ)", dataIndex: ["data", "cpm"], key: "cpm", align: "right", width: 100 },
      {
        title: t("dashboard.action"),
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
    [t, toggleBusy]
  );

  return (
    <Layout className="image-layout">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
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
                <Table
                  className="table-scroll dark-header-table"
                  rowKey={(r) => r?.adId || r?.id}
                  columns={adsColumns}
                  dataSource={adsRows}
                  loading={isFetching}
                  pagination={{ pageSize: 10 }}
                  bordered
                  // Tăng chiều cao vùng cuộn: 1000px
                  scroll={{ x: 800, y: 1000 }}
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
          <DetailAdsReport id={detailId} detailRecord={detailRecord} pageId={null} />
        </Drawer>
      </div>
    </Layout>
  );
};

export default CampaignReport;
