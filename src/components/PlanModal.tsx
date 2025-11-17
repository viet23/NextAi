import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Image, message } from "antd";
import { useSelector } from "react-redux";
import { IRootState } from "src/interfaces/app.interface";
import { useBuyPlanMutation } from "src/store/api/accountApi";
// Nếu có ảnh QR thanh toán sẵn trong assets
import QR from "src/assets/images/QR.jpg";


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

type PlanName = "Free" | "Starter" | "Pro" | "Enterprise";


const PlanModal = ({ visible, onClose }: AutoPostModalProps) => {
  const [form] = Form.useForm<FormValues>();
  const { user } = useSelector((state: IRootState) => state.auth || { user: undefined });

  // API mua gói
  const [buyPlan, { isLoading: buying }] = useBuyPlanMutation();

  // State cho mua gói qua QR
  const [qrOpen, setQrOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PlanName | null>(null);

  const planPriceMap: Record<PlanName, string> = useMemo(
    () => ({
      Free: "0đ",
      Starter: "499.000đ",
      Pro: "1.999.000đ",
      Enterprise: "4.999.000đ",
    }),
    []
  );

  const plans: Array<{
    name: PlanName;
    price: string;
    sub: string;
    note?: string;
    features: string[];
  }> = useMemo(
    () => [
      // {
      //   name: "Free",
      //   price: "0đ",
      //   sub: "/ 7 Days",
      //   features: [
      //     "Số lượng chiến dịch: tối đa 2 chiến dịch.",
      //     "Ngân sách mỗi chiến dịch: tối đa 5 triệu/tháng.",
      //     "Không mở tính năng tối ưu nâng cao (AI chỉ gợi ý cơ bản).",
      //   ],
      // },
      {
        name: "Starter",
        price: "499.000đ",
        sub: "/tháng",
        features: [
          "Tối đa 3 chiến dịch/tháng.",
          "Ngân sách tối đa 10 triệu/tháng.",
          "AI gợi ý content, target & ngân sách.",
          "Báo cáo & đề xuất tối ưu hằng tuần.",
          "Báo cáo qua mail.",
        ],
      },
      {
        name: "Pro",
        price: "1.999.000đ",
        sub: "/tháng",
        note: "(Giảm 50% khi mua 1 năm - 20% khi mua 6 tháng)",
        features: [
          "Chiến dịch không giới hạn.",
          "AI tối ưu real-time theo CPC, CTR, ROAS.",
          "Tự động A/B Testing mẫu quảng cáo.",
          "Hỗ trợ nhiều nền tảng: Facebook, Google, TikTok.",
          "Báo cáo & đề xuất tối ưu hằng ngày.",
        ],
      },
      {
        name: "Enterprise",
        price: "4.999.000đ",
        sub: "/tháng",
        note: "(Giảm 50% khi mua 1 năm - 20% khi mua 6 tháng)",
        features: [
          "Mọi tính năng gói Pro +",
          "AI phân bổ ngân sách tự động đa kênh.",
          "Quản lý nhiều tài khoản quảng cáo.",
          "Cố vấn chiến dịch 1–1 hằng tháng.",
          "Tích hợp CRM & remarketing tự động.",
          "Hỗ trợ kỹ thuật ưu tiên 24/7.",
        ],
      },
    ],
    []
  );

  // Style modal dark
  useEffect(() => {
    if (!visible) return;
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


  const openQRModal = (planName: PlanName) => {
    setPendingPlan(planName);
    setQrOpen(true);
  };

  const canShowBuyButton = (planName: PlanName) => {
    if (planName === "Free") return false;
    const cur = user?.currentPlan;
    if (!cur) return true;
    const samePlan = cur.name === planName;
    const notExpired = cur.endDate && new Date(cur.endDate) > new Date();
    if (samePlan && notExpired) return false;
    return true;
  };

  const handleConfirmTransfer = async () => {
    if (!pendingPlan) return;
    try {
      await buyPlan({ name: pendingPlan, months: 1 }).unwrap();
      message.success(`Đã tạo yêu cầu mua gói ${pendingPlan}`);
      setQrOpen(false);
    } catch (err: any) {
      message.error(err?.data?.message || "Mua gói thất bại");
    }
  };

  return (
    <>
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        centered
        width="90%"
        // closable={false}
        style={{
          background: "#0F172A",
          boxShadow: "none",
          maxWidth: "1200px",
          maxHeight: "90vh",
        }}

      >

        {/* ====== PHẦN PLAN (THÊM VÀO MODAL) ====== */}
        <div className="customer-segment" style={{ textAlign: "center", color: "#fff" }}>
          <h2 className="section-title no-before" style={{ marginBottom: 8 }}>
            Ưu đãi credits tốt nhất hôm nay
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
              maxWidth: 1100,
              margin: "0 auto",
              marginTop: 24
            }}
          >
            {plans.map((plan, i) => (
              <div
                key={i}
                style={{
                  background: "linear-gradient(145deg, rgba(0,102,255,0.1), rgba(0,0,0,0.6))",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16,
                  padding: 24,
                  textAlign: "left",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 0 25px rgba(0,140,255,0.15)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: 1,
                      opacity: 0.7,
                      marginBottom: 10,
                      textAlign: "center",
                    }}
                  >
                    {plan.name}
                  </div>
                  <div style={{ fontSize: 24, textAlign: "center", fontWeight: "bold" }}>
                    {plan.price} {plan.sub}
                  </div>
                  {plan.note && (
                    <div style={{ fontSize: 12, color: "#bbb", marginBottom: 12 }}>{plan.note}</div>
                  )}
                  <ul style={{ listStyle: "none", padding: 0, margin: "20px 0" }}>
                    {plan.features.map((f, idx) => (
                      <li
                        key={idx}
                        style={{
                          margin: "8px 0",
                          fontSize: 14,
                          position: "relative",
                          paddingLeft: 20,
                        }}
                      >
                        <span style={{ position: "absolute", left: 0, color: "#3b82f6" }}>✔</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {canShowBuyButton(plan.name) && (
                  <button
                    className="btn-text"
                    style={{ marginTop: "auto" }}
                    disabled={buying}
                    onClick={() => openQRModal(plan.name)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "#3b82f6";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#3b82f6";
                    }}
                  >
                    {buying ? "Processing..." : "Đăng ký ngay"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* ====== HẾT PHẦN PLAN ====== */}
      </Modal>

      {/* Modal QR xác nhận thanh toán (nằm ngoài để không bị scroll theo body modal chính) */}
      <Modal
        open={qrOpen}
        onCancel={() => setQrOpen(false)}
        centered
        title={
          <div style={{ textAlign: "center", width: "100%" }}>
            Xác nhận thanh toán {pendingPlan ?? ""}
          </div>
        }
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Button key="cancel" onClick={() => setQrOpen(false)}>
              Đóng
            </Button>
            <Button key="ok" type="primary" onClick={handleConfirmTransfer} loading={buying}>
              Tôi đã chuyển tiền
            </Button>
          </div>
        }
      >
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ textAlign: "center" }}>
            <Image src={QR} alt="QR thanh toán" style={{ maxWidth: 260 }} preview={false} />
          </div>
          <div style={{ fontSize: 14, textAlign: "center" }}>
            <div>
              <strong>Gói:</strong> {pendingPlan ?? "-"}
            </div>
            <div>
              <strong>Số tiền:</strong> {pendingPlan ? planPriceMap[pendingPlan] : "-"}
            </div>
            <div>
              <strong>Nội dung CK:</strong> {user?.email || user?.username || "Tài khoản"}
            </div>
            <div style={{ marginTop: 8 }}>
              Vui lòng quét mã QR để thanh toán. Sau khi chuyển thành công, bấm{" "}
              <b>“Tôi đã chuyển tiền”</b> để xác nhận.
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PlanModal;
