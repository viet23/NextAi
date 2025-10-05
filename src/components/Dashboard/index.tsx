import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Layout,
  Card,
  Table,
  Image,
  Row,
  Col,
  Spin,
  Drawer,
  message,
  Button,
  Checkbox,
} from "antd";
import { useSelector } from "react-redux";
import { IRootState } from "src/interfaces/app.interface";
import { useGetAccountQuery } from "src/store/api/accountApi";
import type { ColumnsType } from "antd/es/table";
import type { TableRowSelection } from "antd/es/table/interface";
import dayjs from "dayjs";
import DetailAds from "../DetailAds";
import DetailAnalysis from "../DetailAnalysis";
import { useTranslation } from "react-i18next";
import "./styles.scss";
import { CloseOutlined, ThunderboltOutlined } from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useGetFacebookPostsGraphQuery } from "src/store/api/ticketApi";
import AutoPostModal from "../AutoPostModal";
import { useGetFacebookPageViewsQuery } from "src/store/api/facebookApi";

type PostRow = {
  key: string;
  id: string;
  media: React.ReactNode;
  caption: string;
  react: number;
  comment: number;
  share: number;
  createdTime: string;
  reach: number;
  url?: string | null;
  permalink_url?: string | null;
  // dữ liệu gốc để truyền về DetailAds khi cần
  __raw?: any;
};

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: IRootState) => state.auth);
  const [showModal, setShowModal] = useState(false);

  // Account detail (để lấy idPage)
  const { data: accountDetailData } = useGetAccountQuery(user?.id || "0", {
    skip: !user?.id,
  });

  // ====== Posts list (call BE thay vì Graph trực tiếp)
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

  const [postData, setPostData] = useState<PostRow[]>([]);
  const [barData, setBarData] = useState<{ date: string; quantity: number }[]>([]);

  useEffect(() => {
    if (!postsRes?.data) return;

    const formatted: PostRow[] = postsRes.data.map((post: any, index: number) => ({
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
      __raw: post,
    }));

    setPostData(formatted);
    setBarData(postsRes.meta?.monthlyCount || []);
  }, [postsRes]);

  const days = 14;
  const {
    data: pageViewsResp,
    isFetching: isViewsLoading,
    error: viewsError,
  } = useGetFacebookPageViewsQuery(
    accountDetailData?.idPage ? { days, pageId: accountDetailData.idPage } : { days },
    { skip: !accountDetailData?.idPage }
  );

  useEffect(() => {
    if (isViewsLoading) return;

    if (viewsError) {
      console.error("❌ Lỗi khi lấy dữ liệu lượt xem page:", viewsError);
      setShowModal(true);
      return;
    }

    const items =
      pageViewsResp?.ok && Array.isArray(pageViewsResp.data) ? pageViewsResp.data : [];

    setShowModal(items.length === 0);
  }, [pageViewsResp, viewsError, isViewsLoading]);

  // ====== Drawers / Details
  const [isOpenCreateAds, setIsOpenCreateAds] = useState(false);
  const [isOpenAnl, setIsOpenAnl] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [pageId, setPageId] = useState<string | undefined>(undefined);

  // ====== MULTI-SELECT state
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<any[]>([]);

  const onSelectionChange = useCallback(
    (keys: React.Key[], rows: PostRow[]) => {
      setSelectedRowKeys(keys);
      // Lưu dữ liệu gốc (__raw) để truyền sang DetailAds
      const raws = rows.map((r) => r.__raw ?? r);
      setSelectedPosts(raws);
    },
    []
  );

  const rowSelection: TableRowSelection<PostRow> = {
    selectedRowKeys,
    onChange: onSelectionChange,
    preserveSelectedRowKeys: true,
  };

  // Mở drawer tạo quảng cáo từ các post đã chọn
  const openCreateAdsDrawer = () => {
    if (selectedPosts.length === 0) {
      message.warning("Hãy chọn ít nhất 1 bài viết để tạo quảng cáo.");
      return;
    }
    setPageId(accountDetailData?.idPage);
    setIsOpenCreateAds(true);
  };

  // Phân tích bài viết (giữ như cũ – theo từng bài)
  const handleOnClickDetailAnl = (record: PostRow) => {
    setDetailId(record?.id ?? null);
    setPageId(accountDetailData?.idPage);
    setIsOpenAnl(true);
  };

  const handleOnCloseDrawerCreateAds = () => {
    setIsOpenCreateAds(false);
  };

  const handleOnCloseDrawerAnl = () => {
    setDetailId(null);
    setIsOpenAnl(false);
  };

  // ====== Columns (Posts)
  const postColumns: ColumnsType<PostRow> = useMemo(
    () => [
      {
        title: t("dashboard.no"),
        dataIndex: "key",
        key: "key",
        width: 50,
        responsive: ["md"],
      },
      {
        title: t("dashboard.media"),
        dataIndex: "media",
        key: "media",
        width: 90,
        align: "center",
      },
      {
        title: t("dashboard.caption"),
        dataIndex: "caption",
        key: "caption",
        width: typeof window !== "undefined" && window.innerWidth < 768 ? 220 : 320,
        render: (text: string) => {
          const shortText = text?.length > 60 ? text.slice(0, 60) + "..." : text;
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
        width: 90,
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
        width: 90,
        align: "center",
      },
      {
        title: "Phân tích bài viết",
        key: "action_anl",
        width: 120,
        align: "center",
        render: (_, record) => (
          <button className="ads-button-glow" onClick={() => handleOnClickDetailAnl(record)}>
            Phân tích
          </button>
        ),
      },
      // ❌ Bỏ nút tạo quảng cáo theo từng bài – chuyển sang chọn nhiều + thanh công cụ
      {
        title: t("dashboard.created_time"),
        dataIndex: "createdTime",
        key: "createdTime",
        width: 150,
        align: "center",
      },
    ],
    [t]
  );

  // ====== Responsive (hiển thị dạng thẻ trên mobile) + checkbox chọn
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Helpers cho mobile chọn/bỏ
  const isCheckedMobile = (id: string) => selectedRowKeys.includes(id);
  const toggleSelectMobile = (row: PostRow) => {
    const exists = isCheckedMobile(row.id);
    if (exists) {
      const newKeys = selectedRowKeys.filter((k) => k !== row.id);
      const newPosts = selectedPosts.filter((p: any) => (p.id ?? p?.__raw?.id) !== row.id);
      setSelectedRowKeys(newKeys);
      setSelectedPosts(newPosts);
    } else {
      setSelectedRowKeys([...selectedRowKeys, row.id]);
      setSelectedPosts([...(selectedPosts as any[]), row.__raw ?? row]);
    }
  };

  return (
    <Layout className="image-layout">
      <AutoPostModal visible={showModal} onClose={() => setShowModal(false)} />
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h3 style={{ textAlign: "center", color: "#fff", marginBottom: 12 }}>
          {t("dashboard.title")}
        </h3>

        {/* Thanh công cụ: Tạo quảng cáo từ các bài đã chọn */}
        <Row
          gutter={[12, 12]}
          style={{
            marginBottom: 12,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Col>
            <div style={{ color: "#cbd5e1" }}>
              Đã chọn <b>{selectedRowKeys.length}</b> bài viết
            </div>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              disabled={selectedRowKeys.length === 0}
              onClick={openCreateAdsDrawer}
            >
              Tạo quảng cáo
            </Button>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Chart: Số bài theo tháng */}
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

          {/* Bảng/Thẻ bài viết */}
          <Col xs={24}>
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
                          maxWidth: 420,
                          position: "relative",
                        }}
                        bodyStyle={{ padding: 12 }}
                      >
                        <div style={{ position: "absolute", top: 10, right: 10 }}>
                          <Checkbox
                            checked={isCheckedMobile(item.id)}
                            onChange={() => toggleSelectMobile(item)}
                          />
                        </div>

                        <Row gutter={[8, 8]}>
                          <Col span={24}>
                            <div style={{ marginBottom: 8 }}>
                              <strong>{t("dashboard.media")}:</strong>
                              <br />
                              <Image
                                src={item.url || undefined}
                                alt="media"
                                style={{
                                  borderRadius: 8,
                                  width: "100%",
                                  maxWidth: 380,
                                  height: "auto",
                                }}
                              />
                            </div>

                            <div style={{ marginBottom: 4 }}>
                              <strong>{t("dashboard.caption")}:</strong>
                              <div style={{ paddingLeft: 8, maxWidth: 380, wordWrap: "break-word" }}>
                                {item.caption?.length > 120 ? item.caption.slice(0, 120) + "..." : item.caption}
                              </div>
                            </div>

                            <div
                              style={{
                                marginTop: 8,
                                display: "flex",
                                justifyContent: "center",
                                gap: 8,
                                flexWrap: "wrap",
                              }}
                            >
                              <button className="ads-button-glow" onClick={() => handleOnClickDetailAnl(item)}>
                                Phân tích
                              </button>
                              {/* Không còn nút tạo quảng cáo theo từng bài */}
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Table<PostRow>
                    rowSelection={rowSelection}
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
                    rowKey={(r) => r.id}
                  />
                )}
              </Spin>
            </div>
          </Col>
        </Row>

        {/* Drawer TẠO ADS từ nhiều bài viết */}
        <Drawer
          open={isOpenCreateAds}
          onClose={handleOnCloseDrawerCreateAds}
          width="98%"
          maskClosable={false}
          closeIcon={<CloseOutlined style={{ color: "#e2e8f0", fontSize: 18 }} />}
          title={`Tạo quảng cáo (${selectedRowKeys.length} bài đã chọn)`}
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
          {/* ✅ Truyền mảng bài viết đã chọn sang DetailAds */}
          <DetailAds
            id={null}
            postRecot={null}
            selectedPosts={selectedPosts} // <-- thêm prop mới cho nhiều bài
            pageId={pageId ?? null}
          />
        </Drawer>

        {/* Drawer PHÂN TÍCH bài (theo từng bài, giữ nguyên) */}
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
          <DetailAnalysis id={detailId} postRecot={null} pageId={pageId ?? null} />
        </Drawer>
      </div>
    </Layout>
  );
};

export default Dashboard;
