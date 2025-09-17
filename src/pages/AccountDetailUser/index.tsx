import { CaretRightOutlined } from "@ant-design/icons";
import "./AccountDetail.scss";
import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  Layout,
  Row,
  message,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import { ACCOUNT_ROUTE } from "src/constants/routes.constants";
import { useGetAccountQuery, useUpdateAccountGroupMutation } from "src/store/api/accountApi";
import { useGetRoleGroupsQuery } from "src/store/api/roleApi";
import { useTranslation } from "react-i18next";
import { Collapse } from "antd";
import { store } from "src/store/store";
const { Panel } = Collapse;

const AccountDetailUserPage = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [userGroups, setUserGroups] = useState<undefined | any[]>([]);
  const { data: accountDetailData } = useGetAccountQuery(params.id || "0", {
    skip: !params.id,
  });
  const { auth } = store.getState();
  const token = auth.token || null;
  const [updateAccountGroup, { isSuccess: isUpdateSuccess }] = useUpdateAccountGroupMutation();
  const { data: roleGroupsData } = useGetRoleGroupsQuery({});

  const handleOnChangeCheckbox = (e: any, record: any) => {
    if (!userGroups || userGroups.length === 0) return;
    setUserGroups(
      userGroups.map(item => {
        if (item.id === record.id) item.checked = e.target.checked;
        return item;
      })
    );
  };

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
        token,
        pageInformation: accountDetailData?.pageInformation,
        accessTokenUser: accountDetailData?.accessTokenUser?.trim(),
        accountAdsId: accountDetailData?.accountAdsId?.trim(),
        isActive: accountDetailData?.isActive,
        plan: accountDetailData?.currentPlan?.name || "Free",
        isPaid: accountDetailData?.currentPlan?.isPaid ? "Đã thanh toán" : "Chưa thanh toán",
      });
    } else {
      form.resetFields();
    }
  }, [accountDetailData, form, token]);

  useEffect(() => {
    if (isUpdateSuccess) {
      message.success("Cập nhật thông tin tài khoản thành công.");
    }
  }, [isUpdateSuccess]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then(values => {
        const updatedData = {
          groupIds: userGroups?.filter((i: any) => i.checked).map(group => group.id),
          email: values.email,
          phone: values.phone,
          zalo: values.zalo,
          fullName: values.fullName,
          credits: values.credits,
          extension: values.extension,
          idPage: values.idPage,
          token: values.token?.trim(),
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

  // ===== Helpers cho Preview Page(s) =====
  const pages = useMemo(
    () =>
      (accountDetailData?.pageInformation ?? []) as Array<{
        idPage: string;
        accessToken: string;
        name?: string;
      }>,
    [accountDetailData]
  );

  // Lưu page đang chọn để hiển thị trạng thái
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  useEffect(() => {
    // Khởi tạo selected theo idPage hiện đang lưu (nếu có)
    if (accountDetailData?.idPage) {
      setSelectedPageId(accountDetailData.idPage);
    } else {
      setSelectedPageId(null);
    }
  }, [accountDetailData?.idPage]);

  const handleChoosePage = (p: { idPage: string; accessToken: string }) => {
    setSelectedPageId(p.idPage);
    form.setFieldsValue({
      idPage: p.idPage,
      accessToken: (p.accessToken || "").trim(),
    });
    message.success(`Đã chọn Page ${p.idPage}`);
  };

  const truncate = (s?: string, head = 16, tail = 8) =>
    s ? `${s.slice(0, head)}…${s.slice(-tail)}` : "-";

  return (
    <PageTitleHOC title="Chi tiết tài khoản">
      <Layout style={{ minHeight: "100vh", background: "#0f172a" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h3 style={{ textAlign: "center", color: "#fff", marginBottom: 12, marginTop: 24 }}>
            {t("accounts.user_detail")}
          </h3>

          <Card className="accountDetail">
            <Collapse
              defaultActiveKey={["1"]}
              ghost
              expandIconPosition="start"
              expandIcon={({ isActive }) => (
                <CaretRightOutlined rotate={isActive ? 90 : 0} style={{ color: "#ffffff" }} />
              )}
            >
              <Panel
                key="1"
                header={<span style={{ color: "#ffffff", fontWeight: 600 }}>Thông tin tài khoản</span>}
              >
                <Form form={form}>
                  <Row gutter={[24, 0]}>
                    <Col xl={8}>
                      <Form.Item label="Họ và tên" name="fullName" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                        <Input size="middle" placeholder="Họ và tên" />
                      </Form.Item>
                    </Col>

                    <Col xl={8}>
                      <Form.Item label="Credits" name="credits" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                        <Input
                          disabled
                          size="middle"
                          placeholder="credits"
                          style={{
                            backgroundColor: "#1e293b",
                            color: "#ffffff",
                            border: "1px solid #334155",
                            borderRadius: 6,
                          }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xl={8}>
                      <Form.Item label="Phone" name="phone" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                        <Input size="middle" placeholder="phone" />
                      </Form.Item>
                    </Col>

                    <Col xl={8}>
                      <Form.Item label="Zalo" name="zalo" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
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


                    <Col span={8}>
                      <Form.Item label="Id page" name="idPage" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                        <Input size="middle" placeholder="Id page" />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        label="Account Ads Id"
                        name="accountAdsId"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      >
                        <Input size="middle" placeholder="Account Ads Id" style={{ width: "100%", fontSize: 16 }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[0, 16]}>
                    <Col span={24}>
                      <Form.Item label="Token User" name="token" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                        <Input.Group compact>
                          <Form.Item name="token" noStyle>
                            <Input
                              readOnly
                              size="middle"
                              placeholder="Access Token User"
                              style={{
                                width: "calc(100% - 90px)",
                                fontSize: 16,
                                backgroundColor: "#1e293b",
                                color: "#ffffff",
                                border: "1px solid #334155",
                                borderRadius: 6,
                              }}
                            />
                          </Form.Item>

                          <Button
                            type="primary"
                            style={{ width: 80, marginLeft: 8 }}
                            onClick={async () => {
                              try {
                                const tokenValue = form.getFieldValue("token");
                                if (tokenValue) {
                                  await navigator.clipboard.writeText(tokenValue);
                                  message.success("Đã copy Token!");
                                } else {
                                  message.warning("Không có dữ liệu để copy");
                                }
                              } catch {
                                message.error("Copy thất bại");
                              }
                            }}
                          >
                            Copy
                          </Button>
                        </Input.Group>
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
                      >
                        <Input size="middle" placeholder="Access Token page" style={{ width: "100%", fontSize: 16 }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[0, 16]}>
                    <Col span={24}>
                      <Form.Item label="Cookie" name="cookie" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                        <Input size="middle" placeholder="Cookie" style={{ width: "100%", fontSize: 16 }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[0, 16]}>
                    <Col span={24}>
                      <Form.Item
                        label="Access Token User Facebook"
                        name="accessTokenUser"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      >
                        <Input size="middle" placeholder="Access Token User" style={{ width: "100%", fontSize: 16 }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Preview & chọn pageInformation */}
                  {pages?.length > 0 && (
                    <Card
                      size="small"
                      style={{ marginTop: 8, background: "#0b1220", borderColor: "#334155" }}
                      title={
                        <span style={{ color: "#fff", fontWeight: 600 }}>
                          Chọn trang Facebook ({pages.length})
                        </span>
                      }
                    >
                      {pages.map((p, idx) => {
                        const isSelected = selectedPageId === p.idPage;
                        return (
                          <Row
                            key={p.idPage ?? idx}
                            style={{
                              padding: "8px 0",
                              borderBottom: idx < pages.length - 1 ? "1px solid #1f2937" : "none",
                            }}
                            align="middle"
                            gutter={12}
                          >
                            <Col xs={24} md={8}>
                              <div style={{ color: "#93c5fd" }}>
                                ID Page:{" "}
                                <strong style={{ color: "#fff" }}>
                                  {p.idPage}
                                </strong>
                              </div>
                              <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>
                                Access Token: <em>{truncate(p.accessToken, 12, 6)}</em>
                              </div>
                            </Col>

                            <Col xs={24} md={10} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <Button
                                className="btn-text"
                                onClick={() => window.open(`https://facebook.com/${p.idPage}`, "_blank")}
                              >
                                Mở Page
                              </Button>

                              <Button
                                type={isSelected ? "default" : "primary"}
                                onClick={() => handleChoosePage(p)}
                                disabled={isSelected}
                              >
                                {isSelected ? "Đang chọn" : "Chọn trang này"}
                              </Button>
                            </Col>
                          </Row>
                        );
                      })}
                    </Card>
                  )}
                </Form>

                <Flex justify="center" gap={12} wrap="wrap" style={{ marginTop: 24 }}>
                  <Button className="btn-text" onClick={handleSubmit}>
                    Cập nhật tài khoản
                  </Button>
                </Flex>
              </Panel>
            </Collapse>
          </Card>
        </div>
      </Layout>
    </PageTitleHOC>
  );
};

export default AccountDetailUserPage;
