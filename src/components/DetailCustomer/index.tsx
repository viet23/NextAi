import { Button, Card, Col, Descriptions, Flex, Popconfirm, Row, Space, Table } from "antd";
import React, { useEffect } from "react";
import {
  useLazyDetailCustomerQuery,
  useUpdateNotBlacklistMutation,
} from "src/store/api/customerApi";
import Gender from "../Gender";
import { UploadOutlined } from "@ant-design/icons";
interface DetailCustomerProps {
  id: string | null;
  onRefetch: () => {}
}
const DetailCustomer: React.FC<DetailCustomerProps> = ({ id, onRefetch }) => {
  const [detailCustomer, { data }] = useLazyDetailCustomerQuery();
  const [updateNotBlacklist, {isSuccess}] = useUpdateNotBlacklistMutation()
  useEffect(() => {
    if(isSuccess){
      onRefetch()
    }
  }, [isSuccess])
  useEffect(() => {
    if (id) {
      detailCustomer(id);
    }
  }, [id]);
  return (
    <>
      <Row>
        <Col md={24}>
          <Descriptions
            layout="vertical"
            items={[
              {
                key: "name",
                label: "Họ Tên",
                children: data?.customerName,
              },
              {
                key: "phone",
                label: "Số điện thoại",
                children: data?.phoneNo,
              },
              {
                key: "email",
                label: "Email",
                children: data?.email,
              },
              {
                key: "dateOfBirth",
                label: "Ngày sinh",
                children: data?.dateOfBirth,
              },
              {
                key: "gender",
                label: "Giới tính",
                children: <Gender gender={data?.gender} />,
              },
              {
                key: "registerDate",
                label: "Ngày đăng ký",
                span: 3,
                children: data?.createdDate,
              },
            ]}
          />
          <Flex vertical align="flex-end">
            <Space.Compact>
              <Popconfirm title="Xác nhận cập nhật" description="Bạn có muốn thay đổi thông tin của khách hàng" okText="Đồng ý" cancelText="Không đồng ý" onConfirm={() => updateNotBlacklist(id)}>
                <Button type="primary" icon={<UploadOutlined />}>KH Không nằm trong danh sách truy nã</Button>
              </Popconfirm>
            </Space.Compact>
          </Flex>
        </Col>
        <Col md={24} style={{ marginTop: 30 }}>
          <Card title="DANH SÁCH TRUY TÌM TRUY NÃ KHỚP VỚI KHACH HÀNG">
            <Table
              dataSource={data?.blackLists || []}
              columns={[
                {
                  title: "STT",
                  dataIndex: "stt",
                  key: "stt",
                  render: (text, object, index) => index + 1,
                },
                {
                  title: "Họ tên",
                  dataIndex: "fullName",
                  key: "fullName",
                },
                {
                  title: "Năm Sinh",
                  dataIndex: "yearOfBrith",
                  key: "yearOfBrith",
                },
                {
                  title: "Tội danh",
                  key: "crime",
                  dataIndex: "crime",
                },
                {
                  title: "Địa Chỉ",
                  key: "address",
                  dataIndex: "address",
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};
export default DetailCustomer;
