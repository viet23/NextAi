import "./RoleGroupCreate.scss";
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
  Typography,
  message,
} from "antd";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "antd/es/form/Form";
import Table, { ColumnsType } from "antd/es/table";
import { useCreateOrUpdateRoleGroupMutation, useGetRolesQuery } from "src/store/api/roleApi";
import { IRole, IRoleGroupCreateForm } from "src/interfaces/roles.interface";
import { useNavigate } from "react-router-dom";
import { AUTHORIZATION_ROUTE } from "src/constants/routes.constants";
import { usePageAuthorize } from "src/hooks/usePageAuthorize";
import { CREATE_GROUP, GET_ROLE } from "src/constants/roles.constants";

const RoleGroupCreatePage = () => {
  usePageAuthorize({ roleNames: [CREATE_GROUP, GET_ROLE] });

  const navigate = useNavigate();
  const [form] = useForm<IRoleGroupCreateForm>();

  const { data: rolesData, isLoading: isRolesLoading } = useGetRolesQuery({});
  const [createRoleGroup, { isLoading, isSuccess }] = useCreateOrUpdateRoleGroupMutation();

  const initialValues = useMemo<IRoleGroupCreateForm>(
    () => ({
      description: "",
      name: "",
      roles: [],
    }),
    []
  );

  const handleChangeRoles = useCallback(
    (role: IRole) => {
      const formRoles: IRole[] = form.getFieldValue("roles");
      if (formRoles?.find(x => x.id === role.id))
        form.setFieldValue(
          "roles",
          formRoles.filter((x: IRole) => x.id === role.id)
        );
      else form.setFieldValue("roles", [...formRoles, role]);
    },
    [form]
  );

  const columns = useMemo<ColumnsType<IRole>>(
    () => [
      {
        title: "STT",
        key: "index",
        width: 90,
        render: (_v, _r, index) => index + 1,
      },
      {
        title: "Chức năng",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Mô tả",
        dataIndex: "description",
        key: "description",
      },
      {
        title: "Truy cập",
        key: "id",
        dataIndex: "id",
        align: "center",
        width: 100,
        render: (id, record) => (
          <Checkbox
            checked={!!form.getFieldValue("roles")?.find((x: IRole) => x.id === id)}
            onChange={() => handleChangeRoles(record)}
          />
        ),
      },
    ],
    [form, handleChangeRoles]
  );

  const dataSource = useMemo(() => rolesData || [], [rolesData]);

  useEffect(() => {
    if (isSuccess) {
      message.success("Tạo mới nhóm quyền thành công", 1000);
      navigate(AUTHORIZATION_ROUTE);
    }
  }, [isSuccess, navigate]);

  return (
    <Card className="roleGroupCreate">
      <Typography.Title className="title" level={4} color="#1B1B1B">
        Tạo mới nhóm phân quyền
      </Typography.Title>
      <Form
        layout="vertical"
        requiredMark={false}
        initialValues={initialValues}
        form={form}
        onFinish={createRoleGroup}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} xl={12}>
            <Form.Item<IRoleGroupCreateForm>
              label="Tên nhóm quyền *"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên nhóm quyền",
                },
              ]}
            >
              <Input placeholder="Nhập tên nhóm quyền" />
            </Form.Item>
            <Form.Item<IRoleGroupCreateForm>
              label="Mô tả *"
              name="description"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mô tả",
                },
              ]}
            >
              <Input.TextArea rows={6} placeholder="Nhập mô tả" />
            </Form.Item>
          </Col>
          <Col xs={24} xl={12}>
            <Form.Item<IRoleGroupCreateForm> name="roles" dependencies={["roles"]}>
              <Table
                className="table-scroll table"
                rowKey="id"
                loading={isRolesLoading}
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                locale={{
                  emptyText: <Empty description="No Data"></Empty>,
                }}
                scroll={{ x: 600, y: 500 }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Flex justify="center">
          <Button
            loading={isLoading}
            className="save"
            type="primary"
            size="large"
            htmlType="submit"
          >
            Lưu
          </Button>
        </Flex>
      </Form>
    </Card>
  );
};

export default RoleGroupCreatePage;
