import React, { useCallback, useEffect, useState } from "react";
import { Layout, Typography, Card, Table, Image, Row, Col, Spin, Drawer } from "antd";
import { Column } from "@ant-design/plots";
import { useSelector } from "react-redux";
import { IRootState } from "src/interfaces/app.interface";
import { useGetAccountQuery } from "src/store/api/accountApi";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import DetailAds from "../DetailAds";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: IRootState) => state.auth);
  const { data: accountDetailData } = useGetAccountQuery(user.id || "0", {
    skip: !user.id,
  });

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
          <Image width={40} src={post.full_picture} alt="media" />
        ) : (
          <Image width={40} src="https://via.placeholder.com/40" alt="no image" />
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

  const chartConfig = {
    data: barData,
    xField: "date",
    yField: "quantity",
    columnWidthRatio: 0.5,
    color: "#1890ff",
    label: {
      position: "top",
      style: { fill: "#000", fontSize: 12 },
      formatter: (datum: any) => (datum.quantity > 0 ? datum.quantity.toString() : ""),
    },
    xAxis: {
      title: { text: t("dashboard.chart.x_axis") },
      label: { autoRotate: false },
    },
    yAxis: {
      title: { text: t("dashboard.chart.y_axis") },
      label: {
        formatter: (value: number) => (value > 0 ? value.toString() : ""),
      },
    },
    height: 300,
    responsive: true,
  };

  const columns: ColumnsType<any> = [
    {
      title: t("dashboard.no"),
      dataIndex: "key",
      key: "key",
      width: 60,
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
      width: 250,
    },
    {
      title: t("dashboard.action"),
      key: "action",
      width: 60,
      align: "center",
      render: (_, record) => (
        <button
          style={{
            backgroundColor: "#D2E3FC",
            border: "1px solid #D2E3FC",
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 12,
            cursor: "pointer",
          }}
          onClick={() => handleOnClickDetail(record)}
        >
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
  ];

  return (
    <Layout
      style={{
        padding: 16,
        paddingTop: 24,
        background: "#fff",
        minHeight: "100vh",
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Title level={3} style={{ fontSize: "1.5rem" }}>
            {t("dashboard.posts")}
          </Title>
        </Col>

        <Col xs={24}>
          <Card style={{ marginBottom: 24 }}>
            <Column {...chartConfig} />
          </Card>
        </Col>

        <Col xs={24}>
          <Title level={4} style={{ marginBottom: 16, fontSize: "1.2rem" }}>
            {t("dashboard.post_list")}
          </Title>
          <div style={{ overflowX: "auto" }}>
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={postData}
                pagination={{ pageSize: 5 }}
                bordered
                scroll={{ x: "max-content" }}
              />
            </Spin>
          </div>
        </Col>
      </Row>
      <Drawer
        open={isOpen}
        onClose={handleOnCloseDrawer}
        width={"70%"}
        maskClosable={false}
        title={detailId ? t("dashboard.ads") : t("dashboard.ads_new")}
      >
        <DetailAds id={detailId} pageId={pageId ?? null} />
      </Drawer>
    </Layout>
  );
};

export default Dashboard;
