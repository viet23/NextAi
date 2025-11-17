import { CaretRightOutlined } from "@ant-design/icons";
import "./credits.scss";
import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Layout,
  message,
  Modal,
  Row,
  Select,
  Table,
  Radio,
  Image,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import { useBuyPlanMutation, useGetAccountQuery } from "src/store/api/accountApi";
import { useGetRoleGroupsQuery } from "src/store/api/roleApi";
import { useTranslation } from "react-i18next";
import { Collapse } from "antd";
import { useSelector } from "react-redux";
import { IRootState } from "src/interfaces/app.interface";
import { useSendCreditsMutation } from "src/store/api/email";
import { useGetCreditQuery } from "src/store/api/ticketApi";
import dayjs from "dayjs";
import QR from "../../assets/images/QR.jpg";


type PlanName = "Free" | "Starter" | "Pro" | "Enterprise";

const { Panel } = Collapse;

interface FormValues {
  credits: string | number;
  vnd: string | number;
}

const CreditsPage = () => {
  const { user } = useSelector((state: IRootState) => state.auth || { user: undefined });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const [form] = Form.useForm<FormValues>();
  const [userGroups, setUserGroups] = useState<undefined | any[]>([]);
  const [sendEmail, { isLoading }] = useSendCreditsMutation();
  const { data: creditData } = useGetCreditQuery({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  // API mua gói
  const [buyPlan, { isLoading: buying }] = useBuyPlanMutation();

  const paymentHistory = creditData?.map((item: any) => ({
    status: item?.status,
    id: item?.id,
    date: item?.paymentDate ? dayjs(item.paymentDate).format("HH:mm - DD/MM/YYYY") : "",
    amount:
      typeof item?.amountPaidVnd === "number"
        ? item.amountPaidVnd.toLocaleString("vi-VN")
        : "",
    credits:
      typeof item?.creditsPurchased === "number"
        ? item.creditsPurchased.toLocaleString("vi-VN")
        : "",
  }));

  const { data: accountDetailData } = useGetAccountQuery(params.id || "0", {
    skip: !params.id,
  });
  const { data: roleGroupsData } = useGetRoleGroupsQuery({});

  const [credits, setCredits] = useState<number | undefined>(user?.credits);

  useEffect(() => {
    if (roleGroupsData && accountDetailData) {
      setUserGroups(
        roleGroupsData?.map((group: any) => ({
          ...group,
          checked: accountDetailData?.groups?.some((i: any) => i?.id === group.id),
        }))
      );
    }
  }, [roleGroupsData, accountDetailData]);

  // ====== Giá credits ======
  const BASE_CREDITS = 500;
  const BASE_PRICE = 179_000;
  const priceForCredits = (c: number) => {
    const unit = BASE_PRICE / BASE_CREDITS;
    return Math.round((unit * c) / 1000) * 1000;
  };
  const creditPackages = [200, 500, 1000, 2000, 3000].map((c) => ({
    credits: c,
    price: c === 500 ? BASE_PRICE : priceForCredits(c),
  }));
  const [selectedPackage, setSelectedPackage] = useState(
    creditPackages.find((p) => p.credits === 500)!
  );

  const planPriceMap: Record<PlanName, string> = {
    Free: "0đ",
    Starter: "499.000đ",
    Pro: "1.999.000đ",
    Enterprise: "4.999.000đ",
  };

  useEffect(() => {
    form.setFieldsValue({
      credits: selectedPackage.credits,
      vnd: selectedPackage.price.toLocaleString("vi-VN"),
    });
  }, [selectedPackage, form]);



  // Modal xác nhận thanh toán (quét QR)
  const [qrOpen, setQrOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PlanName | null>(null);

  const openQRModal = (planName: PlanName) => {
    setPendingPlan(planName);
    setQrOpen(true);
  };

  // Danh sách gói
  const plans: Array<{
    name: PlanName;
    price: string;
    sub: string;
    note?: string;
    features: string[];
  }> = [
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
    ];

  // Helper kiểm tra có nên hiển thị nút “Đăng ký ngay” hay không
  const canShowBuyButton = (planName: PlanName) => {
    if (planName === "Free") return false;
    const cur = user?.currentPlan;
    if (!cur) return true;
    const samePlan = cur.name === planName;
    const notExpired = cur.endDate && new Date(cur.endDate) > new Date();
    // Ẩn nếu đang cùng gói và còn hạn
    if (samePlan && notExpired) return false;
    return true;
  };

  const handleConfirmTransfer = async () => {
    const payload = {
      credits: String(selectedPackage.credits),
      vnd: String(selectedPackage.price),
    };
    try {
      await sendEmail(payload as any).unwrap();
      message.success("Xác nhận thanh toán thành công! Admin sẽ cộng credits cho bạn.");
      setIsModalVisible(false);
      window.location.reload();
    } catch (err) {
      console.error("❌ Failed:", err);
      message.error("Xác nhận thất bại. Vui lòng thử lại.");
    }
  };

  const handleConfirmTransferPlan = async () => {
    if (!pendingPlan) return;
    try {
      const res = await buyPlan({ name: pendingPlan, months: 1 }).unwrap();
      message.success(`Đã tạo yêu cầu mua gói ${pendingPlan}`);
      // Nếu muốn refetch user sau khi mua, có thể dispatch action lấy lại profile ở đây.
      setQrOpen(false);
    } catch (err: any) {
      message.error(err?.data?.message || "Mua gói thất bại");
    }
  };

  return (
    <PageTitleHOC title="Chi tiết tài khoản Credits">
      <Layout style={{ minHeight: "100vh", background: "#0f172a" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h3
            style={{
              textAlign: "center",
              color: "#fff",
              marginBottom: 12,
              marginTop: 24,
            }}
          >
            {t("credits.user_credits")}
          </h3>

          <Card className="accountDetail" style={{ marginBottom: 24 }}>
            <Row gutter={[24, 16]} justify="space-between" align="middle">
              <Col>
                <div style={{ fontSize: 32, fontWeight: 600, color: "#fff" }}>
                  {typeof credits === "number"
                    ? credits.toLocaleString("vi-VN")
                    : 0}{" "}
                  <span style={{ fontSize: 16, marginLeft: 6 }}>💎</span>
                </div>
              </Col>
              <Col>
                <Button
                  size="large"
                  className="btn-text"
                  onClick={() => setIsModalVisible(true)}
                >
                  {t("credits.buy_more")}
                </Button>
              </Col>
            </Row>
          </Card>

          <div className="customer-segment">
            <h2 className="section-title no-before"> Ưu đãi credits tốt nhất hôm nay</h2>
          </div>

          <div className="customer-segment" style={{ textAlign: "center", color: "#fff" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 20,
                maxWidth: 1100,
                margin: "0 auto",
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
                    {plan.note && <div style={{ fontSize: 12, color: "#bbb", marginBottom: 12 }}>{plan.note}</div>}
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
                      onClick={() => openQRModal(plan.name)} // mở modal QR, KHÔNG gọi API ngay
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

          <Card className="accountDetail">
            <Collapse
              defaultActiveKey={["1"]}
              ghost
              expandIconPosition="start"
              expandIcon={({ isActive }) => (
                <CaretRightOutlined
                  rotate={isActive ? 90 : 0}
                  style={{ color: "#ffffff" }}
                />
              )}
            >
              <Panel
                key="1"
                header={
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>
                    {t("credits.payment_history")}
                  </span>
                }
              >
                <Flex
                  justify="space-between"
                  align="center"
                  style={{ marginBottom: 16 }}
                >
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>
                    Thông tin thanh toán
                  </span>

                  <Select defaultValue="3_months" style={{ width: 160 }}>
                    <Select.Option value="3_months">
                      {t("credits.last_3_months")}
                    </Select.Option>
                    <Select.Option value="6_months">
                      {t("credits.last_6_months")}
                    </Select.Option>
                    <Select.Option value="12_months">
                      {t("credits.last_12_months")}
                    </Select.Option>
                  </Select>
                </Flex>
                <Table
                  className="table-scroll dark-header-table"
                  rowKey="id"
                  columns={[
                    {
                      title: t("credits.table.index"),
                      dataIndex: "index",
                      key: "index",
                      width: 80,
                    },
                    {
                      title: t("credits.table.payment_date"),
                      dataIndex: "date",
                      key: "date",
                    },
                    {
                      title: t("credits.table.amount_paid"),
                      dataIndex: "amount",
                      key: "amount",
                      align: "right",
                    },
                    {
                      title: t("credits.table.credits_bought"),
                      dataIndex: "credits",
                      key: "credits",
                      align: "right",
                    },
                    {
                      title: t("credits.table.status"),
                      dataIndex: "status",
                      key: "status",
                      align: "center",
                      render: (status: string) => {
                        const color = status === "done" ? "green" : "orange";
                        const label =
                          status === "done"
                            ? t("credits.status.done")
                            : t("credits.status.pending");
                        return (
                          <span style={{ color, fontWeight: 500 }}>{label}</span>
                        );
                      },
                    },
                  ]}
                  dataSource={paymentHistory?.map(
                    (item: any, index: number) => ({ ...item, index: index + 1 })
                  )}
                  pagination={false}
                  loading={false}
                  scroll={{ x: 600, y: 380 }}
                />
              </Panel>
            </Collapse>
          </Card>

          {/* Modal mua credits + QR */}
          <Modal
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                  Đóng
                </Button>
                <Button
                  key="ok"
                  type="primary"
                  onClick={handleConfirmTransfer}
                  loading={isLoading}
                >
                  Tôi đã chuyển tiền
                </Button>
              </div>
            }
            centered
            title={<div className="modal-title">Mua credits</div>}
            className="modal-dark"
          >
            <Form layout="vertical" form={form}>
              <Form.Item style={{ textAlign: "center" }}>
                <div
                  style={{
                    display: "inline-block",
                    textAlign: "left",
                    color: "#fff",
                  }}
                >
                  <Radio.Group
                    onChange={(e) => {
                      const pkg = creditPackages.find(
                        (p) => p.credits === e.target.value
                      )!;
                      setSelectedPackage(pkg);
                    }}
                    value={selectedPackage.credits}
                  >
                    {creditPackages.map((pkg) => (
                      <Radio
                        key={pkg.credits}
                        value={pkg.credits}
                        style={{
                          display: "block",
                          lineHeight: "28px",
                          color: "#fff",
                        }}
                      >
                        {pkg.credits.toLocaleString("vi-VN")} credits –{" "}
                        {pkg.price.toLocaleString("vi-VN")} VNĐ
                      </Radio>
                    ))}
                  </Radio.Group>
                </div>
              </Form.Item>

              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <Image
                  src={QR}
                  alt="QR thanh toán"
                  style={{ maxWidth: 240 }}
                  preview={false}
                />
              </div>

              <div style={{ textAlign: "center", fontSize: 14, color: "#fff" }}>
                <div>
                  <strong style={{
                    color: "#fff",
                  }}>Gói:</strong>{" "}
                  {selectedPackage.credits.toLocaleString()} credits
                </div>
                <div>
                  <strong style={{
                    color: "#fff",
                  }}>Số tiền:</strong>{" "}
                  {selectedPackage.price.toLocaleString("vi-VN")} VNĐ
                </div>
                <div>
                  <strong style={{
                    color: "#fff",
                  }}>Nội dung CK:</strong>{" "}
                  {user?.email || user?.username || "Tài khoản"}
                </div>
                <div style={{ marginTop: 8 }}>
                  Vui lòng quét mã QR để thanh toán. Sau khi chuyển thành công,
                  bấm <b>“Tôi đã chuyển tiền”</b> để xác nhận.
                </div>
              </div>
            </Form>
          </Modal>
        </div>
      </Layout>
      {/* Modal QR xác nhận thanh toán */}
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
            <Button
              key="ok"
              type="primary"
              onClick={handleConfirmTransferPlan}
              loading={buying}
            >
              Tôi đã chuyển tiền
            </Button>
          </div>
        }
      >
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ textAlign: "center" }}>
            {/* Đổi ảnh QR thật vào đây */}
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
    </PageTitleHOC>
  );
};

export default CreditsPage;
