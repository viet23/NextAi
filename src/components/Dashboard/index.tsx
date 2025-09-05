import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Layout,
  Card,
  Table,
  Image,
  Row,
  Col,
  Spin,
  Drawer,
  Segmented,
  Switch,
  message,
} from "antd";

import { useSelector } from "react-redux";
import { IRootState } from "src/interfaces/app.interface";
import { useGetAccountQuery } from "src/store/api/accountApi";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import DetailAds from "../DetailAds";
import { useTranslation } from "react-i18next";
import "./styles.scss";
import { CloseOutlined } from "@ant-design/icons";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useGetFacebookadsQuery, useGetFacebookPostsGraphQuery } from "src/store/api/ticketApi";
import DetailAdsReport from "../DetailAdsReport";
import DetailAnalysis from "../DetailAnalysis";
import qs from "qs";
import axios from "axios";

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: IRootState) => state.auth);
  const { data: accountDetailData } = useGetAccountQuery(user?.id || "0", {
    skip: !user?.id,
  });

  // === View mode: 'posts' | 'ads'
  const [viewMode, setViewMode] = useState<"posts" | "ads">("posts");

  // ====== Ads list (giữ như cũ)
  const [filter, setFilter] = useState<any>({ page: 1, pageSize: 20 });
  const { data: adsData } = useGetFacebookadsQuery({ filter });
  const dataSource = adsData?.data;

  // ====== Posts list (mới: gọi BE thay vì Graph)
  const [postsFilter, setPostsFilter] = useState<{ page: number; pageSize: number; pageId?: string }>({
    page: 1,
    pageSize: 20,
    pageId: undefined,
  });

  useEffect(() => {
    if (accountDetailData?.idPage) {
      setPostsFilter((s) => ({ ...s, pageId: accountDetailData.idPage }));
    }
  }, [accountDetailData?.idPage]);

  const {
    data: postsRes,
    isFetching: isFetchingPosts,
  } = useGetFacebookPostsGraphQuery({});

  const [postData, setPostData] = useState<any[]>([]);
  const [barData, setBarData] = useState<{ date: string; quantity: number }[]>([]);

  useEffect(() => {
    if (!postsRes?.data) return;

    const formatted = postsRes.data.map((post: any, index: number) => ({
      key: post.key ?? String(index + 1),
      id: post.id,
      media: post.media ? (
        <Image width={68} src={post.media} alt="media" />
      ) : (
        <Image width={68} src="https://via.placeholder.com/40" alt="no image" />
      ),
      caption: post.caption || "(No content)",
      react: post.react ?? 0,
      comment: post.comment ?? 0,
      share: post.share ?? 0,
      createdTime: post.createdTime ? dayjs(post.createdTime).format("YYYY-MM-DD HH:mm:ss") : "",
      reach: post.reach ?? 0,
      url: post.url || post.media || null,
      permalink_url: post.permalink_url || null,
    }));

    setPostData(formatted);
    setBarData(postsRes.meta?.monthlyCount || []);
  }, [postsRes]);

  // ====== Drawers / Details
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenAnl, setIsOpenAnl] = useState(false);
  const [isOpenReport, setIsOpenReport] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailRecord, setDetailRecord] = useState<any | null>(null);
  const [pageId, setPageId] = useState<string | undefined>(undefined);
  const [postRecot, setPostRecot] = useState<any[]>([]);

  const handleOnClickDetail = (record: any) => {
    setPostRecot(record);
    setDetailId(record?.id ?? null);
    setPageId(accountDetailData?.idPage);
    setIsOpen(true);
  };

  const handleOnCloseDrawer = () => {
    setDetailId(null);
    setIsOpen(false);
  };

  const handleOnClickDetailAnl = (record: any) => {
    setPostRecot(record);
    setDetailId(record?.id ?? null);
    setPageId(accountDetailData?.idPage);
    setIsOpenAnl(true);
  };

  const handleOnCloseDrawerAnl = () => {
    setDetailId(null);
    setIsOpenAnl(false);
  };

  const handleOnClickDetailReport = (record: any) => {
    setDetailRecord(record);
    setDetailId(record?.adId ?? null);
    setPageId(accountDetailData?.idPage);
    setIsOpenReport(true);
  };

  const handleOnCloseDrawerReport = () => {
    setDetailRecord(null);
    setDetailId(null);
    setIsOpenReport(false);
  };

  // ====== Đổi trạng thái Ad (tạm thời vẫn gọi Graph trực tiếp — khuyến nghị chuyển BE sau)
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
      console.error("❌ Lỗi khi đổi trạng thái quảng cáo:", error?.response?.data || error.message);
      message.error(error?.response?.data?.error?.message || "Không thể cập nhật trạng thái quảng cáo");
      return false;
    }
  }

  // ====== Columns
  const postColumns: ColumnsType<any> = useMemo(
    () => [
      {
        title: t("dashboard.no"),
        dataIndex: "key",
        key: "key",
        width: 30,
        responsive: ["md"],
      },
      {
        title: t("dashboard.media"),
        dataIndex: "media",
        key: "media",
        width: 70,
        align: "center",
      },
      {
        title: t("dashboard.caption"),
        dataIndex: "caption",
        key: "caption",
        width: typeof window !== "undefined" && window.innerWidth < 768 ? 180 : 250,
        render: (text: string) => {
          const shortText = text?.length > 100 ? text.slice(0, 100) + "..." : text;
          return <span title={text}>{shortText}</span>;
        },
      },
      {
        title: t("dashboard.reach"),
        dataIndex: "reach",
        key: "reach",
        width: 90,
        align: "center",
      },
      {
        title: t("dashboard.react"),
        dataIndex: "react",
        key: "react",
        width: 80,
        align: "center",
      },
      {
        title: t("dashboard.comment"),
        dataIndex: "comment",
        key: "comment",
        width: 90,
        align: "center",
      },
      {
        title: t("dashboard.share"),
        dataIndex: "share",
        key: "share",
        width: 70,
        align: "center",
      },
      {
        title: "Phân tích bài viết",
        key: "action_anl",
        width: 100,
        align: "center",
        render: (_, record) => (
          <button className="ads-button-glow" onClick={() => handleOnClickDetailAnl(record)}>
            Phân tích
          </button>
        ),
      },
      {
        title: t("dashboard.action"),
        key: "action",
        width: 100,
        align: "center",
        render: (_, record) => (
          <button className="ads-button-glow" onClick={() => handleOnClickDetail(record)}>
            {t("dashboard.ads_button")}
          </button>
        ),
      },
      {
        title: t("dashboard.created_time"),
        dataIndex: "createdTime",
        key: "createdTime",
        width: 120,
        align: "center",
      },
    ],
    [t]
  );

  const adsColumns: ColumnsType<any> = useMemo(
    () => [
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        align: "center",
        width: 110,
        render: (_: any, record: any) => {
          const checked = record?.status?.toUpperCase?.() === "ACTIVE";
          const onToggle = async (nextChecked: boolean) => {
            try {
              await setAdStatus(record.adId, nextChecked);
              record.status = nextChecked ? "ACTIVE" : "PAUSED";
              message.success(nextChecked ? "Đã bật quảng cáo" : "Đã tắt quảng cáo");
            } catch (err: any) {
              console.error(err);
              message.error(err?.response?.data?.error?.message || "Không thể cập nhật trạng thái quảng cáo");
            }
          };
          return (
            <Switch
              checked={checked}
              checkedChildren="Bật"
              unCheckedChildren="Tắt"
              onChange={onToggle}
              style={{ backgroundColor: checked ? "#52c41a" : undefined }}
            />
          );
        },
      },
      {
        title: "Ad ID",
        dataIndex: "adId",
        key: "adId",
        width: 160,
      },
      {
        title: "Chiến dịch",
        dataIndex: "campaignName",
        key: "campaignName",
        width: 220,
        ellipsis: true,
      },
      {
        title: "Hiển thị",
        dataIndex: ["data", "impressions"],
        key: "impressions",
        align: "right",
        width: 90,
      },
      {
        title: "Clicks",
        dataIndex: ["data", "clicks"],
        key: "clicks",
        align: "right",
        width: 80,
      },
      {
        title: "Chi phí (VNĐ)",
        dataIndex: ["data", "spend"],
        key: "spend",
        align: "right",
        width: 110,
      },
      {
        title: "CTR (%)",
        dataIndex: ["data", "ctr"],
        key: "ctr",
        align: "right",
        width: 80,
      },
      {
        title: "CPM (VNĐ)",
        dataIndex: ["data", "cpm"],
        key: "cpm",
        align: "right",
        width: 90,
      },
      {
        title: t("dashboard.action"),
        key: "action",
        width: 100,
        align: "center",
        render: (_, record) => (
          <button className="ads-button-glow" onClick={() => handleOnClickDetailReport(record)}>
            Chi tiết
          </button>
        ),
      },
    ],
    [t]
  );

  // ====== Responsive
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Layout className="image-layout">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h3 style={{ textAlign: "center", color: "#fff", marginBottom: 12 }}>
          {t("dashboard.title")}
        </h3>

        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 12,
                color: "#fff",
              }}
              bodyStyle={{ padding: 16 }}
            >
              <div style={{ marginBottom: 16, fontWeight: 600, color: "#E2E8F0" }}>
                {t("dashboard.posts")}
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={barData}>
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: "#0f172a", borderColor: "#334155" }} />
                  <Line type="monotone" dataKey="quantity" stroke="#6cc3ff" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col xs={24}>
            <div className="dash-header only-segmented">
              <Segmented
                className="segFix"
                size="large"
                value={viewMode}
                onChange={(val) => setViewMode(val as "posts" | "ads")}
                options={[
                  { label: t("dashboard.post_list") || "Danh sách bài viết", value: "posts" },
                  { label: t("dashboard.ads_report") || "Báo cáo quảng cáo", value: "ads" },
                ]}
              />
            </div>

            {viewMode === "posts" ? (
              <div style={{ overflowX: "auto" }}>
                <Spin spinning={isFetchingPosts}>
                  {isMobile ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        maxWidth: "100%",
                        overflowX: "hidden",
                      }}
                    >
                      {postData.map((item) => (
                        <Card
                          key={item.id}
                          style={{
                            background: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: 12,
                            color: "#e2e8f0",
                            fontSize: 13,
                            maxWidth: 380,
                          }}
                          bodyStyle={{ padding: 12 }}
                        >
                          <Row gutter={[8, 8]}>
                            <Col span={24}>
                              <div style={{ marginBottom: 8 }}>
                                <strong>{t("dashboard.media")}:</strong>
                                <br />
                                <Image
                                  src={item.url}
                                  alt="media"
                                  style={{
                                    borderRadius: 8,
                                    width: "100%",
                                    maxWidth: 350,
                                    height: "auto",
                                  }}
                                />
                              </div>

                              <div style={{ marginBottom: 4 }}>
                                <strong>{t("dashboard.caption")}:</strong>
                                <div style={{ paddingLeft: 8, maxWidth: 350, wordWrap: "break-word" }}>
                                  {item.caption?.length > 100 ? item.caption.slice(0, 100) + "..." : item.caption}
                                </div>
                              </div>

                              <div style={{ marginTop: 8, display: "flex", justifyContent: "center", gap: 8 }}>
                                <button className="ads-button-glow" onClick={() => handleOnClickDetailAnl(item)}>
                                  Phân tích
                                </button>
                                <button className="ads-button-glow" onClick={() => handleOnClickDetail(item)}>
                                  {t("dashboard.ads_button")}
                                </button>
                              </div>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Table
                      columns={postColumns}
                      dataSource={postData}
                      pagination={{
                        current: postsFilter.page,
                        pageSize: postsFilter.pageSize,
                        total: postsRes?.meta?.total ?? 0,
                        onChange: (page, pageSize) => setPostsFilter((s) => ({ ...s, page, pageSize })),
                      }}
                      bordered
                      scroll={{ x: "max-content" }}
                      className="dark-header-table"
                    />
                  )}
                </Spin>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <Table
                  columns={adsColumns}
                  dataSource={dataSource}
                  rowKey={(r) => r?.adId || r?.id}
                  pagination={{ pageSize: 10 }}
                  bordered
                  scroll={{ x: "max-content" }}
                  className="dark-header-table"
                />
              </div>
            )}
          </Col>
        </Row>

        <Drawer
          open={isOpen}
          onClose={handleOnCloseDrawer}
          width="98%"
          maskClosable={false}
          closeIcon={<CloseOutlined style={{ color: "#e2e8f0", fontSize: 18 }} />}
          title={detailId ? t("dashboard.ads") : t("dashboard.ads_new")}
          className="custom-dark-drawer"
          styles={{
            header: {
              backgroundColor: "#070719",
              color: "#f8fafc",
              borderBottom: "1px solid #334155",
            },
            body: {
              backgroundColor: "#070719",
              color: "#e2e8f0",
              padding: 24,
              maxHeight: "calc(100vh - 108px)",
              overflowY: "auto",
            },
          }}
        >
          <DetailAds id={detailId} postRecot={postRecot} pageId={pageId ?? null} />
        </Drawer>

        <Drawer
          open={isOpenAnl}
          onClose={handleOnCloseDrawerAnl}
          width="98%"
          maskClosable={false}
          closeIcon={<CloseOutlined style={{ color: "#e2e8f0", fontSize: 18 }} />}
          title={detailId ? t("dashboard.analysis") : t("dashboard.ads_new")}
          className="custom-dark-drawer"
          styles={{
            header: {
              backgroundColor: "#070719",
              color: "#f8fafc",
              borderBottom: "1px solid #334155",
            },
            body: {
              backgroundColor: "#070719",
              color: "#e2e8f0",
              padding: 24,
              maxHeight: "calc(100vh - 108px)",
              overflowY: "auto",
            },
          }}
        >
          <DetailAnalysis id={detailId} postRecot={postRecot} pageId={pageId ?? null} />
        </Drawer>

        <Drawer
          open={isOpenReport}
          onClose={handleOnCloseDrawerReport}
          width="98%"
          maskClosable={false}
          closeIcon={<CloseOutlined style={{ color: "#e2e8f0", fontSize: 18 }} />}
          title={detailId ? t("dashboard.ads_report") : t("dashboard.ads_new")}
          className="custom-dark-drawer"
          styles={{
            header: {
              backgroundColor: "#070719",
              color: "#f8fafc",
              borderBottom: "1px solid #334155",
            },
            body: {
              backgroundColor: "#070719",
              color: "#e2e8f0",
              padding: 24,
              maxHeight: "calc(100vh - 108px)",
              overflowY: "auto",
            },
          }}
        >
          <DetailAdsReport id={detailId} detailRecord={detailRecord} pageId={pageId ?? null} />
        </Drawer>
      </div>
    </Layout>
  );
};

export default Dashboard;
