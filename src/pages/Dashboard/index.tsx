import React from "react";
import { Layout, Typography, DatePicker, Card, Row, Col, Table, Image } from "antd";
import { Column } from "@ant-design/plots";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const barData = [
  { date: "01-June", quantity: 1 },
  { date: "02-June", quantity: 7 },
  { date: "03-June", quantity: 5 },
  { date: "04-June", quantity: 10 },
  { date: "05-June", quantity: 1 },
  { date: "06-June", quantity: 7 },
  { date: "07-June", quantity: 10 },
   { date: "04-June", quantity: 10 },
  { date: "05-June", quantity: 1 },
  { date: "06-June", quantity: 7 },
  { date: "07-June", quantity: 10 },
];

const chartConfig = {
  data: barData,
  xField: "date",
  yField: "quantity",
  columnWidthRatio: 0.5,
  color: "#1890ff",
  label: {
    position: "top",
    style: {
      fill: "#000",
      fontSize: 12,
    },
  },
  xAxis: {
    title: { text: "Date" },
    label: { autoRotate: false },
  },
  yAxis: {
    title: { text: "Quantity" },
  },
  height: 300,
};

const postData = [
  {
    key: "1",
    media: <Image width={40} src="https://via.placeholder.com/40" alt="media" />,
    caption: "Vườn địa đàng đang nổi hoa rầm rộ...",
    react: 100,
    comment: 50,
    share: 5,
  },
  {
    key: "2",
    media: <Image width={40} src="https://via.placeholder.com/40" alt="media" />,
    caption: "Có công mài sắt, quán lẩu thơm ngào ngạt...",
    react: "25,123",
    comment: "100,000,000",
    share: 100,
  },
];

const columns = [
  { title: "NO", dataIndex: "key", key: "key", width: 60 },
  { title: "Media", dataIndex: "media", key: "media", width: 80 },
  { title: "Caption", dataIndex: "caption", key: "caption" },
  { title: "React", dataIndex: "react", key: "react", width: 100 },
  { title: "Comment", dataIndex: "comment", key: "comment", width: 130 },
  { title: "Share", dataIndex: "share", key: "share", width: 80 },
];

const Dashboard: React.FC = () => {
  return (
    <Layout style={{ padding: "24px", background: "#fff", minHeight: "100vh" }}>
      <Title level={3}>Posts</Title>

      <Row justify="end" style={{ marginBottom: 16 }}>
        <Col>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>Từ ngày - Đến ngày</div>
          <RangePicker />
        </Col>
      </Row>
 // chat hiẻn thị số lượng abif post theo tháng tầm 10 tháng gần nhất
      <Card style={{ marginBottom: 32 }}>
        <Column {...chartConfig} />
      </Card>

      <Title level={4} style={{ marginBottom: 16 }}>Post list</Title>

      <Table columns={columns} dataSource={postData} pagination={false} bordered />
    </Layout>
  );
};

export default Dashboard;
