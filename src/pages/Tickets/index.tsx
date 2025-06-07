import { CloseOutlined, DownloadOutlined, EyeOutlined, PlusCircleOutlined, SearchOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button, Card, Col, DatePicker, Drawer, Empty, Flex, Form, Input, Pagination, Radio, RadioChangeEvent, Row, Select, Space, Table, Tooltip,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { Option } from "antd/es/mentions";
import dayjs, { Dayjs } from "dayjs";
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import DetailTicket from "src/components/DetailTicket";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import { formatTicketDate, ticketStatusStyles } from "src/constants/ticket.constants";
import { useGetCasesQuery, useLazyExportCaseExcelQuery, useLazyGetCaseStaffQuery } from "src/store/api/ticketApi";
import { ReactComponent as RefetchIcon } from "src/assets/images/icon/ic-refetch.svg";
import { FULL_DATE_FORMAT_PARAM } from "src/constants/common.constants";


const { RangePicker } = DatePicker;
const Tickets: React.FC<any> = () => {
  const [form] = useForm();
  const [detailId, setDetailId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSuspect, setIsSuspect] = useState(false);
  const [filter, setFilter] = useState<any>({
    page: 1,
    pageSize: 10,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [exportExcel] = useLazyExportCaseExcelQuery();
  const [optionStaff, setOptionStaff] = useState<{ value: string; label: string }[]>([]);
  const [getStaffTicket] = useLazyGetCaseStaffQuery();
  const [assignById, setAssignById] = useState<string | null>(null);
  const { data, refetch } = useGetCasesQuery(filter);
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
      setFilter({ page: 1, pageSize: 20 });
    }
  };


  const handleSearchStaff = async (valueStaff: string) => {
    if (!valueStaff) {
      setOptionStaff([]);
      return;
    }
    try {
      const data = await getStaffTicket(valueStaff).unwrap();
      const formattedOptions = data?.data.map((user: any) => ({
        value: user.username,
        label: user.username,
        id: user.id,
      }));
      setOptionStaff(formattedOptions);
    } catch (error) {
      console.error("Error fetching staff:", error);
      setOptionStaff([]);
    }
  };

  const handleExport = async () => {
    const values = form.getFieldsValue(); 
    const object = cleanObject(values);  
    const exportFilter = {
      ...filter,
      where: object,
    };
    await exportExcel(exportFilter);
  };

  const handleResetField = () => {
    setSearchParams(undefined);
    form.resetFields();
  };

  const handleReset = () => {
    refetch();
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
          acc[key] = value.format(FULL_DATE_FORMAT_PARAM);
          break;
        }
        case "dateTime": {
          const [startDate, endDate] = value.map((v: Dayjs) =>
            v.format(FULL_DATE_FORMAT_PARAM)
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
      setFilter({ page: 1, pageSize: 20 });
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
  const handleAddNew = () => {
    setDetailId(null);
    setIsOpen(true);
  };

  const handleOnClickDetail = (record: any) => {
    setDetailId(record?.id);
    setIsOpen(true);
  };
  const handleOnCloseDrawer = () => {
    setDetailId(null);
    setIsOpen(false);
  };
  return (
    <PageTitleHOC title="Quản lý bài viết">
      <div className="layout-content">
        <Row gutter={[24, 0]} style={{ marginBottom: 24 }}>
          <Col xs="24" xl={24}>
            <Card className=" tablespace mb-24" title="Tìm kiếm" style={{ padding: 20 }} >
              <Form form={form} onFinish={handleOnFinish} layout="vertical">
                <Row gutter={[24, 0]}>
                  <Col xl={6} md={12} sm={24}>
                    <Form.Item name="phoneOrEmail" label="SĐT/Email">
                      <Input placeholder="Nhập SĐT/Email" />
                    </Form.Item>
                  </Col>
                  <Col xl={6} md={12} sm={24}>
                    <Form.Item name="ticketCode" label="Mã ticket">
                      <Input placeholder="Nhập mã ticket" />
                    </Form.Item>
                  </Col>
                  <Col xl={6} md={12} sm={24}>
                    <Form.Item name="feature" label="Tính năng">
                      <Select placeholder="Tùy chọn">
                        <Option value="Đăng ký ">Đăng ký </Option>
                        <Option value="Đăng nhập">Đăng nhập</Option>
                        <Option value="Nạp tiền">Nạp tiền</Option>
                        <Option value="Rút tiền">Rút tiền</Option>
                        <Option value="Thanh toán">Thanh toán</Option>
                        <Option value="Xác thực">Xác thực</Option>
                        <Option value="Liên kết ngân hàng">Liên kết ngân hàng</Option>
                        <Option value="Thông tin tài khoản">Thông tin tài khoản</Option>
                        <Option value="Khác">Khác</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xl={6} md={12} sm={24}>
                    <Form.Item name="issueType" label="Loại vấn đề">
                      <Select placeholder="Tùy chọn">
                        <Option value="Hướng dẫn sử dụng">Hướng dẫn sử dụng</Option>
                        <Option value="Báo lỗi tính năng">Báo lỗi tính năng</Option>
                        <Option value="Tra soát (GD lỗi/Đã trừ tiền)">Tra soát (GD lỗi/Đã trừ tiền)</Option>
                        <Option value="Cung cấp thông tin">Cung cấp thông tin</Option>
                        <Option value="Góp ý">Góp ý</Option>
                        <Option value="Cập nhật thông tin tài khoản">Cập nhật thông tin tài khoản</Option>
                        <Option value="Khiếu nại">Khiếu nại</Option>
                        <Option value="Khác">Khác</Option>

                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[24, 0]}>
                  <Col xl={6} md={12} sm={24}>
                    <Form.Item name="receiver" label="Nhân viên tiếp nhận">
                      <AutoComplete
                        placeholder="Nhân viên tiếp nhận"
                        onSearch={handleSearchStaff}
                        onSelect={(value, option: any) => setAssignById(option.id)}
                        options={optionStaff}
                      />

                    </Form.Item>
                  </Col>
                  <Col xl={6} md={12} sm={24}>
                    <Form.Item name="department" label="Bộ phận tiếp nhận xử lý">
                      <Select placeholder="Tùy chọn">
                        <Option value="Kỹ thuật">Kỹ thuật</Option>
                        <Option value="Kế toán">Kế toán</Option>
                        <Option value="Vận hành">Vận hành</Option>
                        <Option value="CSKH">CSKH</Option>
                        <Option value="Đối soát">Đối soát</Option>
                        <Option value="Quản trị rủi ro">Quản trị rủi ro</Option>
                        <Option value="Pháp chế">Pháp chế</Option>
                        <Option value="Phát triển sản phẩm">Phát triển sản phẩm</Option>
                        <Option value="Kinh doanh">Kinh doanh</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xl={6} md={12} sm={24}>
                    <Form.Item name="ticketStatus" label="Trạng thái ticket">
                      <Select placeholder="Tùy chọn">
                        <Option value="T0">T0</Option>
                        <Option value="T0.2">T0.2</Option>
                        <Option value="T0.3">T0.3</Option>
                        <Option value="T1">T1</Option>
                        <Option value="T1.2">T1.2</Option>
                        <Option value="T1.3">T1.3</Option>
                        <Option value="T3">T3</Option>
                        <Option value="T5">T5</Option>
                        <Option value="T6">T6</Option>
                        <Option value="T7">T7</Option>
                        <Option value="T8">T8</Option>
                        <Option value="T8A">T8A</Option>
                        <Option value="T8B">T8B</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xl={6} md={12} sm={24}>
                    <Form.Item name="dateTime" label="Từ ngày - Đến ngày">
                      <RangePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[24, 0]}>
                  <Col span={24} style={{ textAlign: "right" }}>
                    <Form.Item>
                      <Space>
                        <Button
                          danger
                          type="primary"
                          icon={<CloseOutlined />}
                          onClick={handleResetField}
                        >
                          Bỏ lọc
                        </Button>
                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                          Tìm kiếm
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
            <Card bordered={false} className="criclebox tablespace mb-24" title="Danh sách Ticket"
              extra={
                <>
                  <Radio.Group onChange={handleOnChangeRadio} defaultValue="all" style={{ display: "flex", alignItems: "center" }}>
                    <Button
                      type="primary"
                      icon={<PlusCircleOutlined />}
                      style={{
                        marginLeft: 8,
                        backgroundColor: "#1890ff",
                        borderColor: "#1890ff",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onClick={handleAddNew}
                    >
                      Thêm mới
                    </Button>

                    <Button
                      type="primary"
                      style={{
                        marginLeft: 8,
                        backgroundColor: "#1890ff",
                        borderColor: "#1890ff",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      icon={<RefetchIcon />}
                      onClick={handleReset}
                    ></Button>

                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      style={{
                        marginLeft: 8,
                        backgroundColor: "#1890ff",
                        borderColor: "#1890ff",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onClick={handleExport}
                    >
                      Tải báo cáo
                    </Button>
                  </Radio.Group>
                </>
              }
            >
              <Table
                columns={[
                  {
                    title: "STT",
                    dataIndex: "stt",
                    width: 20,
                    fixed: "left",
                    key: "stt",
                    render: (text, object, index) => index + 1,
                  },
                  {
                    title: "Mã Ticket",
                    fixed: "left",
                    dataIndex: "code",
                    key: "code",
                  },
                  {
                    title: "Ngày tiếp nhận ticket",
                    fixed: "left",
                    width: 120,
                    dataIndex: "createdAt",
                    key: "createdAt",
                    render: (text) => text ? dayjs(text).format(formatTicketDate) : '',
                  },
                  {
                    title: "Trạng thái ticket",
                    fixed: "left",
                    width: 100,
                    dataIndex: "internalState",
                    key: "internalState",
                    render: (status: "T0" | "T0.2" | "T0.3" | "T1" | "T1.2" | "T1.3" | "T3" | "T5" | "T6" | "T7" | "T8" | "T8A" | "T8B") => {
                      return (
                        <span
                          style={{
                            ...ticketStatusStyles[status], padding: "5px 10px", borderRadius: "4px", display: "inline-flex",
                            justifyContent: "center", alignItems: "center", minWidth: "70px",
                          }}
                        >
                          {status}
                        </span>
                      );
                    },
                  },
                  {
                    title: "Họ tên khách hàng",
                    dataIndex: "customerName",
                    fixed: "left",
                    key: "customerName",
                    render: (customerName) => customerName.length > 25 ? `${customerName.substring(0, 25)} ...` : customerName

                  },
                  {
                    title: "SĐT/MAIL",
                    key: "contactInfo",
                    dataIndex: "contactInfo",
                  },
                  {
                    title: "Loại vấn đề",
                    dataIndex: "title",
                    key: "title",
                  },
                  {
                    title: "Tính năng",
                    dataIndex: "feature",
                    key: "feature",
                  },
                  {
                    title: "Bộ phận tiếp nhận xử lý",
                    dataIndex: "department",
                    key: "department",
                  },
                  {
                    title: "Ngày tiếp nhận xử lý",
                    dataIndex: "receiveDate",
                    key: "receiveDate",
                    render: (text) => text ? dayjs(text).format(formatTicketDate) : '',
                  },
                  {
                    title: "Ngày đóng ticket",
                    dataIndex: "closeDate",
                    key: "closeDate",
                    render: (text) => text ? dayjs(text).format(formatTicketDate) : '',
                  },
                  {
                    title: "Kênh tiếp nhận",
                    dataIndex: "receiveChannel",
                    key: "receiveChannel",
                  },
                  {
                    title: "Nhân viên tiếp nhận",
                    dataIndex: "assignedBy",
                    key: "receiver",
                    render: (assignedBy) => assignedBy?.username || "",
                  },
                  {
                    title: "Hành động",
                    key: "action",
                    dataIndex: "action",
                    fixed: "right",
                    width: 40,
                    render: (text, record, index) => (
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                        <Tooltip title="Xem chi tiết">
                          <EyeOutlined onClick={() => handleOnClickDetail(record)} />
                        </Tooltip>
                      </div>
                    ),
                  }

                ]}
                rowClassName={(record: any, index) =>
                  record?.isSuspect ? "suspect-row" : ""
                }
                dataSource={data?.data || []}
                pagination={false}
                locale={{
                  emptyText: <Empty description="No Data" />,
                }}
                className="ant-border-space"
                scroll={{ x: "max-content" }}
              />
              <Flex vertical style={{ paddingTop: 20, paddingBottom: 20 }}>
                <Pagination
                  pageSize={filter.pageSize}
                  current={filter.page}
                  total={data?.total || 0}
                  onChange={onChangePagination}
                  showSizeChanger
                  pageSizeOptions={["10", "20", "50", "100"]}
                  onShowSizeChange={(current, size) => {
                    onChangePagination(current, size);
                  }}
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
          title={detailId ? "CHI TIẾT TICKET" : "THÊM MỚI TICKET"}
        >
          <DetailTicket
            id={detailId}
            onRefetch={() => { refetch() }}
          />
        </Drawer>
      </div>
    </PageTitleHOC>
  );
};
export default Tickets;