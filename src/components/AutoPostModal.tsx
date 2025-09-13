import React, { useEffect } from "react";
import { Modal, Button, Form } from "antd";

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

const ZALO_LINK = "https://zalo.me/g/bshljq750";
const YT_URL = "https://www.youtube.com/watch?v=bb-DW0W5-6s";
const YT_EMBED = "https://www.youtube.com/embed/GW6IVfA-nZk?start=1";


const AutoPostModal = ({ visible, onClose }: AutoPostModalProps) => {
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    const modalContent = document.querySelectorAll(".ant-modal-content");
    modalContent.forEach((el) => {
      const e = el as HTMLElement;
      e.style.backgroundColor = "#1E293B";
      e.style.color = "#F1F5F9";
      e.style.borderRadius = "12px";
    });

    const header = document.querySelector(".ant-modal-header");
    if (header) {
      const e = header as HTMLElement;
      e.style.backgroundColor = "#1E293B";
      e.style.borderBottom = "none";
    }

    const closeBtn = document.querySelector(".ant-modal-close");
    if (closeBtn) {
      (closeBtn as HTMLElement).style.color = "#CBD5E1";
    }

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

  const handleZaloClick = () => {
    window.open(ZALO_LINK, "_blank", "noopener,noreferrer");
  };

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
      width="80%"
      style={{
        background: "#0F172A",
        boxShadow: "none",
        maxWidth: "1200px",
        maxHeight: "90vh",
      }}
      bodyStyle={{
        background: "#1E293B",
        padding: 24,
        overflowY: "auto",
      }}
    >
      {/* Preview video responsive */}
      <div style={{ position: "relative", paddingTop: "56.25%", marginBottom: 20 }}>
        <iframe
          src={YT_EMBED}
          title="YouTube video player"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: 0,
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>


      <Form layout="vertical" form={form}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",           // nếu màn nhỏ thì tự xuống dòng
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 18, color: "#CBD5E1" }}>
            Tải Facebook Data Extractor{" "}
            <a
              href="https://chromewebstore.google.com/detail/facebook-data-extractor/okcgeoigcaopldeghbemddankjocfbdk?utm_source=item-share-cb"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#3B82F6", textDecoration: "underline" }}
            >
              Tại đây
            </a>
          </div>

          <div style={{ fontSize: 18, color: "#CBD5E1" }}>
            Bạn cần hỗ trợ nhanh hơn? Liên hệ với chúng tôi trên Zalo{" "}
            <a
              href={ZALO_LINK}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#3B82F6", textDecoration: "underline" }}
            >
              Tại đây
            </a>
          </div>
        </div>




        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            htmlType="button"
            onClick={handleZaloClick}
            block
            style={{
              background: "#0F172A",
              color: "#ffffff",
              border: "1px solid #3B82F6",
              borderRadius: 6,
              height: 30,
              fontSize: 15,
              fontWeight: 500,
              boxShadow: "0 0 6px #3B82F6",
            }}
          >
            Liên hệ Admin qua Zalo
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AutoPostModal;
