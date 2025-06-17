import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import "./Accounts.scss";
import {
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Flex,
  Form,
  Input,
  Pagination,
  Row,
  Select,
  Table,
  Typography,
} from "antd";
import { useForm, useWatch } from "antd/es/form/Form";
import { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { useGetAccountsQuery } from "src/store/api/accountApi";
import { useDebounce } from "src/hooks/useDebounce";
import { DEFAULT_PAGE_SIZE } from "src/constants/common.constants";
import { Link, useSearchParams } from "react-router-dom";
import {
  ACCOUNT_STATUS,
  ACCOUNT_STATUS_ACTIVE,
  ACCOUNT_STATUS_ACTIVE_LABEL,
  ACCOUNT_STATUS_INACTIVE_LABEL,
} from "src/constants/accounts.constants";
import dayjs from "dayjs";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import CreateUser from "src/components/DetailUser";

interface IForm {
  search: string;
  status?: string;
}

const AccountsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = useForm<IForm>();
  const [isOpen, setIsOpen] = useState(false);
  const searchWatch =
    useWatch("search", form) ?? (searchParams.get("search") || "");
  const statusWatch =
    useWatch("status", form) ?? (searchParams.get("status") || undefined);

  const [pagination, setPagination] = useState({
    page: searchParams.get("page")
      ? Math.max(Number(searchParams.get("page")), 1)
      : 1,
    pageSize: searchParams.get("pageSize")
      ? Math.max(Number(searchParams.get("pageSize")), 1)
      : DEFAULT_PAGE_SIZE,
  });

  const handleAddNew = () => {
    setIsOpen(true);
  };

  const handleOnCloseDrawer = () => {
    setIsOpen(false);
  };



  const searchDebounce = useDebounce<string>({
    value: searchWatch,
    delay: 700,
  });

  const { data } = useGetAccountsQuery({
    page: pagination.page,
    pageSize: pagination.pageSize,
    where: {
      status:
        statusWatch !== undefined
          ? statusWatch === ACCOUNT_STATUS_ACTIVE
          : undefined,
      keyword: searchDebounce,
    },
  });

  const initFormValues = useMemo<IForm>(
    () => ({
      search: searchParams.get("search") || "",
      status: searchParams.get("status") || undefined,
    }),
    [searchParams]
  );

  const columns = useMemo<ColumnsType<any>>(
    () => [
      {
        title: "NO",
        key: "index",
        width: 90,
        render: (_value, _record, index) => index + 1,
      },
      {
        title: "Login name",
        key: "username",
        dataIndex: "username",
      },
      {
        title: "Full Name",
        key: "fullName",
        dataIndex: "fullName",
      },
      {
        title: "Creation date",
        key: "createdAt",
        dataIndex: "createdAt",
        render: (value) => dayjs(value).format("DD/MM/YYYY HH:mm"),
      },
      {
        title: "Status",
        key: "status",
        dataIndex: "isActive",
        render: (value) =>
          value ? ACCOUNT_STATUS_ACTIVE_LABEL : ACCOUNT_STATUS_INACTIVE_LABEL,
      },
      {
        title: "Actions",
        key: "actions",
        dataIndex: "id",
        render: (id) => (
          <Link className="edit" to={`/tai-khoan/${id}`}>
           edit
          </Link>
        ),
      },
    ],
    []
  );

  const dataSource = useMemo(() => data?.data || [], [data]);

  const getCurrentSearchParams = () => {
    const params = [];

    for (let entry of searchParams.entries()) {
      params.push(entry);
    }

    return Object.fromEntries(params);
  };

  const handlePaginationChange = (newPage: number, newPageSize: number) => {
    const newPagination = {
      page: newPage,
      pageSize: newPageSize,
    };
    setPagination(newPagination);

    const currentSearchParams = getCurrentSearchParams();

    if (newPage > 1) currentSearchParams.page = newPage.toString();
    else delete currentSearchParams.page;

    if (newPageSize !== DEFAULT_PAGE_SIZE)
      currentSearchParams.pageSize = newPageSize.toString();
    else delete currentSearchParams.pageSize;

    setSearchParams(currentSearchParams, {
      replace: true,
    });
  };

  const handleChange = (_v: unknown, values: IForm) => {
    const currentSearchParams = getCurrentSearchParams();

    if (values.search?.trim())
      currentSearchParams.search = values.search?.trim();
    else delete currentSearchParams.search;

    if (values.status) currentSearchParams.status = values.status;
    else delete currentSearchParams.status;

    setSearchParams(currentSearchParams, { replace: true });
  };

  const handleFinish = () => {
    console.log("finish");
  };

  return (
    <PageTitleHOC title="List of accounts">
      <Card className="accounts">
        <Typography.Title className="title" level={4} color="#1B1B1B">
          List of user accounts
        </Typography.Title>

        <Form
          layout="vertical"
          requiredMark={false}
          initialValues={initFormValues}
          form={form}
          onFinish={handleFinish}
          onValuesChange={handleChange}
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} lg={8}>
              <Form.Item name="search">
                <Input
                  allowClear
                  size="large"
                  prefix={<SearchOutlined />}
                  placeholder="Search"
                />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item name="status">
                <Select
                  allowClear
                  size="large"
                  placeholder="Account status"
                >
                  {ACCOUNT_STATUS.map((status) => (
                    <Select.Option key={status.value}>
                      {status.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Flex justify="end">
                <Button size="large" type="primary" onClick={handleAddNew}>
                  Add new
                </Button>
              </Flex>
            </Col>
          </Row>
        </Form>

        <Table
          className="table-scroll"
          rowKey="id"
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          locale={{
            emptyText: <Empty description="No Data"></Empty>,
          }}
          scroll={{ x: 800 }}
        />
        {!!data?.total && (
          <Flex vertical className="pagination-wrapper">
            <Pagination
              pageSize={pagination.pageSize}
              current={pagination.page}
              total={data?.total}
              onChange={handlePaginationChange}
            />
          </Flex>
        )}
      </Card>
      <Drawer
        open={isOpen}
        onClose={handleOnCloseDrawer}
        width={"30%"}
        maskClosable={false}
      >
        <CreateUser
          onRefetch={() => { }}
        />
      </Drawer>
    </PageTitleHOC>
  );
};

export default AccountsPage;
