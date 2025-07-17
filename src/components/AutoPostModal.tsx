import React, { useEffect } from "react";
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

// Style input
const inputStyle: React.CSSProperties = {
  background: "#0F172A",
  border: "1px solid #334155",
  color: "#F1F5F9",
  height: 38,
  borderRadius: 6,
  padding: "0 12px",
};

// Style label
const labelStyle: React.CSSProperties = {
  color: "#F1F5F9",
  fontWeight: 500,
};

const AutoPostModal = ({ visible, onClose }: AutoPostModalProps) => {
  const [form] = Form.useForm<FormValues>();
  const [sendEmail, { isLoading }] = useSendEmailMutation();

  const handleSubmit = async (values: FormValues) => {
    try {
      await sendEmail(values).unwrap();
      message.success("Thông tin của bạn đã được gửi thành công!");
      form.resetFields();
      onClose();
    } catch (err) {
      console.error("❌ Failed to send form:", err);
      message.error("Gửi thất bại. Vui lòng thử lại.");
    }
  };

  // 👉 Ghi đè modal AntD để đổi nền trắng
  useEffect(() => {
    const modalElements = document.querySelectorAll(".ant-modal-content");
    modalElements.forEach(el => {
      (el as HTMLElement).style.backgroundColor = "#1E293B";
      (el as HTMLElement).style.color = "#F1F5F9";
      (el as HTMLElement).style.borderRadius = "12px";
    });

    const header = document.querySelector(".ant-modal-header");
    if (header) {
      (header as HTMLElement).style.backgroundColor = "#1E293B";
      (header as HTMLElement).style.borderBottom = "none";
    }

    const closeBtn = document.querySelector(".ant-modal-close");
    if (closeBtn) {
      (closeBtn as HTMLElement).style.color = "#CBD5E1";
    }

    // ✅ Set màu placeholder (toàn cục)
    const style = document.createElement("style");
    style.innerHTML = `
      input::placeholder {
        color: #94A3B8 !important;
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [visible]);

  return (
    <Modal
      title={
        <h4 style={{ color: "#F8FAFC", textAlign: "center", margin: 0 }}>
          Thiết lập tự động đăng bài Facebook
        </h4>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      style={{
        background: "#0F172A",
        boxShadow: "none",
      }}
      bodyStyle={{
        background: "#1E293B",
        padding: 24,
      }}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          name="fullName"
          label={
            <span style={labelStyle}>
              Họ và tên
            </span>
          }
          rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
        >
          <Input placeholder="Nhập họ và tên" style={inputStyle} />
        </Form.Item>

        <Form.Item
          name="email"
          label={<span style={labelStyle}> Email</span>}
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input placeholder="Nhập email" style={inputStyle} />
        </Form.Item>

        <Form.Item
          name="phone"
          label={
            <span style={labelStyle}>
              Số điện thoại
            </span>
          }
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
        >
          <Input placeholder="+84  Nhập số điện thoại" style={inputStyle} />
        </Form.Item>

        <Form.Item name="zalo" label={<span style={labelStyle}>Số Zalo</span>}>
          <Input placeholder="Nhập số Zalo" style={inputStyle} />
        </Form.Item>

        <div style={{ fontSize: 13, color: "#CBD5E1", marginBottom: 16 }}>
          Bạn cần hỗ trợ nhanh hơn? Liên hệ với chúng tôi trên{" "}
          <a
            href="https://www.facebook.com/profile.php?id=61577170059261"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#3B82F6" }}
          >
            Facebook
          </a>
        </div>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            htmlType="submit"
            loading={isLoading}
            block
            style={{
              background: "#0F172A",
              color: "#ffffff",
              border: "1px solid #3B82F6",
              borderRadius: 6,
              height: 42,
              fontSize: 15,
              fontWeight: 500,
              boxShadow: "0 0 6px #3B82F6",
            }}
          >
            Liên hệ Admin
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AutoPostModal;
