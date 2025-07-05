import { Card, Col, Empty, Radio, Row, Table } from "antd";
import { useTranslation } from "react-i18next";

const Users = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="tabled">
        <Row gutter={[24, 0]}>
          <Col xs="24" xl={24}>
            <Card
              bordered={false}
              className="criclebox tablespace mb-24"
              title="User management"
              extra={
                <>
                  <Radio.Group onChange={() => {}} defaultValue="a">
                    <Radio.Button value="a">All</Radio.Button>
                    <Radio.Button value="b">ONLINE</Radio.Button>
                  </Radio.Group>
                </>
              }
            >
              <div className="table-responsive">
                <Table
                  columns={[
                    {
                      title: "AUTHOR",
                      dataIndex: "name",
                      key: "name",
                      width: "32%",
                    },
                    {
                      title: "FUNCTION",
                      dataIndex: "function",
                      key: "function",
                    },

                    {
                      title: "STATUS",
                      key: "status",
                      dataIndex: "status",
                    },
                    {
                      title: "EMPLOYED",
                      key: "employed",
                      dataIndex: "employed",
                    },
                  ]}
                  dataSource={[]}
                  pagination={false}
                  locale={{
                    emptyText: <Empty description="No Data"></Empty>,
                  }}
                  className="ant-border-space"
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};
export default Users;
