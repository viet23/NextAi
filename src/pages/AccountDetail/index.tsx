import { DownloadOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
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
  Row,
  Table,
  Typography,
  message,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import { ACCOUNT_ROUTE } from "src/constants/routes.constants";
import {
  useGetAccountQuery,
  useUpdateAccountGroupMutation,
} from "src/store/api/accountApi";
import { useGetRoleGroupsQuery } from "src/store/api/roleApi";

const AccountDetailPage = () => {
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
      userGroups.map((item) => {
        if (item.id === record.id) {
          item.checked = e.target.checked;
        }
        return item;
      })
    );
  };

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
            onChange={(e) => handleOnChangeCheckbox(e, _record)}
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
      .then((values) => {
        // Prepare data to submit
        const updatedData = {
          groupIds: userGroups
            ?.filter((i: any) => i.checked)
            .map((group) => group.id),
          email: values.email,
          fullName: values.fullName,
          extension: values.extension,
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
      .catch((errorInfo) => {
        console.error("Validation Failed:", errorInfo);
        message.error("Vui lòng kiểm tra lại các trường nhập liệu!");
      });
  };

  const isActive = accountDetailData?.isActive ? "Hoạt động" : "Không hoạt động";

  return (
    <PageTitleHOC title="Chi tiết tài khoản">
      <Card className="accountDetail">
        <span>Trạng thái: {isActive}</span>
        <Form form={form}>
          <Row gutter={[24, 0]}>
            <Col xl={16}>
              <Form.Item
                label="Tên đăng nhập"
                name="username"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
              >
                <Input disabled size="middle" placeholder="Tên đăng nhập" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[24, 0]}>
            <Col xl={16}>
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
                label="Ext"
                name="extension"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                rules={[{ required: true, message: "Vui lòng nhập số máy lẻ" }]}
              >
                <Input size="middle" placeholder="Số máy lẻ" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <Flex className="w-full" align="center" justify="space-between">
          <Typography.Title className="mb-0" level={5} color="#4A4A4A">
            Danh sách quyền (Chọn nhóm quyền)
          </Typography.Title>

          <Typography.Link strong underline className="link">
            Lịch sử khoá tài khoản
          </Typography.Link>
        </Flex>

        <Table
          className="table-scroll table"
          rowKey="id"
          columns={columns}
          dataSource={userGroups}
          pagination={false}
          loading={isRoleGroupsFetching}
          locale={{
            emptyText: <Empty description="Vui lòng chọn nhóm quyền"></Empty>,
          }}
          scroll={{ x: 600, y: 380 }}
        />

        <Flex justify="center" gap={12} wrap="wrap">
          <Button danger type="primary" onClick={handleBack}>
            Đóng
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            Cập nhật tài khoản
          </Button>
        </Flex>
      </Card>
    </PageTitleHOC>
  );
};

export default AccountDetailPage;
