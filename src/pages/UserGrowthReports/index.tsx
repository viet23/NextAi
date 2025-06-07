import "./userGrowthReports.scss";
import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { ReactComponent as DonwloadIcon } from "src/assets/images/icon/ic-download.svg";
import { ReactComponent as RefetchIcon } from "src/assets/images/icon/ic-refetch.svg";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Flex,
  Form,
  Row,
  Select,
  Space,
  Table,
} from "antd";
import dayjs from "dayjs";
import RenderIf from "src/components/RenderIf";
import {
  FULL_DATE_FORMAT,
  TIME_FILTER_TYPES,
  TIME_FILTER_TYPE_DEFAULT,
  TIME_FILTER_TYPE_MONTH,
} from "src/constants/common.constants";
import { REPORT_TYPES } from "src/constants/user-growth-reports.constants";
import { useUserGrowthReports } from "src/hooks/useUserGrowthReports";
import { getDateFormat, getDatePickerType } from "src/utils/common-utils";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import { usePageAuthorize } from "src/hooks/usePageAuthorize";
import {
  REPORT_USERS,
  REPORT_USERS_EXPORT,
} from "src/constants/roles.constants";
import { ActionAuthorize } from "src/components/ActionAuthorize";
const { RangePicker } = DatePicker;

const UserGrowthReportsPage = () => {
  usePageAuthorize({ roleNames: [REPORT_USERS] });

  const {
    form,
    initFormValues,
    dateFilterTypeWatch,
    columns,
    isSkip,
    dataSource,
    handleChangeType,
    handleResetField,
    handleRefetch,
    handleExport,
    handleOnFinish,
  } = useUserGrowthReports();

  return (
    <PageTitleHOC title="Báo cáo tăng trưởng user">
      <div className="layout-content userGrowthReports">
        <Row className="mb-24" gutter={[24, 0]}>
          <Col xs={24} xl={24}>
            <Card>
              <Form
                layout="vertical"
                requiredMark={false}
                initialValues={initFormValues}
                form={form}
                onFinish={handleOnFinish}
              >
                <Row gutter={[24, 0]}>
                  <Col xs={24} xl={12}>
                    <Form.Item
                      label="Loại báo cáo *"
                      name="type"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn loại báo cáo",
                        },
                      ]}
                    >
                      <Select allowClear placeholder="Báo cáo tăng trưởng user">
                        {REPORT_TYPES.map(({ label, value }) => (
                          <Select.Option key={value} value={value}>
                            {label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} xl={12}>
                    <Form.Item
                      label="Thời gian lọc *"
                      name="dateFilterType"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn thời gian lọc",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Chọn thời gian lọc"
                        onChange={handleChangeType}
                      >
                        {TIME_FILTER_TYPES.map(({ label, value }) => (
                          <Select.Option key={value} value={value}>
                            {label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[24, 24]} justify="center">
                  <Col xs={24} xl={12}>
                    <RenderIf
                      condition={
                        dateFilterTypeWatch === TIME_FILTER_TYPE_DEFAULT
                      }
                    >
                      <Form.Item
                        label="Từ ngày - Đến ngày *"
                        name="dateRangeFilter"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn thời gian",
                          },
                        ]}
                      >
                        <RangePicker
                          className="w-full"
                          name="dateRangeFilter"
                          placeholder={["Từ ngày", "Đến ngày"]}
                          size="middle"
                          format={FULL_DATE_FORMAT}
                        />
                      </Form.Item>
                    </RenderIf>
                    <RenderIf
                      condition={
                        dateFilterTypeWatch !== TIME_FILTER_TYPE_DEFAULT
                      }
                    >
                      <Form.Item
                        label={
                          dateFilterTypeWatch === TIME_FILTER_TYPE_MONTH
                            ? "Chọn năm *"
                            : "Chọn tháng *"
                        }
                        name="dateFilter"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn thời gian",
                          },
                        ]}
                      >
                        <DatePicker
                          className="w-full"
                          picker={getDatePickerType(dateFilterTypeWatch)}
                          name="dateFilter"
                          placeholder="Chọn thời gian"
                          size="middle"
                          minDate={
                            dateFilterTypeWatch === TIME_FILTER_TYPE_MONTH
                              ? dayjs("2023-1-1")
                              : dayjs(new Date()).subtract(6, "months")
                          }
                          maxDate={dayjs(new Date())}
                          format={getDateFormat(dateFilterTypeWatch)}
                        />
                      </Form.Item>
                    </RenderIf>
                  </Col>
                  <Col xs={24} xl={12}>
                    <Flex className="h-full" align="center" justify="end">
                      <Space>
                        <Button
                          danger
                          type="primary"
                          icon={<CloseOutlined />}
                          onClick={handleResetField}
                        >
                          Bỏ lọc
                        </Button>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<SearchOutlined />}
                        >
                          Tìm kiếm
                        </Button>
                      </Space>
                    </Flex>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>
        </Row>

        <RenderIf condition={!isSkip}>
          <Row gutter={[24, 0]}>
            <Col xs={24} xl={24}>
              <Card
                bordered={false}
                className="mb-24"
                title={<span className="card-title">Kết quả tìm kiếm</span>}
                extra={
                  <Space>
                    <ActionAuthorize roleNames={[REPORT_USERS_EXPORT]}>
                      <Button
                        type="primary"
                        icon={<DonwloadIcon />}
                        onClick={handleExport}
                      >
                        Xuất excel
                      </Button>
                    </ActionAuthorize>

                    <Button
                      type="primary"
                      className="btn-refetch"
                      icon={<RefetchIcon />}
                      onClick={handleRefetch}
                    ></Button>
                  </Space>
                }
              >
                <Table
                  rowKey="index"
                  columns={columns}
                  dataSource={dataSource}
                  pagination={false}
                  locale={{
                    emptyText: <Empty description="No Data"></Empty>,
                  }}
                  className="table-scroll"
                  scroll={{ x: 1000 }}
                />
              </Card>
            </Col>
          </Row>
        </RenderIf>
      </div>
    </PageTitleHOC>
  );
};
export default UserGrowthReportsPage;
