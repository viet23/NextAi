import {
  DownloadOutlined,
  EyeOutlined,
  ReloadOutlined,
  RestOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Empty,
  Flex,
  Form,
  Input,
  Pagination,
  Popconfirm,
  PopconfirmProps,
  Radio,
  RadioChangeEvent,
  Row,
  Space,
  Table,
  Tooltip,
  message,
} from "antd";
import { useForm } from "antd/es/form/Form";
import Link from "antd/es/typography/Link";
import Title from "antd/es/typography/Title";
import dayjs, { Dayjs } from "dayjs";
import React, { useState } from "react";
import DetailCustomer from "src/components/DetailCustomer";
import Gender from "src/components/Gender";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import { useGetAsterikCallQuery, useLazyGetAsterikCallQuery } from "src/store/api/asterikApi";

import {
  useGetCustomersQuery,
  useLazyExportExcelQuery,
} from "src/store/api/customerApi";

const { RangePicker } = DatePicker;
const Customers: React.FC<any> = () => {
  const [form] = useForm();
  const [detailId, setDetailId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSuspect, setIsSuspect] = useState(false);
  const [filter, setFilter] = useState<any>({
    page: 1,
    pageSize: 20,
  });
  const [sum, setSum] = useState([
    {
      today: "Today users",
      title: "5.000.000",
      persent: "+30%",
      icon: <UserOutlined />,
    },
    {
      today: "Today users",
      title: "5.000.000",
      persent: "+30%",
      icon: <UserOutlined />,
    },
    {
      today: "Today users",
      title: "5.000.000",
      persent: "+30%",
      icon: <UserOutlined />,
    },
    {
      today: "Today users",
      title: "5.000.000",
      persent: "+30%",
      icon: <UserOutlined />,
    },
  ]);
  const [getAsterikCall,  {isSuccess} ] = useLazyGetAsterikCallQuery();

  const { data, refetch } = useGetCustomersQuery(filter);
  const [exportExcel] = useLazyExportExcelQuery();
  const onChangePagination = (pageNumber: number, pageSize: number) => {
    setFilter((prevFilter: any) => ({
      ...prevFilter,
      page: pageNumber,
      pageSize: pageSize,
    }));
  };
  const handleOnFinish = (values: any) => {
    const object = cleanObject(values);
    if (Object.keys(object).length > 0) {
      setFilter((prevFilter: any) => ({
        ...prevFilter,
        where: object,
      }));
    } else {
      setFilter({
        page: 1,
        pageSize: 20,
      });
    }
  };
  const handleReset = () => {
    form.resetFields();
  };
  const cleanObject = (object: any) => {
    return Object.entries(object).reduce((acc: any, [key, value]: any) => {
      if (isSuspect) {
        acc["isSuspect"] = 1;
      } else {
        delete acc["isSuspect"];
      }
      if (!value) return acc;
      switch (key) {
        case "dateOfBirth": {
          acc[key] = value.format("YYYY-MM-DD");
          break;
        }
        case "dateTime": {
          const [startDate, endDate] = value.map((v: Dayjs) =>
            v.format("YYYY-MM-DD")
          );
          acc["startDate"] = startDate;
          acc["endDate"] = endDate;
          break;
        }
        default: {
          acc[key] = value;
          break;
        }
      }
      return acc;
    }, {});
  };
  const handleOnChangeRadio = (e: RadioChangeEvent) => {
    if (e.target.value == "all") {
      setIsSuspect(false);
      setFilter({
        page: 1,
        pageSize: 20,
      });
    } else {
      setIsSuspect(true);
      setFilter((prev: any) => {
        const where = prev?.where
          ? { ...prev?.where, ...{ isSuspect: 1 } }
          : { isSuspect: 1 };
        return {
          ...prev,
          page: 1,
          pageSize: 20,
          where,
        };
      });
    }
  };
  const handleOnClickDetail = (record: any) => {
    setDetailId(record?.id);
    setIsOpen(true);
  };
  const handleOnCloseDrawer = () => {
    setDetailId(null);
    setIsOpen(false);
  };

  const handleConfirmAsterikCall = async (phone: string) => {
    getAsterikCall(phone)
  }

  return (
    <PageTitleHOC title="Thông tin danh sách khách hàng">
      <div className="layout-content">
        {/* <Row gutter={[24, 16]} style={{ marginBottom: 24 }}>
        {sum.map((item, index) => (
          <Col key={index} sm={24} md={12} lg={6} xl={6} className="mb-24">
            <Card bordered={false} className="criclebox" size="small">
              <div className="number">
                <Row align="middle" gutter={[24, 0]}>
                  <Col xs={18}>
                    <span>{item.today}</span>
                    <Title level={3}>
                      {item.title} <small>{item.persent}</small>
                    </Title>
                  </Col>
                  <Col xs={6}>
                    <div className="icon-box">{item.icon}</div>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        ))}
      </Row> */}
        <Row gutter={[24, 0]} style={{ marginBottom: 24 }}>
          <Col xs="24" xl={24}>
            <Card
              className=" tablespace mb-24"
              title="Tìm kiếm"
              style={{ padding: 20 }}
            >
              <Form form={form} onFinish={handleOnFinish}>
                <Row gutter={[24, 0]}>
                  <Col xl={8}>
                    <Form.Item name="fullName">
                      <Input
                        name="fullName"
                        size="middle"
                        placeholder="Tên khách hàng"
                      />
                    </Form.Item>
                  </Col>
                  <Col xl={8}>
                    <Form.Item name="email">
                      <Input name="email" size="middle" placeholder="Email" />
                    </Form.Item>
                  </Col>
                  <Col xl={8}>
                    <Form.Item name="phone">
                      <Input
                        name="phone"
                        size="middle"
                        placeholder="Số điện thoại"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[24, 0]}>
                  <Col xl={8}>
                    <Form.Item name="dateOfBirth">
                      <DatePicker
                        name="dateOfBirth"
                        placeholder="Chọn ngày sinh"
                        size="middle"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xl={8}>
                    <Form.Item name="dateTime">
                      <RangePicker
                        name="dateTime"
                        placeholder={["Từ ngày", "Đến ngày"]}
                        size="middle"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xl={8}>
                    <Form.Item>
                      <Space>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<SearchOutlined />}
                        >
                          Tìm kiếm
                        </Button>
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          onClick={() => {
                            exportExcel(filter).then(async (response: any) => {
                            });
                          }}
                        >
                          Tải tệp
                        </Button>
                        <Button
                          type="default"
                          icon={<ReloadOutlined />}
                          onClick={handleReset}
                        >
                          Làm mới
                        </Button>
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>
        </Row>
        <Row gutter={[24, 0]}>
          <Col xs="24" xl={24}>
            <Card
              bordered={false}
              className="criclebox tablespace mb-24"
              title="Quản lý khách hàng"
              extra={
                <>
                  <Radio.Group
                    onChange={handleOnChangeRadio}
                    defaultValue="all"
                  >
                    <Radio.Button value="all">Tất cả</Radio.Button>
                    <Radio.Button value="suspect">
                      Danh sach khả nghi
                    </Radio.Button>
                  </Radio.Group>
                </>
              }
            >
              <Table
                columns={[
                  {
                    title: "STT",
                    dataIndex: "stt",
                    key: "stt",
                    render: (text, object, index) => index + 1,
                  },
                  {
                    title: "Mã Khách Hàng",
                    dataIndex: "customerId",
                    key: "customerId",
                  },
                  {
                    title: "Họ Tên",
                    dataIndex: "customerName",
                    key: "customerName",
                  },
                  {
                    title: "Năm Sinh",
                    dataIndex: "dateOfBirth",
                    key: "dateOfBirth",
                    render: (text) => dayjs(text).format("YYYY-MM-DD"),
                  },
                  {
                    title: "SĐT",
                    key: "phoneNo",
                    dataIndex: "phoneNo",
                    render: (phone) => (
                      <Popconfirm title="Xác nhận cuộc gọi" description="Gọi đến số điện thoại của khách hàng" onConfirm={() => handleConfirmAsterikCall(phone)} okText="Gọi" cancelText="Hủy">
                        <a href="#" onClick={(e) => e.preventDefault()}>{phone}</a>
                      </Popconfirm>
                    ),
                  },
                  {
                    title: "Email",
                    key: "email",
                    dataIndex: "email",
                  },
                  {
                    title: "Ngày đăng ký",
                    dataIndex: "createdDate",
                    key: "createdDate",
                    render: (text) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
                  },
                  {
                    title: "Giới Tính",
                    key: "gender",
                    dataIndex: "gender",
                    render: (text) => <Gender gender={text} />,
                  },
                  {
                    title: "Hành động",
                    key: "action",
                    dataIndex: "action",
                    fixed: "right",
                    width: 130,
                    render: (text, record, index) => (
                      <Flex
                        gap="small"
                        vertical
                        justify="center"
                        align="center"
                      >
                        <Link onClick={() => handleOnClickDetail(record)}>
                          <Tooltip title="Xem chi tiết khách hàng">
                            <EyeOutlined />
                          </Tooltip>
                        </Link>
                      </Flex>
                    ),
                  },
                ]}
                rowClassName={(record: any, index) =>
                  record?.isSuspect ? "suspect-row" : ""
                }
                rowKey="id"
                dataSource={data?.data || []}
                pagination={false}
                locale={{
                  emptyText: <Empty description="No Data"></Empty>,
                }}
                className="ant-border-space"
              />
              <Flex vertical style={{ paddingTop: 20, paddingBottom: 20 }}>
                <Pagination
                  pageSize={filter.pageSize}
                  current={filter.page}
                  total={data?.total || 0}
                  onChange={onChangePagination}
                />
              </Flex>
            </Card>
          </Col>
        </Row>
        <Drawer
          open={isOpen}
          onClose={handleOnCloseDrawer}
          width={"70%"}
          maskClosable={false}
          title="CHI TIẾT KHÁCH HÀNG"
        >
          <DetailCustomer id={detailId} onRefetch={() => refetch()} />
        </Drawer>
      </div>
    </PageTitleHOC>
  );
};
export default Customers;
