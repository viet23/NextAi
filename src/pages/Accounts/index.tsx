import { EditOutlined } from "@ant-design/icons";
import "./Accounts.scss";
import {
  Card,
  Col,
  Drawer,
  Empty,
  Flex,
  Form,
  Input,
  Layout,
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
  PLANS,
} from "src/constants/accounts.constants";

import dayjs from "dayjs";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import CreateUser from "src/components/DetailUser";
import { useTranslation } from "react-i18next";
import { Content } from "antd/es/layout/layout";

interface IForm {
  search: string;
  status?: string;
  plan?: string; // 👈 thêm plan
}

const AccountsPage = () => {
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = useForm<IForm>();
  const [isOpen, setIsOpen] = useState(false);

  // Watch form values; fallback từ URL query
  const searchWatch =
    useWatch("search", form) ?? (searchParams.get("search") || "");
  const statusWatch =
    useWatch("status", form) ?? (searchParams.get("status") || undefined);
  const planWatch =
    useWatch("plan", form) ?? (searchParams.get("plan") || undefined);

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

  // Gọi API: status -> boolean theo ACCOUNT_STATUS_ACTIVE; plan -> chuỗi free|starter|pro|enterprise
  const { data } = useGetAccountsQuery({
    page: pagination.page,
    pageSize: pagination.pageSize,
    where: {
      status:
        statusWatch !== undefined
          ? statusWatch === ACCOUNT_STATUS_ACTIVE
          : undefined,
      keyword: searchDebounce,
      plan: planWatch || undefined, // 👈 filter theo gói
    },
  });

  // Init form từ URL
  const initFormValues = useMemo<IForm>(
    () => ({
      search: searchParams.get("search") || "",
      status: searchParams.get("status") || undefined,
      plan: searchParams.get("plan") || undefined, // 👈 thêm
    }),
    [searchParams]
  );

  const columns = useMemo<ColumnsType<any>>(
    () => [
      {
        title: t("accounts.columns.no"),
        key: "index",
        width: 90,
        render: (_v, _r, index) => index + 1,
      },
      {
        title: t("accounts.columns.username"),
        key: "username",
        dataIndex: "username",
      },
      {
        title: t("accounts.columns.full_name"),
        key: "fullName",
        dataIndex: "fullName",
      },
      {
        title: "email",
        key: "email",
        dataIndex: "email",
      },
      {
        title: t("accounts.columns.phone"),
        key: "phone",
        dataIndex: "phone",
      },
      {
        title: "Loại tài khoản",
        key: "currentPlan",
        render: (row) => {
          // Tuỳ payload BE, lấy code/name
          const code =
            row?.currentPlan?.code ??
            (row?.currentPlan?.name
              ? String(row.currentPlan.name).toLowerCase()
              : undefined);
          const found = PLANS.find((p) => p.value === code);
          // Fallback hiển thị name từ BE nếu không map được
          return found?.label ?? row?.currentPlan?.name ?? "-";
        },
      },
      {
        title: t("accounts.columns.status"),
        key: "status",
        dataIndex: "isActive",
        render: (value: boolean) => {
          const isActive = Boolean(value);

          const statusStyle: React.CSSProperties = {
            display: "inline-block",
            padding: "4px 16px",
            borderRadius: "999px", // pill shape
            fontWeight: 500,
            textAlign: "center",
            color: isActive ? "#22c55e" : "#ef4444", // text: green/red
            backgroundColor: isActive ? "#14532d" : "#7f1d1d", // bg: dark green/red
          };

          return (
            <span style={statusStyle}>
              {isActive
                ? t("accounts.status.active")
                : t("accounts.status.inactive")}
            </span>
          );
        },
      },
      {
        title: "credits",
        key: "credits",
        dataIndex: "credits",
      },
      {
        title: t("accounts.columns.actions"),
        key: "actions",
        dataIndex: "id",
        render: (id: string) => (
          <Link
            className="edit-icon"
            to={`/tai-khoan/${id}`}
            style={{
              display: "inline-block",
              padding: 6,
              borderRadius: 6,
              backgroundColor: "#1e293b",
            }}
          >
            <EditOutlined style={{ color: "#ffffff", fontSize: 18 }} />
          </Link>
        ),
      },
      {
        title: t("accounts.columns.created"),
        key: "createdAt",
        dataIndex: "createdAt",
        render: (value) => dayjs(value).format("DD/MM/YYYY HH:mm"),
      },
    ],
    [t]
  );

  const dataSource = useMemo(() => data?.data || [], [data]);

  const getCurrentSearchParams = () => {
    const params: [string, string][] = [];
    for (let entry of searchParams.entries()) {
      params.push(entry as [string, string]);
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

    if (values.plan) currentSearchParams.plan = values.plan; // 👈 đồng bộ URL
    else delete currentSearchParams.plan;

    setSearchParams(currentSearchParams, { replace: true });
  };

  const handleFinish = () => {
    // no-op
  };

  return (
    <PageTitleHOC title={t("accounts.page_title")}>
      <Layout style={{ minHeight: "100vh", background: "#0D0F1A" }}>
        <Content style={{ padding: 24 }}>
          <h3 style={{ textAlign: "center", color: "#fff", marginBottom: 12 }}>
            {t("accounts.user_list_type")}
          </h3>
          <Card className="accounts">
            <Typography.Title
              level={4}
              style={{
                textAlign: "center",
                color: "#e2e8f0",
                width: "100%",
                marginTop: "4px",
                marginBottom: "10px",
              }}
            >
              {t("accounts.user_list")}
            </Typography.Title>

            <br />
            <Form
              layout="vertical"
              requiredMark={false}
              initialValues={initFormValues}
              form={form}
              onFinish={handleFinish}
              onValuesChange={handleChange}
              style={{ marginBottom: 24 }}
            >
              <Row gutter={[16, 16]} align="bottom">
                <Col span={5}>
                  <Form.Item name="search" label={t("accounts.search_label")}>
                    <Input
                      size="large"
                      placeholder={t("accounts.search_placeholder")}
                      style={{
                        width: 250,
                        height: 36,
                        borderRadius: 6,
                        borderWidth: 1,
                        paddingLeft: 10,
                        paddingRight: 10,
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col span={5}>
                  <Form.Item
                    name="status"
                    label={t("accounts.status_placeholder")}
                  >
                    <Select
                      size="large"
                      placeholder={t("accounts.status_placeholder")}
                      style={{ width: 250, height: 36 }}
                      dropdownStyle={{
                        backgroundColor: "#1e293b",
                        color: "#ffffff",
                      }}
                      allowClear
                    >
                      {ACCOUNT_STATUS.map((status) => (
                        <Select.Option
                          key={status.value}
                          value={status.value}
                          style={{ color: "#ffffff" }}
                        >
                          {status.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={5}>
                  <Form.Item
                    name="plan"
                    label={t("accounts.type_placeholder")} // “Loại tài khoản”
                  >
                    <Select
                      size="large"
                      placeholder={t("accounts.type_placeholder")}
                      style={{ width: 250, height: 36 }}
                      dropdownStyle={{
                        backgroundColor: "#1e293b",
                        color: "#ffffff",
                      }}
                      allowClear
                    >
                      {PLANS.map((p) => (
                        <Select.Option
                          key={p.value}
                          value={p.value}
                          style={{ color: "#ffffff" }}
                        >
                          {p.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            <>
              <Table
                className="table-scroll dark-header-table"
                rowKey="id"
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                locale={{
                  emptyText: <Empty description={t("accounts.no_data")} />,
                }}
                scroll={{ x: 800 }}
              />

              {/* 🎯 CSS ép màu header cột giống ảnh */}
              <style>
                {`
                  .dark-header-table .ant-table-thead > tr > th {
                    background-color: #1e293b !important;
                    color: #e2e8f0 !important;
                    font-weight: 500;
                    text-transform: uppercase;
                    font-size: 13px;
                  }
                `}
              </style>
            </>

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
            <CreateUser onRefetch={() => {}} />
          </Drawer>
        </Content>
      </Layout>
    </PageTitleHOC>
  );
};

export default AccountsPage;
