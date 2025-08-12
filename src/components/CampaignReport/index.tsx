import React, { useCallback, useEffect, useState } from "react";
import { Layout, Typography, Table, Image, Row, Col, Drawer, Collapse, Card } from "antd";
import { useSelector } from "react-redux";
import { IRootState } from "src/interfaces/app.interface";
import { useGetAccountQuery } from "src/store/api/accountApi";
import dayjs from "dayjs";
import DetailAds from "../DetailAds";
import { useTranslation } from "react-i18next";
import "./styles.scss";
import { CaretRightOutlined, CloseOutlined } from "@ant-design/icons";
import { useGetFacebookadsQuery } from "src/store/api/ticketApi";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
const { Panel } = Collapse;

const { Title } = Typography;

const CampaignReport = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: IRootState) => state.auth);
  const { data: accountDetailData } = useGetAccountQuery(user?.id || "0", {
    skip: !user?.id,
  });
  const [filter, setFilter] = useState<any>({ page: 1, pageSize: 3 });
  // Gọi API ngay khi component render
  const { data: adsData, isSuccess } = useGetFacebookadsQuery({ filter });

  console.log("adsData", adsData, isSuccess);


  const [postData, setPostData] = useState<any[]>([]);
  const [barData, setBarData] = useState<{ date: string; quantity: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [pageId, setPageId] = useState<string | undefined>(undefined);

  const handleOnClickDetail = (record: any) => {
    setDetailId(record?.id);
    setPageId(accountDetailData?.idPage);
    setIsOpen(true);
  };
  const handleOnCloseDrawer = () => {
    setDetailId(null);
    setIsOpen(false);
  };

  const fetchFacebookPosts = useCallback(async () => {
    if (!accountDetailData?.idPage || !accountDetailData?.accessToken) return;

    try {
      setLoading(true);

      const fields =
        "id,message,created_time,full_picture,permalink_url,likes.summary(true),comments.summary(true),shares";

      const response = await fetch(
        `https://graph.facebook.com/v19.0/${accountDetailData.idPage}/posts?fields=${encodeURIComponent(
          fields
        )}&access_token=${accountDetailData.accessToken}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Unknown error from Facebook API");
      }

      const posts = data?.data || [];

      const postsWithReach = await Promise.all(
        posts.map(async (post: any) => {
          try {
            const insightsRes = await fetch(
              `https://graph.facebook.com/v19.0/${post.id}/insights?metric=post_impressions_unique&access_token=${accountDetailData.accessToken}`
            );
            const insightsData = await insightsRes.json();
            const reach = insightsData?.data?.[0]?.values?.[0]?.value || 0;
            return { ...post, reach };
          } catch (err) {
            console.error("❌ Lỗi khi lấy reach:", err);
            return { ...post, reach: 0 };
          }
        })
      );

      const formattedPosts = postsWithReach.map((post: any, index: number) => ({
        key: (index + 1).toString(),
        id: post.id,
        media: post.full_picture ? (
          <Image width={68} src={post.full_picture} alt="media" />
        ) : (
          <Image width={68} src="https://via.placeholder.com/40" alt="no image" />
        ),
        caption: post.message || "(No content)",
        react: post.likes?.summary?.total_count || 0,
        comment: post.comments?.summary?.total_count || 0,
        share: post.shares?.count || 0,
        createdTime: dayjs(post.created_time).format("YYYY-MM-DD HH:mm:ss") || "",
        reach: post.reach || 0,
        url: post.full_picture,
      }));

      setPostData(formattedPosts);

      const monthlyCount = Array.from({ length: 12 }, (_, i) => ({
        date: (i + 1).toString().padStart(2, "0"),
        quantity: 0,
      }));
      posts.forEach((post: any) => {
        const month = new Date(post.created_time).getMonth();
        monthlyCount[month].quantity += 1;
      });

      console.log(`------------monthlyCount`, monthlyCount);


      setBarData(monthlyCount);
    } catch (err) {
      console.error("❌ Lỗi khi gọi Facebook API:", err);
    } finally {
      setLoading(false);
    }
  }, [accountDetailData?.idPage, accountDetailData?.accessToken]);

  useEffect(() => {
    fetchFacebookPosts();
  }, [fetchFacebookPosts]);


  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize(); // gọi ngay khi load

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dataSource = adsData?.data

  return (
    <Layout
      className="image-layout"
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h3 style={{ textAlign: "center", color: "#fff", marginBottom: 12 }}>
          {t("menu.ads_report")}
        </h3>
        <Row gutter={[16, 16]}>

           <Col xs={24}>
                      {/* <Title level={4} style={{ color: "#fff", marginBottom: 16, fontSize: "1.2rem" }}>
                        {t("dashboard.posts")}
                      </Title> */}
          
                      <Card
                        style={{
                          background: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: 12,
                          color: "#fff",
                        }}
                        bodyStyle={{ padding: 16 }}
                      >
                        <div style={{ marginBottom: 16, fontWeight: 600, color: "#E2E8F0" }}> {t("dashboard.posts")}</div>
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
            <Collapse
              className="custom-collapse-content"
              defaultActiveKey={["1"]}
              ghost
              expandIconPosition="start"
              expandIcon={({ isActive }) => (
                <CaretRightOutlined
                  rotate={isActive ? 90 : 0}
                  style={{ color: "#ffffff" }}
                />
              )}
            >
              <Panel
                key="1"
                header={
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>
                    Báo cáo chiến dịch quảng cáo
                  </span>
                }
              >
                <Table
                  className="table-scroll dark-header-table"
                  rowKey="id"
                  columns={[
                    {
                      title: "Ad ID",
                      dataIndex: "adId",
                      key: "adId",
                    },
                    {
                      title: "Chiến dịch",
                      dataIndex: "campaignName",
                      key: "campaignName",
                    },
                    {
                      title: "Hiển thị",
                      dataIndex: ["data", "impressions"],
                      key: "impressions",
                      align: "right",
                    },
                    {
                      title: "Clicks",
                      dataIndex: ["data", "clicks"],
                      key: "clicks",
                      align: "right",
                    },
                    {
                      title: "Chi phí (VNĐ)",
                      dataIndex: ["data", "spend"],
                      key: "spend",
                      align: "right",

                    },
                    {
                      title: "CTR (%)",
                      dataIndex: ["data", "ctr"],
                      key: "ctr",
                      align: "right",

                    },
                    {
                      title: "CPM (VNĐ)",
                      dataIndex: ["data", "cpm"],
                      key: "cpm",
                      align: "right",

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
                  ]}
                  dataSource={dataSource}
                  // dataSource={paymentHistory.map((item, index) => ({ ...item, index: index + 1 }))}
                  pagination={false}
                  loading={false}
                  scroll={{ x: 600, y: 380 }}
                />
              </Panel>
            </Collapse>
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
              borderBottom: "1px solid #334155"
            },
            body: {
              backgroundColor: "#070719",
              color: "#e2e8f0",
              padding: 24,
              maxHeight: "calc(100vh - 108px)",
              overflowY: "auto"
            }
          }}
        >
          <DetailAds id={detailId} pageId={pageId ?? null} />
        </Drawer>

      </div>
    </Layout>
  );
};

export default CampaignReport;
