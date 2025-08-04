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
import { useGetAccountQuery, useUpdateAccountGroupMutation } from "src/store/api/accountApi";
import { useGetRoleGroupsQuery } from "src/store/api/roleApi";
import { useTranslation } from "react-i18next";
import { Collapse } from "antd";
const { Panel } = Collapse;

const AccountDetailUserPage = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const [form] = Form.useForm(); // Form instance
  const [userGroups, setUserGroups] = useState<undefined | any[]>([]);
  const { data: accountDetailData } = useGetAccountQuery(params.id || "0", {
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
        accessTokenUser: accountDetailData?.accessTokenUser?.trim(),
        accountAdsId: accountDetailData?.accountAdsId?.trim(),
        isActive: accountDetailData?.isActive,
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
                    {/* <Col xl={8}>
                      <Form.Item
                        label="Tên đăng nhập"
                        name="username"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      >
                        <Input disabled size="middle" placeholder="Tên đăng nhập" />
                      </Form.Item>
                    </Col> */}
                    <Col xl={8}>
                      <Form.Item
                        label="Họ và tên"
                        name="fullName"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      // rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
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
                    <Col span={8}>
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

                    <Col span={8}>
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

                  {/* <Row gutter={[24, 0]}>
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
                  </Row> */}
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
