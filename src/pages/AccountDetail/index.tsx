import { CaretRightOutlined, DownloadOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import "./AccountDetail.scss";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Empty,
  Flex,
  Form,
  Input,
  Layout,
  Modal,
  Row,
  Select,
  Table,
  Typography,
  message,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import { ACCOUNT_ROUTE } from "src/constants/routes.constants";
import { useConfirmPlanMutation, useGetAccountQuery, useUpdateAccountGroupMutation } from "src/store/api/accountApi";
import { useGetRoleGroupsQuery } from "src/store/api/roleApi";
import { useTranslation } from "react-i18next";
import { Collapse } from "antd";
import dayjs from "dayjs";
import { useLazyDetailCreditQuery } from "src/store/api/ticketApi";
const { Panel } = Collapse;

const AccountDetailPage = () => {
  const { t } = useTranslation();
  const [getDetailTicket] = useLazyDetailCreditQuery();
  const [confirmPlan, { isLoading: confirming }] = useConfirmPlanMutation();


  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const [form] = Form.useForm(); // Form instance
  const [userGroups, setUserGroups] = useState<undefined | any[]>([]);
  const { data: accountDetailData, refetch } = useGetAccountQuery(params.id || "0", {
  skip: !params.id,
});

  const [updateAccountGroup, { isSuccess: isUpdateSuccess }] = useUpdateAccountGroupMutation();
  const { data: roleGroupsData, isFetching: isRoleGroupsFetching } = useGetRoleGroupsQuery({});
  const handleOnChangeCheckbox = (e: any, record: any) => {
    if (!userGroups || userGroups.length === 0) {
      return;
    }
    setUserGroups(
      userGroups.map(item => {
        if (item.id === record.id) {
          item.checked = e.target.checked;
        }
        return item;
      })
    );
  };

  const paymentHistory = accountDetailData?.creditsData?.map((item: any) => ({
    status: item.status,
    id: item.id,
    date: dayjs(item.paymentDate).format("HH:mm - DD/MM/YYYY"),
    amount: item.amountPaidVnd.toLocaleString("vi-VN"),
    credits: item.creditsPurchased.toLocaleString("vi-VN")
  }));

  const columns = useMemo<ColumnsType<any>>(
    () => [
      {
        title: "STT",
        key: "index",
        width: 90,
        render: (_value, _record, index) => index + 1,
      },
      {
        title: "Tên quyền",
        key: "name",
        dataIndex: "name",
      },
      {
        title: "Mô tả",
        key: "description",
        dataIndex: "description",
      },
      {
        title: "Truy cập",
        key: "checked",
        width: 100,
        align: "center",
        render: (value, _record) => (
          <Checkbox
            value={_record.id}
            onChange={e => handleOnChangeCheckbox(e, _record)}
            checked={_record.checked}
          />
        ),
      },
    ],
    [userGroups, accountDetailData]
  );

  useEffect(() => {
    if (roleGroupsData && accountDetailData) {
      setUserGroups(
        roleGroupsData?.map((group: any) => ({
          ...group,
          checked: accountDetailData?.groups.some(i => i?.id === group.id),
        }))
      );
    }
  }, [roleGroupsData, accountDetailData]);

  useEffect(() => {
    if (accountDetailData) {
      form.setFieldsValue({
        username: accountDetailData?.username,
        phone: accountDetailData?.phone,
        zalo: accountDetailData?.zalo,
        email: accountDetailData?.email,
        fullName: accountDetailData?.fullName,
        extension: accountDetailData?.extension,
        credits: accountDetailData?.credits,
        idPage: accountDetailData?.idPage,
        accessToken: accountDetailData?.accessToken?.trim(),
        cookie: accountDetailData?.cookie?.trim(),
        accessTokenUser: accountDetailData?.accessTokenUser?.trim(),
        accountAdsId: accountDetailData?.accountAdsId?.trim(),
        isActive: accountDetailData?.isActive,
        plan: accountDetailData?.currentPlan?.name || "Free",
        isPaid: accountDetailData?.currentPlan?.isPaid ? "Đã thanh toán" : "Chưa thanh toán",
      });
    } else {
      form.resetFields();
    }
  }, [accountDetailData, form]);

  const handleBack = () => {
    navigate({ pathname: ACCOUNT_ROUTE });
  };

  useEffect(() => {
    if (isUpdateSuccess) {
      message.success("Cập nhật thông tin tài khoản thành công.");
    }
  }, [isUpdateSuccess]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then(values => {
        // Prepare data to submit
        const updatedData = {
          groupIds: userGroups?.filter((i: any) => i.checked).map(group => group.id),
          email: values.email,
          phone: values.phone,
          zalo: values.zalo,
          fullName: values.fullName,
          credits: values.credits,
          extension: values.extension,
          idPage: values.idPage,
          accessToken: values?.accessToken?.trim(),
          cookie: values?.cookie?.trim(),
          accessTokenUser: values?.accessTokenUser?.trim(),
          accountAdsId: values?.accountAdsId?.trim(),
          isActive: values?.isActive,
        };

        updateAccountGroup({
          id: params.id,
          body: updatedData,
        })
          .unwrap()
          .then(() => {
            message.success("Cập nhật tài khoản thành công!");
          })
          .catch(() => {
            message.error("Đã xảy ra lỗi khi cập nhật tài khoản!");
          });
      })
      .catch(errorInfo => {
        console.error("Validation Failed:", errorInfo);
        message.error("Vui lòng kiểm tra lại các trường nhập liệu!");
      });
  };

  const handleConfirm = async (record: any) => {
    try {
      getDetailTicket(record.id)
      window.location.reload()

      // reload lại data nếu cần
    } catch (err) {
      message.error("Có lỗi xảy ra khi xác nhận")
    }
  }

  const handleConfirmPayment = (subId?: string) => {
    Modal.confirm({
      title: "Xác nhận thanh toán?",
      content: "Hành động này sẽ được thực hiện ngay.",
      okText: "Đồng ý",
      cancelText: "Hủy",
      async onOk() {
        try {
          if (!subId) {
            message.warning("Không tìm thấy subscriptionId để xác nhận.");
            return;
          }
          await confirmPlan({ subscriptionId: subId }).unwrap();
          message.success("Xác nhận thanh toán thành công!");
          await refetch();
          form.setFieldsValue({ isPaid: "Đã thanh toán" });
        } catch (err: any) {
          message.error(err?.data?.message || "Xác nhận thanh toán thất bại!");
        }
      },
    });
  };




  return (
    <PageTitleHOC title="Chi tiết tài khoản">
      <Layout style={{ minHeight: "100vh", background: "#0f172a" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h3 style={{ textAlign: "center", color: "#fff", marginBottom: 12, marginTop: 24 }}>
            {t("accounts.user_detail")}
          </h3>
          {/* Panel 1 */}
          <Card className="accountDetail">
            <Collapse defaultActiveKey={["1"]} ghost expandIconPosition="start"
              expandIcon={({ isActive }) => (
                <CaretRightOutlined
                  rotate={isActive ? 90 : 0}
                  style={{ color: "#ffffff" }} // 👈 Đặt màu trắng tại đây
                />
              )}>
              <Panel
                key="1"
                header={<span style={{ color: "#ffffff", fontWeight: 600 }}>Thông tin tài khoản</span>}
              >
                <Form form={form}>
                  <Row gutter={[24, 0]}>
                    <Col xl={8}>
                      <Form.Item
                        label="Tên đăng nhập"
                        name="username"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      >
                        <Input disabled size="middle" placeholder="Tên đăng nhập" />
                      </Form.Item>
                    </Col>
                    <Col xl={8}>
                      <Form.Item
                        label="Họ và tên"
                        name="fullName"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                        rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                      >
                        <Input size="middle" placeholder="Họ và tên" />
                      </Form.Item>
                    </Col>
                    <Col xl={8}>
                      <Form.Item
                        label="Credits"
                        name="credits"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      >
                        <Input size="middle" placeholder="credits" />
                      </Form.Item>
                    </Col>
                    <Col xl={8}>
                      <Form.Item
                        label="Trạng thái tài khoản"
                        name="isActive"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                        rules={[{ required: true, message: "Vui lòng chọn trạng thái tài khoản" }]}
                      >
                        <Select
                          placeholder="Đang hoạt động"
                          size="large"
                          style={{
                            width: "100%",
                            height: 40,
                            borderRadius: 6,
                            backgroundColor: "#1e293b",
                            color: "#ffffff",
                          }}
                          dropdownStyle={{
                            backgroundColor: "#1e293b",
                            color: "#ffffff",
                          }}
                          optionLabelProp="label"
                        >
                          <Select.Option value={true} label="Đang hoạt động">
                            <span style={{ color: "#ffffff" }}>Đang hoạt động</span>
                          </Select.Option>
                          <Select.Option value={false} label="Chưa hoạt động">
                            <span style={{ color: "#ffffff" }}>Chưa hoạt động</span>
                          </Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xl={8}>
                      <Form.Item
                        label="Phone"
                        name="phone"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      >
                        <Input size="middle" placeholder="phone" />
                      </Form.Item>
                    </Col>
                    <Col xl={8}>
                      <Form.Item
                        label="Zalo"
                        name="zalo"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      >
                        <Input size="middle" placeholder="zalo" />
                      </Form.Item>
                    </Col>
                    <Col xl={8}>
                      <Form.Item
                        label="Loại tài khoản"
                        name="plan"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      >
                        <Input size="middle" placeholder="plan" disabled />
                      </Form.Item>


                    </Col>

                    <Col xl={8}>
                      <Form.Item
                        label="Tình trạng thanh toán"
                        name="isPaid"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      >
                        <Input size="middle" placeholder="isPaid" disabled />
                      </Form.Item>
                    </Col>

                    <Col xl={8}>

                      {/* Nếu chưa thanh toán thì hiển thị nút xác nhận */}
                      {!accountDetailData?.currentPlan?.isPaid && (
                        <>
                          <br />
                          <Button
                            type="primary"
                            className="btn-text"
                            style={{ marginTop: 22 }}
                            onClick={() => handleConfirmPayment(accountDetailData?.currentPlan?.id)}
                          >
                            Xác nhận thanh toán
                          </Button>
                        </>
                      )}

                    </Col>

                  </Row>
                </Form>
              </Panel>
            </Collapse>
          </Card>

          {/* Panel 2 */}
          <Card className="accountDetail">
            <Collapse defaultActiveKey={["2"]} ghost expandIconPosition="start"
              expandIcon={({ isActive }) => (
                <CaretRightOutlined
                  rotate={isActive ? 90 : 0}
                  style={{ color: "#ffffff" }} // 👈 Đặt màu trắng tại đây
                />
              )}>
              <Panel
                key="2"
                header={<span style={{ color: "#ffffff", fontWeight: 600 }}>Thông tin kết nối trang</span>}
              >
                <Form form={form}>
                  <Row gutter={[24, 0]}>
                    <Col span={24}>
                      <Form.Item
                        label="Id page"
                        name="idPage"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      // rules={[{ required: true, message: "Vui lòng nhập Id page" }]}
                      >
                        <Input size="middle" placeholder="Id page" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[24, 0]}>
                    <Col span={24}>
                      <Form.Item
                        label="Link make"
                        name="extension"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      // rules={[{ required: true, message: "Vui lòng nhập link đăng bài" }]}
                      >
                        <Input
                          style={{ width: "100%", fontSize: 16 }}
                          size="middle"
                          placeholder="Link đăng bài"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[0, 16]}>
                    <Col span={24}>
                      <Form.Item
                        label="Cookie"
                        name="cookie"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      // rules={[{ required: true, message: "Vui lòng nhập Access Token" }]}
                      >
                        <Input
                          size="middle"
                          placeholder="Cookie"
                          style={{ width: "100%", fontSize: 16 }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[0, 16]}>
                    <Col span={24}>
                      <Form.Item
                        label="Access Token page"
                        name="accessToken"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      // rules={[{ required: true, message: "Vui lòng nhập Access Token" }]}
                      >
                        <Input
                          size="middle"
                          placeholder="Access Token page"
                          style={{ width: "100%", fontSize: 16 }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[0, 16]}>
                    <Col span={24}>
                      <Form.Item
                        label="Account Ads Id"
                        name="accountAdsId"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      // rules={[{ required: true, message: "Vui lòng nhập Account Ads Id" }]}
                      >
                        <Input
                          size="middle"
                          placeholder="Account Ads Id"
                          style={{ width: "100%", fontSize: 16 }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[0, 16]}>
                    <Col span={24}>
                      <Form.Item
                        label="Access Token User"
                        name="accessTokenUser"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      // rules={[{ required: true, message: "Vui lòng nhập Access Token User" }]}
                      >
                        <Input
                          size="middle"
                          placeholder="Access Token User"
                          style={{ width: "100%", fontSize: 16 }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Panel>
            </Collapse>
          </Card>

          {/* Panel 3 */}
          <Card className="accountDetail">
            <Collapse
              defaultActiveKey={["3"]}
              ghost
              expandIconPosition="start"
              expandIcon={({ isActive }) => (
                <CaretRightOutlined
                  rotate={isActive ? 90 : 0}
                  className="collapse-icon"
                />
              )}
            >
              <Panel
                key="3"
                header={<span className="panel-header">Phân quyền người dùng</span>}
              >
                <Flex className="w-full" align="center" justify="space-between">
                  <Typography.Title className="mb-0 section-title" level={5}>
                    Danh sách quyền (Chọn nhóm quyền)
                  </Typography.Title>
                  <Typography.Link strong underline className="link">
                    Lịch sử khoá tài khoản
                  </Typography.Link>
                </Flex>

                <Table
                  className="table-scroll dark-header-table"
                  rowKey="id"
                  columns={columns}
                  dataSource={userGroups}
                  pagination={false}
                  loading={isRoleGroupsFetching}
                  locale={{
                    emptyText: <Empty description="Vui lòng chọn nhóm quyền" />,
                  }}
                  scroll={{ x: 600, y: 380 }}
                />

                <Flex justify="center" gap={12} wrap="wrap" style={{ marginTop: 24 }}>
                  <Button className="btn-text" onClick={handleSubmit}>
                    Cập nhật tài khoản
                  </Button>
                </Flex>
              </Panel>
            </Collapse>
          </Card>

          <Card className="accountDetail">
            <Collapse
              defaultActiveKey={["4"]}
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
                key="4"
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
                  {/* <DatePicker.RangePicker
                              picker="month"
                              className="custom-date-picker"
                              style={{ backgroundColor: "#1e293b", borderRadius: 6 }}
                            /> */}

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
                      render: (status: string, record: any) => {
                        const isPending = status === "pending"
                        const color = isPending ? "orange" : "green"
                        const label = isPending ? t("credits.status.pending") : t("credits.status.done")

                        return isPending ? (
                          <div>
                            <span style={{ color, fontWeight: 500 }}>{label}</span>
                            <br />
                            <button
                              onClick={() => handleConfirm(record)}
                              style={{
                                marginTop: 4,
                                padding: "4px 8px",
                                backgroundColor: "#1677ff",
                                color: "#fff",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer",
                              }}
                            >
                              {t("credits.table.confirm")}
                            </button>
                          </div>
                        ) : (
                          <span style={{ color, fontWeight: 500 }}>{label}</span>
                        )
                      }
                    }

                  ]}

                  dataSource={paymentHistory?.map((item: any, index: any) => ({ ...item, index: index + 1 }))}
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

export default AccountDetailPage;
