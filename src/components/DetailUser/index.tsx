import React from "react";
import { Button, Form, Input, Card, message } from "antd";
import { PageTitleHOC } from "../PageTitleHOC";
import { useCreateAccountMutation } from "src/store/api/accountApi";

const CreateUser: React.FC<{ onRefetch: () => void }> = ({ onRefetch }) => {
  const [form] = Form.useForm();
  const [createAccount, { isLoading }] = useCreateAccountMutation();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createAccount(values).unwrap();
      message.success("Tạo tài khoản thành công!");
      form.resetFields();
      onRefetch();
    } catch (error) {
      message.error("Tạo tài khoản thất bại!");
    }
  };

  return (
    <div style={{ backgroundColor: "#fff", padding: 20, borderRadius: 8 }}>
      <PageTitleHOC title="Tạo tài khoản mới">
        <Card>
          <Form form={form} layout="vertical">
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
            >
              <Input placeholder="Tên đăng nhập" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password placeholder="Mật khẩu" />
            </Form.Item>
          </Form>

          <Button type="primary" onClick={handleSubmit} loading={isLoading}>
            Tạo tài khoản
          </Button>
        </Card>
      </PageTitleHOC>
    </div>
  );
};

export default CreateUser;