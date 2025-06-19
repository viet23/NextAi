import React from "react";
import { Modal, Input, Button, Form, message } from "antd";
import { useSendEmailMutation } from "src/store/api/email";

interface AutoPostModalProps {
  visible: boolean;
  onClose: () => void;
}

interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  zalo?: string;
}

const AutoPostModal: React.FC<AutoPostModalProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm<FormValues>();
  const [sendEmail, { isLoading }] = useSendEmailMutation();

  const handleSubmit = async (values: FormValues) => {
    try {
      const res = await sendEmail(values).unwrap();
      message.success("Your information has been sent successfully!");
      form.resetFields();
      onClose();
    } catch (err) {
      console.error("❌ Failed to send form:", err);
      message.error("Submission failed. Please try again.");
    }
  };

  return (
    <Modal
      title="Facebook Auto-Posting Setup"
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          name="fullName"
          label="Full Name"
          rules={[{ required: true, message: "Please enter your full name" }]}
        >
          <Input placeholder="Enter your full name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Invalid email format" },
          ]}
        >
          <Input placeholder="Enter your email" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[{ required: true, message: "Please enter your phone number" }]}
        >
          <Input placeholder="Enter your phone number" />
        </Form.Item>

        <Form.Item name="zalo" label="Zalo (optional)">
          <Input placeholder="Enter your Zalo number (optional)" />
        </Form.Item>

        <div style={{ fontSize: 12, marginTop: -8, marginBottom: 16 }}>
          Need faster support? Contact us on Facebook:&nbsp;
          <a
            href="https://www.facebook.com/profile.php?id=61577170059261"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1677ff" }}
          >
            Message on Facebook
          </a>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          block
          loading={isLoading}
          style={{ background: "#000", borderColor: "#000" }}
        >
          Contact Admin
        </Button>
      </Form>
    </Modal>
  );
};

export default AutoPostModal;
