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

const { Panel } = Collapse;
interface FormValues {
  credits: string;
  vnd: string;
}

const CreditsPage = () => {
  const { user } = useSelector((state: IRootState) => state.auth || { user: undefined });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  // const [form] = Form.useForm();
  const [form] = Form.useForm<FormValues>();
  const [userGroups, setUserGroups] = useState<undefined | any[]>([]);
  const [sendEmail, { isLoading }] = useSendCreditsMutation();

  const [autoPayment, setAutoPayment] = useState<boolean>(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([ // Giả lập dữ liệu thanh toán
    { id: 1, date: "Thứ sáu, 11/07/2025", amount: "1.000.000", credits: "2.000" },
    { id: 2, date: "Thứ năm, 10/07/2025", amount: "1.000.000", credits: "2.000" },
  ]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data: accountDetailData } = useGetAccountQuery(params.id || "0", {
    skip: !params.id,
  });
  const { data: roleGroupsData, isFetching: isRoleGroupsFetching } =
    useGetRoleGroupsQuery({});

  const [credits, setCredits] = useState<number>(user?.credits); // Giả lập dữ liệu credits



  useEffect(() => {
    if (roleGroupsData && accountDetailData) {
      setUserGroups(
        roleGroupsData?.map((group: any) => ({
          ...group,
          checked: accountDetailData?.groups.some((i) => i?.id === group.id),
        }))
      );
    }
  }, [roleGroupsData, accountDetailData]);



  // useEffect(() => {
  //   if (accountDetailData) {
  //     form.setFieldsValue({
  //       username: accountDetailData?.username,
  //       email: accountDetailData?.email,
  //       fullName: accountDetailData?.fullName,
  //       extension: accountDetailData?.extension,
  //       idPage: accountDetailData?.idPage,
  //       accessToken: accountDetailData?.accessToken?.trim(),
  //       accessTokenUser: accountDetailData?.accessTokenUser?.trim(),
  //       accountAdsId: accountDetailData?.accountAdsId?.trim(),
  //       isActive: accountDetailData?.isActive,
  //     });
  //   } else {
  //     form.resetFields();
  //   }
  // }, [accountDetailData, form]);


  const handleBuyCredits = async (values: FormValues) => {
    try {
      await sendEmail(values).unwrap();

      console.log("Đã click Mua credits");

      // Ví dụ giả lập:
      message.success("Giao dịch thành công! Admin sẽ liên hệ thanh toán credits.");
      setIsModalVisible(false);
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
                  {credits?.toLocaleString("vi-VN")} <span style={{ fontSize: 16, marginLeft: 6 }}>💎</span>
                </div>
                {/* <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ color: "#ffffff", fontWeight: 500 }}>
                      {t("credits.auto_payment")}
                    </span>
                    <Switch
                      checked={autoPayment}
                      onChange={setAutoPayment}
                    />
                  </div>
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>
                    {t("credits.auto_payment_note")}
                  </span>
                </div> */}
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

          {/* <Card className="accountDetail">
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
                  <DatePicker.RangePicker
                    picker="month"
                    className="custom-date-picker"
                    style={{ backgroundColor: "#1e293b", borderRadius: 6 }}
                  />

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
                  ]}
                  dataSource={paymentHistory.map((item, index) => ({ ...item, index: index + 1 }))}
                  pagination={false}
                  loading={false}
                  scroll={{ x: 600, y: 380 }}
                />
              </Panel>
            </Collapse>
          </Card> */}

          {/* Modal mua credits */}
          <Modal
            title={
              <div className="modal-title">
                Mua credits
              </div>
            }
            open={isModalVisible}  // ✅ Dùng 'open' thay vì 'visible' nếu đang dùng Ant Design 5+
            footer={null}
            centered
            onCancel={() => setIsModalVisible(false)}
            className="modal-dark" // ✅ Thêm class để dễ tùy biến giao diện
          >
            <Form layout="vertical" onFinish={handleBuyCredits}>
              <Form.Item label="Credits" name="credits" initialValue="500">
                <Input disabled className="input-dark" />
              </Form.Item>

              <Form.Item label="VNĐ" name="vnd" initialValue="179.000">
                <Input disabled className="input-dark" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="btn-text"
                  style={{ width: "100%" }}
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
