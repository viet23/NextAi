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
      message.success("Account created successfully!");
      form.resetFields();
      onRefetch();
    } catch (error) {
      message.error("Account creation failed!");
    }
  };

  return (
    <div style={{ backgroundColor: "#fff", padding: 20, borderRadius: 8 }}>
      <PageTitleHOC title="Create a new account">
        <Card>
          <Form form={form} layout="vertical">
            <Form.Item
              label="Login name"
              name="username"
              rules={[{ required: true, message: "Please enter username" }]}
            >
              <Input placeholder="Login name" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please enter password" }]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>
          </Form>

          <Button type="primary" onClick={handleSubmit} loading={isLoading}>
            Create an account
          </Button>
        </Card>
      </PageTitleHOC>
    </div>
  );
};

export default CreateUser;