import React, { useEffect, useState } from "react";
import {
  Layout,
  Typography,
  Card,
  Table,
  Image,
  Row,
  Col,
  Spin,
} from "antd";
import { Column } from "@ant-design/plots";
import { useSelector } from "react-redux";
import { IRootState } from "src/interfaces/app.interface";
import { useGetAccountQuery } from "src/store/api/accountApi";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

const { Title } = Typography;

const columns: ColumnsType<any> = [
  {
    title: "NO",
    dataIndex: "key",
    key: "key",
    width: 60,
    responsive: ["md"],
  },
  {
    title: "Media",
    dataIndex: "media",
    key: "media",
    width: 70,
    align: "center",
  },
  {
    title: "Caption",
    dataIndex: "caption",
    key: "caption",
    width: 250,
  },
  {
    title: "Action",
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
        onClick={() => {
          console.log("📢 Quảng cáo bài:", record);
          // TODO: Thực hiện logic quảng cáo tại đây (ví dụ mở modal)
        }}
      >
       Advertisement
      </button>
    ),
  },
  {
    title: "Created time",
    dataIndex: "createdTime",
    key: "createdTime",
    width: 120,
    align: "center",
  },
  {
    title: "Reach",
    dataIndex: "reach",
    key: "reach",
    width: 90,
    align: "center",
  },
  {
    title: "React",
    dataIndex: "react",
    key: "react",
    width: 80,
    align: "center",
  },
  {
    title: "Comment",
    dataIndex: "comment",
    key: "comment",
    width: 90,
    align: "center",
  },
  {
    title: "Share",
    dataIndex: "share",
    key: "share",
    width: 70,
    align: "center",
  },
];


const Dashboard = () => {
  const { user } = useSelector((state: IRootState) => state.auth);
  const { data: accountDetailData } = useGetAccountQuery(user.id || "0", {
    skip: !user.id,
  });

  const [postData, setPostData] = useState<any[]>([]);
  const [barData, setBarData] = useState<{ date: string; quantity: number }[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFacebookPosts = async () => {
      try {
        setLoading(true);

        const fields =
          "id,message,created_time,full_picture,permalink_url,likes.summary(true),comments.summary(true),shares";

        const response = await fetch(
          `https://graph.facebook.com/v19.0/${accountDetailData?.idPage}/posts?fields=${encodeURIComponent(
            fields
          )}&access_token=${accountDetailData?.accessToken}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.error?.message || "Unknown error from Facebook API"
          );
        }

        const posts = data?.data || [];

        const postsWithReach = await Promise.all(
          posts.map(async (post: any) => {
            try {
              const insightsRes = await fetch(
                `https://graph.facebook.com/v19.0/${post.id}/insights?metric=post_impressions_unique&access_token=${accountDetailData?.accessToken}`
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
    };

    if (accountDetailData?.idPage && accountDetailData?.accessToken) {
      fetchFacebookPosts();
    }
  }, [accountDetailData?.idPage, accountDetailData?.accessToken]);

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
    title: { text: "Date" },
    label: { autoRotate: false },
  },
  yAxis: {
    title: { text: "Quantity" },
    label: {
      formatter: (value: number) => (value > 0 ? value.toString() : ""),
    },
  },
  height: 300,
  responsive: true,
};

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
            Posts
          </Title>
        </Col>

        <Col xs={24}>
          <Card style={{ marginBottom: 24 }}>
            <Column {...chartConfig} />
          </Card>
        </Col>

        <Col xs={24}>
          <Title level={4} style={{ marginBottom: 16, fontSize: "1.2rem" }}>
            Post list
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
    </Layout>
  );
};

export default Dashboard;
