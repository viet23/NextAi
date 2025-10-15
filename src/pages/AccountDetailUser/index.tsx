// src/pages/account/AccountDetailUserPage.tsx
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
  const { data: accountDetailData, refetch } = useGetAccountQuery(params.id || "0", {
    skip: !params.id,
  });
  const { auth } = store.getState();
  const token = auth.token || null;
  const [updateAccountGroup, { isSuccess: isUpdateSuccess }] = useUpdateAccountGroupMutation();
  const { data: roleGroupsData } = useGetRoleGroupsQuery({});

  // safe trim helper
  const safeTrim = (v?: any) => {
    if (v === undefined || v === null) return null;
    if (typeof v === "string") return v.trim() === "" ? null : v.trim();
    return v;
  };

  // checkbox change for groups
  const handleOnChangeCheckbox = (e: any, record: any) => {
    if (!userGroups || userGroups.length === 0) return;
    setUserGroups(
      userGroups.map(item => {
        if (item.id === record.id) item.checked = e.target.checked;
        return item;
      })
    );
  };

  // populate groups state
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

  // set form values when accountDetailData changes
  useEffect(() => {
    if (accountDetailData) {
      // IMPORTANT: Do not overwrite accessToken / accessTokenUser when isInternal === true.
      // We set displayed fields but internal tokens go to visible internal fields.
      form.setFieldsValue({
        username: accountDetailData?.username,
        phone: accountDetailData?.phone,
        zalo: accountDetailData?.zalo,
        email: accountDetailData?.email,
        fullName: accountDetailData?.fullName,
        extension: accountDetailData?.extension,
        credits: accountDetailData?.credits,
        idPage: accountDetailData?.idPage ?? null,
        // display fields:
        accessToken: accountDetailData?.accessToken ?? "",
        accessTokenUser: accountDetailData?.accessTokenUser ?? "",
        cookie: accountDetailData?.cookie ?? "",
        token,
        accountAdsId: accountDetailData?.accountAdsId ?? "",
        isActive: accountDetailData?.isActive,
        plan: accountDetailData?.currentPlan?.name || "Free",
        isPaid: accountDetailData?.currentPlan?.isPaid ? "Đã thanh toán" : "Chưa thanh toán",
        // Internal tokens shown in form
        internalUserAccessToken: accountDetailData?.internalUserAccessToken ?? "",
        internalPageAccessToken: accountDetailData?.internalPageAccessToken ?? "",
        // raw page info kept if needed
        pageInformation: accountDetailData?.pageInformation,
        internalPageInformation: accountDetailData?.internalPageInformation,
      });
    } else {
      form.resetFields();
    }
  }, [accountDetailData, form, token]);

  useEffect(() => {
    if (isUpdateSuccess) {
      message.success("Cập nhật thông tin tài khoản thành công.");
      refetch?.();
    }
  }, [isUpdateSuccess, refetch]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then(values => {
        const updatedData = {
          groupIds: userGroups?.filter((i: any) => i.checked).map(group => group.id) ?? [],
          email: safeTrim(values.email),
          phone: safeTrim(values.phone),
          zalo: safeTrim(values.zalo),
          fullName: safeTrim(values.fullName),
          credits: values.credits ?? null,
          extension: safeTrim(values.extension),
          idPage: safeTrim(values.idPage),
          // per request: do not auto override accessTokenUser or accessToken from internal values when internal flow
          accessToken: safeTrim(values.accessToken),
          cookie: safeTrim(values.cookie),
          accessTokenUser: safeTrim(values.accessTokenUser),
          // internal tokens (now visible) will be sent if present
          internalUserAccessToken: safeTrim(values.internalUserAccessToken),
          internalPageAccessToken: safeTrim(values.internalPageAccessToken),
          accountAdsId: safeTrim(values.accountAdsId),
          isActive: values?.isActive === undefined ? null : values.isActive,
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

  // Decide which pages source to use based on isInternal flag
  const rawPages = useMemo(() => {
    const isInternal = !!accountDetailData?.isInternal;
    if (isInternal) {
      return accountDetailData?.internalPageInformation ?? [];
    }
    return accountDetailData?.pageInformation ?? [];
  }, [accountDetailData]);

  // normalize pages to { idPage, name, accessToken }
  const pages = useMemo(
    () =>
      (rawPages ?? []).map((p: any) => {
        const idPage = p.idPage ?? p.id ?? p.pageId ?? p.id_page ?? "";
        const name = p.name ?? p.page_name ?? p.pageName ?? "";
        const accessToken =
          p.internalPageAccessToken ?? p.page_access_token ?? p.accessToken ?? p.access_token ?? "";
        return {
          idPage: String(idPage),
          name,
          accessToken,
          __raw: p,
        };
      }),
    [rawPages]
  );

  // selected page state
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  // init selected page from accountDetailData.idPage
  useEffect(() => {
    if (accountDetailData?.idPage) {
      setSelectedPageId(String(accountDetailData.idPage));
    } else {
      setSelectedPageId(null);
    }
  }, [accountDetailData?.idPage]);

  // Choose page logic depends on isInternal flag
  const handleChoosePage = (p: { idPage: string; accessToken: string; name?: string; __raw?: any }) => {
    const isInternal = !!accountDetailData?.isInternal;
    setSelectedPageId(p.idPage);

    if (isInternal) {
      // internal flow: set idPage and internalPageAccessToken only
      form.setFieldsValue({
        idPage: p.idPage,
        internalPageAccessToken: safeTrim(p.accessToken),
      });
      message.success(`(Internal) Đã chọn Page ${p.name || p.idPage}`);
    } else {
      // non-internal flow: set idPage and accessToken
      form.setFieldsValue({
        idPage: p.idPage,
        accessToken: safeTrim(p.accessToken),
      });
      message.success(`Đã chọn Page ${p.name || p.idPage}`);
    }
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
                      <Form.Item label={t("register.phone")} name="phone" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
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
                      <Form.Item label="Access Token page" name="accessToken" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
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

                  {/* Internal tokens VISIBLE now */}
                  <Row gutter={[0, 16]}>
                    <Col span={24}>
                      <Form.Item
                        label="Internal User Access Token"
                        name="internalUserAccessToken"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      >
                        <Input.TextArea
                          rows={2}
                          placeholder="Internal User Access Token (sẽ được đồng bộ khi backend trả về)"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[0, 16]}>
                    <Col span={24}>
                      <Form.Item
                        label="Internal Page Access Token"
                        name="internalPageAccessToken"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      >
                        <Input.TextArea
                          rows={2}
                          placeholder="Internal Page Access Token (được lấy từ luồng internal khi chọn Page)"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Preview & choose pages (source depends on isInternal) */}
                  {pages?.length > 0 && (
                    <Card
                      size="small"
                      style={{ marginTop: 8, background: "#0b1220", borderColor: "#334155" }}
                      title={
                        <span style={{ color: "#fff", fontWeight: 600 }}>
                          Chọn trang Facebook ({pages.length}) — {accountDetailData?.isInternal ? "Internal flow" : "Normal flow"}
                        </span>
                      }
                    >
                      {pages.map((p: { idPage: any; name: any; accessToken: any; __raw?: any; }, idx: number) => {
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
                                Tên Page:{" "}
                                <strong style={{ color: "#fff" }}>
                                  {p.name || "-"}
                                </strong>
                              </div>

                              <div style={{ color: "#93c5fd" }}>
                                ID Page:{" "}
                                <strong style={{ color: "#fff" }}>
                                  {p.idPage}
                                </strong>
                              </div>

                              <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>
                                Token (source: {accountDetailData?.isInternal ? "internal" : "normal"}): <em>{truncate(p.accessToken, 12, 6)}</em>
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
