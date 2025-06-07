import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Space,
  message,
  AutoComplete,
  Table,
} from "antd";
import dayjs from "dayjs";
import {
  useLazyDetailCaseQuery,
  useCreateCaseMutation,
  useUpdateCaseMutation,
  useLazyGetCaseCustomersQuery,
  useLazyGetCaseStaffQuery,
} from "src/store/api/ticketApi";
import { usePageAuthorize } from "src/hooks/usePageAuthorize";
import { UPDATE_CASE_MANAGE } from "src/constants/roles.constants";
import { useSelector } from "react-redux";
import { IRootState } from "src/interfaces/app.interface";
import { IRole } from "src/interfaces/roles.interface";
import { excludedTicketKeys, formatHistoryTime, formatTicketDate, nameTicketMapping } from "src/constants/ticket.constants";



interface TicketFormProps {
  id: string | null;
  onRefetch: () => void;
}

const DetailTicket: React.FC<TicketFormProps> = ({ id, onRefetch }) => {

  const authRoles = useSelector<IRootState>(
    (state) => state.auth.roles
  ) as IRole[];

  const roleNames = authRoles?.map(role => role.name)

  const [form] = Form.useForm();
  const [contactInfo, setContactInfo] = useState("");
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [optionStaff, setOptionStaff] = useState<{ value: string; label: string }[]>([]);
  const [getDetailTicket, { data, isLoading: isLoadingDetail }] = useLazyDetailCaseQuery();
  const [updateTicket, { isLoading: isUpdating }] = useUpdateCaseMutation();
  const [createTicket, { isLoading: isCreating }] = useCreateCaseMutation();
  const [getCustomerTicket] = useLazyGetCaseCustomersQuery();
  const [getStaffTicket] = useLazyGetCaseStaffQuery();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [assignById, setAssignById] = useState<string | null>(null);
  const [historys, setHistorys] = useState<any[]>([]);

  const handleSearchCustomer = async (valueCustomer: string) => {
    if (!valueCustomer) {
      setOptions([]);
      return;
    }
    try {
      const data = await getCustomerTicket(valueCustomer).unwrap();
      const formattedOptions = data?.data?.map((customer: any) => ({
        value: customer.customerName,
        label: ` ${customer.customerName} - ${customer.phoneNo}`,
        phoneNo: customer.phoneNo,
        id: customer.id,
      }));
      setOptions(formattedOptions);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setOptions([]);
    }
  };

  const handleSearchStaff = async (valueStaff: string) => {
    if (!valueStaff) {
      setOptionStaff([]);
      return;
    }
    try {
      const data = await getStaffTicket(valueStaff).unwrap();
      const formattedOptions = data?.data?.map((user: any) => ({
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

  useEffect(() => {
    if (id) {
      getDetailTicket(id)
        .unwrap()
        .then((ticketData) => {
          form.setFieldsValue({
            ticketId: ticketData?.code,
            createdAt: ticketData?.createdAt ? dayjs(ticketData.createdAt) : null,
            customerName: ticketData?.customerName || "",
            contactInfo: ticketData?.contactInfo || "",
            receiveDate: ticketData?.receiveDate ? dayjs(ticketData.receiveDate) : null,
            problemType: ticketData?.title,
            internalState: ticketData?.internalState,
            handler: ticketData?.assignedBy?.username || "",
            feature: ticketData?.feature,
            featureDetails: ticketData?.featureDetails,
            processingPlan: ticketData?.solution,
            department: ticketData?.department,
            handlingDate: ticketData?.ticketCloseDate ? dayjs(ticketData.ticketCloseDate) : null,
            callContent: ticketData?.description,
            note: ticketData?.note,
            closeDate: ticketData?.closeDate ? dayjs(ticketData.closeDate) : null,
            receiveChannel: ticketData?.receiveChannel || "",
          });
          setCustomerId(ticketData?.customers?.[0]?.id || null);
          setAssignById(ticketData?.assignedBy?.id || null);
          setHistorys(ticketData?.history);
        })
        .catch((error) => {
          message.error("Lỗi khi lấy thông tin ticket!");
        });
    } else {
      form.resetFields();
    }
  }, [id, getDetailTicket]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const body = {
        title: values?.problemType || "",
        description: values?.callContent || "",
        internalState: values?.internalState || "",
        solution: values?.processingPlan || "",
        assignBy: assignById || 0,
        customerIds: [customerId],
        customerName: values.customerName || "",
        contactInfo: values?.contactInfo || "",
        receiveDate: values?.receiveDate?.toISOString() || null,
        problemType: values?.problemType || "",
        handler: values?.handler || "",
        feature: values?.feature || "",
        featureDetails: values?.featureDetails || "",
        processingPlan: values?.processingPlan || "",
        department: values?.department || "",
        handlingDate: values?.handlingDate?.toISOString() || null,
        callContent: values?.callContent || "",
        note: values?.note || "",
        closeDate: values?.closeDate?.toISOString() || null,
        receiveChannel: values?.receiveChannel || "",
      };
      if (id) {
        const result = await updateTicket({ id, body });
        if (result && result.data) {
          message.success("Cập nhật ticket thành công!");
          window.location.reload();
        }
      } else {
        const result = await createTicket(body);
        if (result && result.data) {
          message.success("Thêm mới ticket thành công!");
          window.location.reload();
        }
      }
      onRefetch();
    } catch (error) {
      message.error("Lỗi khi thêm hoặc cập nhật ticket!");
    }
  };

  const listHistory = historys?.map((item) => {
    if (item.action !== "UPDATE") {
      return { key: item.id, action: item.action, updateBy: item.updateBy?.fullName, createdAt: item.createdAt };
    }

    const oldData: Record<string, any> = {};
    const newData: Record<string, any> = {};

    Object.entries(item.oldData)
      .filter(([key, oldValue]) => !excludedTicketKeys.includes(key) && oldValue !== item.newData[key])
      .forEach(([key, oldValue]) => {
        const mappedKey = nameTicketMapping[key] || key;
        oldData[mappedKey] = oldValue;
        newData[mappedKey] = item.newData[key];
      });

    return {
      key: item.id,
      action: item.action,
      updateBy: item.updateBy?.fullName,
      old: Object.keys(oldData)?.length ? oldData : null,
      new: Object.keys(newData)?.length ? newData : null,
      createdAt: item.createdAt,
    };
  });

  const columnHistory = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      fixed: "left" as const,
      render: (createdAt: string) => dayjs(createdAt).format(formatHistoryTime),
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      fixed: "left" as const,
      render: (action: string) => (action === "UPDATE" ? "Cập nhật" : "Tạo mới"),
    },
    {
      title: "Người cập nhập",
      dataIndex: "updateBy",
      key: "updateBy",
      fixed: "left" as const,
    },
    {
      title: "Dữ liệu cũ",
      dataIndex: "old",
      key: "old",
      render: (old: Record<string, any>) =>
        old ? Object.entries(old)?.map(([key, value]) => (<div key={key}><b>{key}:</b> {value || ''}</div>)) : '',
    },
    {
      title: "Dữ liệu mới",
      dataIndex: "new",
      key: "new",
      render: (newData: Record<string, any>) =>
        newData ? Object.entries(newData)?.map(([key, value]) => (<div key={key}><b>{key}:</b> {value || ''}</div>)) : '',
    },
  ];

  return (
    <div style={{ backgroundColor: "#fff", padding: 20, borderRadius: 8 }}>
      <Row justify="end" align="middle" style={{ marginBottom: 20 }}>
        <Space>
          <Button type="primary" onClick={handleSave} loading={isCreating || isUpdating}>
            {id ? "Cập nhật" : "Thêm mới"}
          </Button>
        </Space>
      </Row>
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          {/* Cột 1 */}
          <Col span={8}>
            <Form.Item label="Mã ticket" name="ticketId">
              <Input disabled placeholder="Mã ticket" style={{ color: 'black' }} />
            </Form.Item>

            <Form.Item label="Ngày tiếp nhận xử lý" name="receiveDate" rules={[
              {
                required: true,
                message: "Vui lòng chọn ngày tiếp nhận xử lý!",
              },
            ]}>
              <DatePicker
                style={{ width: "100%" }}
                format={formatTicketDate}
                allowClear={true}
              />
            </Form.Item>

            <Form.Item label='Loại vấn đề' name="problemType" rules={[
              {
                required: true,
                message: "Vui lòng chọn loại vấn đề!",
              },
            ]}>
              <Select
                placeholder="Chọn loại vấn đề"
                style={{ color: 'black' }}>
                <Select.Option value="Hướng dẫn sử dụng">Hướng dẫn sử dụng</Select.Option>
                <Select.Option value="Báo lỗi tính năng">Báo lỗi tính năng</Select.Option>
                <Select.Option value="Tra soát (GD lỗi/Đã trừ tiền)">Tra soát (GD lỗi/Đã trừ tiền)</Select.Option>
                <Select.Option value="Cung cấp thông tin">Cung cấp thông tin</Select.Option>
                <Select.Option value="Góp ý">Góp ý</Select.Option>
                <Select.Option value="Cập nhật thông tin tài khoản">Cập nhật thông tin tài khoản</Select.Option>
                <Select.Option value="Khiếu nại">Khiếu nại</Select.Option>
                <Select.Option value="Khác">Khác</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Trạng thái ticket" name="internalState" rules={[
              {
                required: true,
                message: "Vui lòng chọn trạng thái ticket!",
              },
            ]} >
              <Select placeholder="Chọn trạng thái" >
                <Select.Option value="T0">T0</Select.Option>
                <Select.Option value="T0.2">T0.2</Select.Option>
                <Select.Option value="T0.3">T0.3</Select.Option>
                <Select.Option value="T1">T1</Select.Option>
                <Select.Option value="T1.2">T1.2</Select.Option>
                <Select.Option value="T1.3">T1.3</Select.Option>
                <Select.Option value="T3">T3</Select.Option>
                <Select.Option value="T5">T5</Select.Option>
                <Select.Option value="T6">T6</Select.Option>
                <Select.Option value="T7">T7</Select.Option>
                <Select.Option value="T8">T8</Select.Option>
                <Select.Option value="T8A">T8A</Select.Option>
                <Select.Option value="T8B">T8B</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Nội dung cuộc gọi" name="callContent">
              <Input.TextArea rows={6} placeholder="Nội dung cuộc gọi" style={{ color: 'black' }} />
            </Form.Item>

            {id && (
              <Form.Item label="Ngày tiếp nhận ticket" name="createdAt">
                <DatePicker
                  style={{
                    width: "100%",
                    backgroundColor: !!id ? "#f5f5f5" : "white",
                    cursor: !!id ? "not-allowed" : "text",
                  }}
                  format={formatTicketDate}
                  allowClear={true}
                  disabled={!!id}
                />
              </Form.Item>
            )}


          </Col>

          {/* Cột 2 */}
          <Col span={8}>
            <Form.Item
              label="Tên khách hàng"
              name="customerName"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn tên khách hàng!",
                },
              ]}
            >
              <AutoComplete
                placeholder="Tên khách hàng"
                onSearch={handleSearchCustomer}
                options={options}
                onSelect={(value, option: any) => {
                  form.setFieldsValue({ contactInfo: option.phoneNo, customerId: option.id });
                  setCustomerId(option.id);
                }}
                disabled={!roleNames.includes(UPDATE_CASE_MANAGE) && !!id}
              >
                <Input style={{ color: 'black' }} />
              </AutoComplete>
            </Form.Item>


            <Form.Item label="Kênh tiếp nhận" name="receiveChannel" rules={[
              {
                required: true,
                message: "Vui lòng chọn kênh tiếp nhận!",
              },
            ]}>
              <Select placeholder="Chọn kênh tiếp nhận" >
                <Select.Option value="Hotline">Hotline</Select.Option>
                <Select.Option value="email">Email</Select.Option>
                <Select.Option value="ZOA">ZOA</Select.Option>
                <Select.Option value="Group Zalo">Group Zalo</Select.Option>  
                <Select.Option value="Facebook">Facebook</Select.Option>
                <Select.Option value="Nội bộ">Nội bộ</Select.Option>
                <Select.Option value="VH106">VH106</Select.Option>
                <Select.Option value="Miss call">Miss call</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Tính năng" name="feature" rules={[
              {
                required: true,
                message: "Vui lòng chọn tính năng!",
              },
            ]}>
              <Select placeholder="Tính năng" >
                <Select.Option value="Đăng ký ">Đăng ký </Select.Option>
                <Select.Option value="Đăng nhập">Đăng nhập</Select.Option>
                <Select.Option value="Nạp tiền">Nạp tiền</Select.Option>
                <Select.Option value="Rút tiền">Rút tiền</Select.Option>
                <Select.Option value="Thanh toán">Thanh toán</Select.Option>
                <Select.Option value="Xác thực">Xác thực</Select.Option>
                <Select.Option value="Liên kết ngân hàng">Liên kết ngân hàng</Select.Option>
                <Select.Option value="Thông tin tài khoản">Thông tin tài khoản</Select.Option>
                <Select.Option value="Khác">Khác</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Bộ phận tiếp nhận xử lý" name="department" rules={[
              {
                required: true,
                message: "Vui lòng chọn bộ phận tiếp nhận xử lý!",
              },
            ]}>
              <Select placeholder="Bộ phận tiếp nhận" >
                <Select.Option value="Kỹ thuật">Kỹ thuật</Select.Option>
                <Select.Option value="Kế toán">Kế toán</Select.Option>
                <Select.Option value="Vận hành">Vận hành</Select.Option>
                <Select.Option value="CSKH">CSKH</Select.Option>
                <Select.Option value="Đối soát">Đối soát</Select.Option>
                <Select.Option value="Quản trị rủi ro">Quản trị rủi ro</Select.Option>
                <Select.Option value="Pháp chế">Pháp chế</Select.Option>
                <Select.Option value="Phát triển sản phẩm">Phát triển sản phẩm</Select.Option>
                <Select.Option value="Kinh doanh">Kinh doanh</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Phương án xử lý" name="processingPlan">
              <Input.TextArea rows={6} placeholder="Phương án xử lý" />
            </Form.Item>
          </Col>

          {/* Cột 3 */}
          <Col span={8}>
            <Form.Item label="SDT/Email" name="contactInfo" rules={[
              {
                required: true,
                message: "Vui lòng chọn SDT/Email!",
              },
            ]}>
              <Input placeholder="Số điện thoại / Email" disabled={!roleNames.includes(UPDATE_CASE_MANAGE) && !!id} style={{ color: 'black' }} />
            </Form.Item>

            <Form.Item label="Nhân viên tiếp nhận" name="handler" rules={[
              {
                required: true,
                message: "Vui lòng chọn nhân viên tiếp nhận!",
              },
            ]}>
              <AutoComplete
                placeholder="Nhân viên tiếp nhận"
                onSearch={handleSearchStaff}
                onSelect={(value, option: any) => setAssignById(option.id)}
                options={optionStaff}
                disabled={!roleNames.includes(UPDATE_CASE_MANAGE) && !!id}
              >
                <Input style={{ color: 'black' }} />
              </AutoComplete>
            </Form.Item>

            <Form.Item
              label="Chi tiết tính năng"
              name="featureDetails"
              rules={[{ required: true, message: "Vui lòng chọn chi tiết tính năng!" }]}
            >
              <Select placeholder="Chọn chi tiết tính năng" >
                <Select.Option value="Chụp ảnh">Chụp ảnh</Select.Option>
                <Select.Option value="Quét NFC, MNZ">Quét NFC, MNZ</Select.Option>
                <Select.Option value="VTB">VTB</Select.Option>
                <Select.Option value="Napas">Napas</Select.Option>
                <Select.Option value="Đổi SĐT">Đổi SĐT</Select.Option>
                <Select.Option value="Thông tin chủ tài khoản">Thông tin chủ tài khoản</Select.Option>
                <Select.Option value="Khoá ví">Khoá ví</Select.Option>
                <Select.Option value="Mở ví">Mở ví</Select.Option>
                <Select.Option value="Sao kê">Sao kê</Select.Option>
                <Select.Option value="Hoá đơn">Hoá đơn</Select.Option>
                <Select.Option value="Hoàn tiền">Hoàn tiền</Select.Option>
                <Select.Option value="Không nhận được/lỗi OTP">Không nhận được/lỗi OTP</Select.Option>
                <Select.Option value="Khác">Khác</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Ngày đóng ticket" name="closeDate"
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const receiveDate = getFieldValue("receiveDate");
                    if (!value || !receiveDate || value.isAfter(receiveDate) || value.isSame(receiveDate, "day")) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Ngày đóng ticket không được trước ngày tiếp nhận xử lý!"));
                  },
                }),
              ]}>
              <DatePicker
                style={{ width: "100%" }}
                format={formatTicketDate}
                allowClear={true}
              />
            </Form.Item>

            <Form.Item label="Ghi chú" name="note">
              <Input.TextArea rows={6} placeholder="Ghi chú" />
            </Form.Item>

          </Col>
        </Row>
      </Form>

      {listHistory?.length > 0 && (
        <><h3>Lịch sử chỉnh sửa</h3>
          <Table
            columns={columnHistory}
            dataSource={listHistory}
            pagination={false}
            style={{ marginTop: 20 }}
            scroll={{ x: "max-content" }}
          />
        </>
      )}

    </div>
  );
};

export default DetailTicket;
