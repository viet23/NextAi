import {
  CaretRightOutlined,
  DownloadOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import "./credits.scss";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Layout,
  message,
  Modal,
  Row,
  Select,
  Switch,
  Table,
  Radio, // ⬅️ thêm
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import { useGetAccountQuery } from "src/store/api/accountApi";
import { useGetRoleGroupsQuery } from "src/store/api/roleApi";
import { useTranslation } from "react-i18next";
import { Collapse } from "antd";
import { useSelector } from "react-redux";
import { IRootState } from "src/interfaces/app.interface";
import { useSendCreditsMutation } from "src/store/api/email";
import { useGetCreditQuery } from "src/store/api/ticketApi";
import dayjs from "dayjs";

const { Panel } = Collapse;

interface FormValues {
  credits: string | number;
  vnd: string | number;
}

const CreditsPage = () => {
  const { user } = useSelector((state: IRootState) => state.auth || { user: undefined });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const [form] = Form.useForm<FormValues>();
  const [userGroups, setUserGroups] = useState<undefined | any[]>([]);
  const [sendEmail, { isLoading }] = useSendCreditsMutation();
  const { data: creditData } = useGetCreditQuery({});
  console.log("Credit Data:", creditData);

  const paymentHistory = creditData?.map((item: any) => ({
    status: item?.status,
    id: item?.id,
    date: item?.paymentDate ? dayjs(item.paymentDate).format("HH:mm - DD/MM/YYYY") : "",
    amount: typeof item?.amountPaidVnd === "number" ? item.amountPaidVnd.toLocaleString("vi-VN") : "",
    credits: typeof item?.creditsPurchased === "number" ? item.creditsPurchased.toLocaleString("vi-VN") : ""
  }));

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data: accountDetailData } = useGetAccountQuery(params.id || "0", {
    skip: !params.id,
  });
  const { data: roleGroupsData, isFetching: isRoleGroupsFetching } =
    useGetRoleGroupsQuery({});

  const [credits, setCredits] = useState<number | undefined>(user?.credits); // hiển thị tổng credits

  useEffect(() => {
    if (roleGroupsData && accountDetailData) {
      setUserGroups(
        roleGroupsData?.map((group: any) => ({
          ...group,
          checked: accountDetailData?.groups?.some((i: any) => i?.id === group.id),
        }))
      );
    }
  }, [roleGroupsData, accountDetailData]);

  // ====== Giá động từ gói chuẩn 500 credits = 179.000đ ======
  const BASE_CREDITS = 500;
  const BASE_PRICE = 179_000; // VND

  const priceForCredits = (c: number) => {
    const unit = BASE_PRICE / BASE_CREDITS; // đơn giá theo credit
    // làm tròn đến 1.000đ cho đẹp
    return Math.round((unit * c) / 1000) * 1000;
  };

  const creditPackages = [200, 500, 1000, 2000, 3000].map((c) => ({
    credits: c,
    price: c === 500 ? BASE_PRICE : priceForCredits(c),
  }));

  const [selectedPackage, setSelectedPackage] = useState(creditPackages.find(p => p.credits === 500)!);

  // đồng bộ vào form mỗi khi đổi gói
  useEffect(() => {
    form.setFieldsValue({
      credits: selectedPackage.credits,
      vnd: selectedPackage.price.toLocaleString("vi-VN"),
    });
  }, [selectedPackage, form]);

  const handleBuyCredits = async () => {
    // Lấy giá trị thực (không format) để gửi backend
    const payload = {
      credits: String(selectedPackage.credits),
      vnd: String(selectedPackage.price),
    };

    try {
      await sendEmail(payload as any).unwrap();

      console.log("Đã click Mua credits", payload);

      message.success("Giao dịch thành công! Admin sẽ liên hệ thanh toán credits.");
      setIsModalVisible(false);
      window.location.reload();
    } catch (err) {
      console.error("❌ Failed to send form:", err);
      message.error("Gửi thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <PageTitleHOC title="Chi tiết tài khoản Credits">
      <Layout style={{ minHeight: "100vh", background: "#0f172a" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h3
            style={{
              textAlign: "center",
              color: "#fff",
              marginBottom: 12,
              marginTop: 24,
            }}
          >
            {t("credits.user_credits")}
          </h3>

          <Card className="accountDetail" style={{ marginBottom: 24 }}>
            <Row gutter={[24, 16]} justify="space-between" align="middle">
              <Col>
                <div style={{ fontSize: 32, fontWeight: 600, color: "#fff" }}>
                  {typeof credits === "number" ? credits.toLocaleString("vi-VN") : 0} <span style={{ fontSize: 16, marginLeft: 6 }}>💎</span>
                </div>
              </Col>
              <Col>
                <Button
                  size="large"
                  className="btn-text"
                  onClick={() => setIsModalVisible(true)}
                >
                  {t("credits.buy_more")}
                </Button>
              </Col>
            </Row>
          </Card>

          <Card className="accountDetail">
            <Collapse
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
                    {t("credits.payment_history")}
                  </span>
                }
              >
                <Flex
                  justify="space-between"
                  align="center"
                  style={{ marginBottom: 16 }}
                >
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>
                    Thông tin thanh toán
                  </span>

                  <Select defaultValue="3_months" style={{ width: 160 }}>
                    <Select.Option value="3_months">
                      {t("credits.last_3_months")}
                    </Select.Option>
                    <Select.Option value="6_months">
                      {t("credits.last_6_months")}
                    </Select.Option>
                    <Select.Option value="12_months">
                      {t("credits.last_12_months")}
                    </Select.Option>
                  </Select>
                </Flex>
                <Table
                  className="table-scroll dark-header-table"
                  rowKey="id"
                  columns={[
                    { title: t("credits.table.index"), dataIndex: "index", key: "index", width: 80 },
                    { title: t("credits.table.payment_date"), dataIndex: "date", key: "date" },
                    {
                      title: t("credits.table.amount_paid"),
                      dataIndex: "amount",
                      key: "amount",
                      align: "right",
                    },
                    {
                      title: t("credits.table.credits_bought"),
                      dataIndex: "credits",
                      key: "credits",
                      align: "right",
                    },
                    {
                      title: t("credits.table.status"),
                      dataIndex: "status",
                      key: "status",
                      align: "center",
                      render: (status: string) => {
                        const color = status === "done" ? "green" : "orange";
                        const label = status === "done" ? t("credits.status.done") : t("credits.status.pending");
                        return <span style={{ color, fontWeight: 500 }}>{label}</span>;
                      }
                    }
                  ]}
                  dataSource={paymentHistory?.map((item: any, index: number) => ({ ...item, index: index + 1 }))}
                  pagination={false}
                  loading={false}
                  scroll={{ x: 600, y: 380 }}
                />
              </Panel>
            </Collapse>
          </Card>

          {/* Modal mua credits */}
          <Modal
            title={<div className="modal-title">Mua credits</div>}
            open={isModalVisible}
            footer={null}
            centered
            onCancel={() => setIsModalVisible(false)}
            className="modal-dark"
          >
            <Form layout="vertical" form={form} onFinish={handleBuyCredits}>
              <Form.Item
                // label={<span style={{ color: "#fff" }}>Chọn gói Credits</span>}
                style={{ textAlign: "center" }}
              >
                <div style={{ display: "inline-block", textAlign: "left", color: "#fff" }}>
                  <Radio.Group
                    onChange={(e) => {
                      const pkg = creditPackages.find(p => p.credits === e.target.value)!;
                      setSelectedPackage(pkg);
                    }}
                    value={selectedPackage.credits}
                  >
                    {creditPackages.map((pkg) => (
                      <Radio
                        key={pkg.credits}
                        value={pkg.credits}
                        style={{
                          display: "block",
                          lineHeight: "28px",
                          color: "#fff"
                        }}
                      >
                        {pkg.credits.toLocaleString("vi-VN")} credits – {pkg.price.toLocaleString("vi-VN")} VNĐ
                      </Radio>
                    ))}
                  </Radio.Group>
                </div>
              </Form.Item>
              <Form.Item style={{ textAlign: "center" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="btn-text"
                  style={{ width: "80%" }}
                  loading={isLoading}
                >
                  Mua ngay
                </Button>
              </Form.Item>

            </Form>
          </Modal>
        </div>
      </Layout>
    </PageTitleHOC>
  );
};

export default CreditsPage;
