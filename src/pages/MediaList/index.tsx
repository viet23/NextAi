import { CloseOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Button, Card, Col, DatePicker, Drawer, Empty, Flex, Form, Input, Pagination, Radio, RadioChangeEvent, Row, Space, Table, Tooltip,
} from "antd";
import { useForm } from "antd/es/form/Form";
import dayjs, { Dayjs } from "dayjs";
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import DetailTicket from "src/components/DetailTicket";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import { useGetCasesQuery, useLazyGetCaseStaffQuery } from "src/store/api/ticketApi";
import { ReactComponent as RefetchIcon } from "src/assets/images/icon/ic-refetch.svg";
import { FULL_DATE_FORMAT_PARAM } from "src/constants/common.constants";


const { RangePicker } = DatePicker;
const MediaList: React.FC<any> = () => {
  const [form] = useForm();
  const [detailId, setDetailId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSuspect, setIsSuspect] = useState(false);
  const [filter, setFilter] = useState<any>({
    page: 1,
    pageSize: 10,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [getStaffTicket] = useLazyGetCaseStaffQuery();
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

  const handleOnClickDetail = (record: any) => {
    setDetailId(record?.id);
    setIsOpen(true);
  };
  const handleOnCloseDrawer = () => {
    setDetailId(null);
    setIsOpen(false);
  };
  return (
    <PageTitleHOC title="AI MEDIA">
      <div className="layout-content">
        <Row gutter={[24, 0]} style={{ marginBottom: 24 }}>
          <Col xs="24" xl={24}>
            <Card className=" tablespace mb-24" title="Tìm kiếm" style={{ padding: 20 }} >
              <Form form={form} onFinish={handleOnFinish} layout="vertical">
                <Row gutter={[24, 0]}>

                  <Col xl={6} md={12} sm={24}>
                    <Form.Item name="caption" label="Caption">
                      <Input placeholder="Nhập Caption" />
                    </Form.Item>
                  </Col>
                  <Col xl={6} md={12} sm={24}>
                    <Form.Item name="dateTime" label="Từ ngày - Đến ngày">
                      <RangePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xl={6} md={12} sm={24} style={{ display: 'flex', alignItems: 'end', textAlign: "right" }}>
                    <Form.Item label=" " colon={false}>
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
            <Card bordered={false} className="criclebox tablespace mb-24" title="AI MEDIA LIST"
              extra={
                <>
                  <Radio.Group onChange={handleOnChangeRadio} defaultValue="all" style={{ display: "flex", alignItems: "center" }}>

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
                  </Radio.Group>
                </>
              }
            >
              <Table
                columns={[
                  {
                    title: "NO",
                    dataIndex: "no",
                    width: 20,
                    fixed: "left",
                    key: "no",
                    render: (text, object, index) => index + 1,
                  },
                  {
                    title: "Media",
                    fixed: "left",
                    dataIndex: "urlVideo",
                    key: "urlVideo",
                  },
                  {
                    title: "Caption",
                    fixed: "left",
                    dataIndex: "caption",
                    key: "caption",
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
          title={detailId ? "AI MEDIA" : "AI MEDIA NEW"}
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
export default MediaList;