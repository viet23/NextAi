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
  Layout,
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

const { Panel } = Collapse;

const CreditsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [userGroups, setUserGroups] = useState<undefined | any[]>([]);
  const [credits, setCredits] = useState<number>(4000); // Giả lập dữ liệu credits
  const [autoPayment, setAutoPayment] = useState<boolean>(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([ // Giả lập dữ liệu thanh toán
    { id: 1, date: "Thứ sáu, 11/07/2025", amount: "1.000.000", credits: "2.000" },
    { id: 2, date: "Thứ năm, 10/07/2025", amount: "1.000.000", credits: "2.000" },
  ]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data: accountDetailData } = useGetAccountQuery(params.id || "0", {
    skip: !params.id,
  });
  const { data: roleGroupsData, isFetching: isRoleGroupsFetching } =
    useGetRoleGroupsQuery({});

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

  useEffect(() => {
    if (accountDetailData) {
      form.setFieldsValue({
        username: accountDetailData?.username,
        email: accountDetailData?.email,
        fullName: accountDetailData?.fullName,
        extension: accountDetailData?.extension,
        idPage: accountDetailData?.idPage,
        accessToken: accountDetailData?.accessToken?.trim(),
        accessTokenUser: accountDetailData?.accessTokenUser?.trim(),
        accountAdsId: accountDetailData?.accountAdsId?.trim(),
        isActive: accountDetailData?.isActive,
      });
    } else {
      form.resetFields();
    }
  }, [accountDetailData, form]);



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
            {t("accounts.user_credits")}
          </h3>

          <Card className="accountDetail" style={{ marginBottom: 24 }}>
            <Row gutter={[24, 16]} justify="space-between" align="middle">
              <Col>
                <div style={{ fontSize: 32, fontWeight: 600, color: "#fff" }}>
                  {credits?.toLocaleString("vi-VN")}
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ color: "#ffffff", fontWeight: 500 }}>
                      {t("accounts.auto_payment") || "Tự động thanh toán"}
                    </span>
                    <Switch
                      checked={autoPayment}
                      onChange={setAutoPayment}
                    />
                  </div>
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>
                    {t("accounts.auto_payment_note") || "Hãy thiết lập tự động thanh toán để đơn giản hoá công việc của bạn"}
                  </span>
                </div>

              </Col>
              <Col>
                <Button
                  size="large"
                  className="btn-text"
                >
                  {t("accounts.buy_more") || "Mua thêm"}
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
                    Lịch sử thanh toán
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
                    <Select.Option value="3_months">3 tháng gần nhất</Select.Option>
                    <Select.Option value="6_months">6 tháng</Select.Option>
                    <Select.Option value="12_months">12 tháng</Select.Option>
                  </Select>
                </Flex>
                <Table
                  className="table-scroll dark-header-table"
                  rowKey="id"
                  columns={[
                    { title: "STT", dataIndex: "index", key: "index", width: 80 },
                    { title: "Ngày thanh toán", dataIndex: "date", key: "date" },
                    {
                      title: "Số tiền đã thanh toán (VND)",
                      dataIndex: "amount",
                      key: "amount",
                      align: "right",
                    },
                    {
                      title: "Credits đã mua",
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
          </Card>
        </div>
      </Layout>
    </PageTitleHOC>
  );
};

export default CreditsPage;
