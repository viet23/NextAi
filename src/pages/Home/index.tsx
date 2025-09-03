import React, { useRef, useState } from "react";
import "./styles.scss";
import { Link } from "react-router-dom";
import Container from "../../assets/images/Container.png";
import Home_1 from "../../assets/images/home_1.png";
import Home_2 from "../../assets/images/home_2.png";
import Home_3 from "../../assets/images/home_3.png";
import Home_4 from "../../assets/images/home_4.png";
import Home_6 from "../../assets/images/home_6.png";
import Home_7 from "../../assets/images/home_7.png";
import Home_5 from "../../assets/images/home_5.png";
import Home_icon_1 from "../../assets/images/home_icon_1.png";
import Home_icon_2 from "../../assets/images/home_icon_2.png";
import Home_icon_3 from "../../assets/images/home_icon_3.png";
import Home_icon_4 from "../../assets/images/home_icon_4.png";
import Home_icon_5 from "../../assets/images/home_icon_5.png";
import Home_icon_6 from "../../assets/images/home_icon_6.png";
import Logo_2 from "../../assets/images/logo/2.png";
import Logo_3 from "../../assets/images/logo/3.png";
import Logo_4 from "../../assets/images/logo/4.png";
import Logo_5 from "../../assets/images/logo/5.png";
import Logo_6 from "../../assets/images/logo/6.png";
import Logo_7 from "../../assets/images/logo/7.png";
import Logo from "../../assets/images/next-logo.jpg";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useRegisterRrialMutation } from "src/store/api/authApi";



const LandingPage: React.FC = () => {
    const { t } = useTranslation();
    const [registerRrial] = useRegisterRrialMutation();

    // ===== Scroll to footer =====
    const footerRef = useRef<HTMLDivElement | null>(null);
    const scrollToFooter = (e?: React.MouseEvent) => {
        e?.preventDefault();
        footerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const data = {
        img: Home_5,
        content: [
            {
                heading: t("whyChoose.features.0.heading"),
                description: t("whyChoose.features.0.description"),
                icon: Home_icon_5,
            },
            {
                heading: t("whyChoose.features.1.heading"),
                description: t("whyChoose.features.1.description"),
                icon: Home_icon_3,
            },
            {
                heading: t("whyChoose.features.2.heading"),
                description: t("whyChoose.features.2.description"),
                icon: Home_icon_6,
            },
        ],
    };

    const testimonials = t("testimonial.list", { returnObjects: true }) as {
        name: string;
        username: string;
        text: string;
        highlight?: boolean;
    }[];

    const avatars = [
        "https://htmediagroup.vn/wp-content/uploads/2022/11/Anh-58-copy-min.jpg.webp",
        "https://htmediagroup.vn/wp-content/uploads/2024/12/Anh-profile-nam-8-min.jpg.webp",
        "https://sohanews.sohacdn.com/thumb_w/480/2017/15780713-1193573474058728-4385323881681449622-n-1486883057646.jpg",
        "https://bizweb.dktcdn.net/100/175/849/files/chup-anh-phong-cach-cho-nam-gioi-trong-studio-nghe-thuat-o-ha-noi-18.jpg?v=1595935877803",
        "https://danviet.ex-cdn.com/files/f1/296231569849192448/2021/7/29/12-16275551684732026163150.jpg",
        "https://kenh14cdn.com/thumb_w/660/2017/6-1513528894695.png"
    ];


    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange =
        (key: "fullName" | "email" | "phone") =>
            (e: React.ChangeEvent<HTMLInputElement>) =>
                setForm((s) => ({ ...s, [key]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.fullName || !form.email) {
            alert("Vui lòng nhập Họ tên và Email");
            return;
        }
        try {
            setSubmitting(true);

            await registerRrial({
                fullName: form.fullName,
                email: form.email,
                phone: form.phone || undefined,
                source: "landing_footer_7day_trial",
            }).unwrap();

            // ✅ Thành công: điều hướng sang /signin
            navigate("/signin");
        } catch (err: any) {
            // Báo lỗi tối giản
            alert(
                err?.response?.data?.message ||
                "Đăng ký không thành công. Vui lòng thử lại."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page">
            {/* Header */}
            <div className="container header">
                <div className="nav-center">
                    <img src={Logo} alt="logo" style={{ width: 202, height: 100 }} />
                </div>
                <div className="nav-right">
                    <Link to="/signin" className="btn-text">Đăng nhập</Link>
                    <Link to="/signin" className="btn-text-2">Đăng ký</Link>
                </div>
            </div>

            <br />

            {/* Hero */}
            <div className="container hero">
                <div className="hero-left">

                    <h1>{t("hero.title1")}</h1>
                    <p className="badge">{t("hero.subtitle")}</p>
                    <p>{t("hero.description")}</p>
                    <p>{t("hero.description2")}</p>
                    <p>{t("hero.description3")}</p>

                    {/* Nút cuộn xuống footer */}
                    <Link to="#" className="btn-text" onClick={scrollToFooter} style={{ marginRight: "12px" }}>
                        Bắt đầu
                    </Link>
                    <Link to="#" className="btn-text-2" onClick={scrollToFooter}>
                        Khám phá
                    </Link>
                </div>
                <div className="hero-right">
                    <img src={Container} alt="Hero" />
                </div>
            </div>

            <br />

            {/* Customer Segment */}
            <div className="customer-segment">
                <p className="customer-title">{t("partners.title")}</p>

                <div className="logo-grid">
                    {[Logo_2, Logo_3, Logo_4, Logo_5, Logo_6, Logo_7].map((logo, index) => (
                        <img
                            key={`logo-${index}`}
                            src={logo}
                            alt={`customer-logo-${index}`}
                            className="logo-item"
                        />
                    ))}
                </div>

                <p className="badge">ALL ONE ADS</p>

                <h2 className="section-title">Mở khoá tính năng phân tích fanpage</h2>
            </div>

            {/* Các khối nội dung */}
            {[Home_1, Home_2, Home_3, Home_4, Home_6, Home_7].map((img, i) => (
                <div className="feature-block" key={i}>
                    <img className="feature-image" src={img} alt={t(`features.${i}.title`)} />
                    <div className="feature-content">
                        <h3>{t(`features.${i}.title`)}</h3>
                        <div className="feature-items">
                            {[0, 1].map((j) => (
                                <div className="feature-item" key={j}>
                                    <div className="icon-wrapper">
                                        <img
                                            src={[Home_icon_1, Home_icon_2, Home_icon_3, Home_icon_4][(i * 2 + j) % 4]}
                                            alt="icon"
                                        />
                                    </div>
                                    <div>
                                        <div className="item-heading">{t(`features.${i}.content.${j}.heading`)}</div>
                                        <div className="item-description">
                                            {t(`features.${i}.content.${j}.description`)}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Nút cuộn xuống footer */}
                            <div style={{ textAlign: "center" }}>
                                <Link to="#" className="btn-text" onClick={scrollToFooter}>
                                    Dùng thử miễn phí
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Tiêu đề căn giữa phía trên */}
            <div style={{ textAlign: "center", marginBottom: 60 }}>
                <h2
                    style={{
                        fontSize: 32,
                        fontWeight: 700,
                        fontFamily: "Inter, sans-serif",
                        marginBottom: 16,
                        color: "#fff",
                    }}
                >
                    {t("whyChoose.title")}
                </h2>
                <p
                    style={{
                        color: "#cbd5e1",
                        fontSize: 14,
                        lineHeight: 1.6,
                        maxWidth: 800,
                        margin: "0 auto",
                    }}
                >
                    {t("whyChoose.description")}
                </p>
            </div>

            <div className="feature-block">
                {/* Left image */}
                <div style={{ flex: 1, minWidth: 250, maxWidth: 500 }}>
                    <img src={data.img} alt="All One Ads" style={{ width: "100%", borderRadius: 12 }} />
                </div>

                {/* Right content */}
                <div style={{ flex: 1, minWidth: 250, maxWidth: 300 }}>
                    {/* List of features */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                        {data.content.map((item, index) => (
                            <div key={index} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                                <img src={item.icon} alt="icon" style={{ width: 40, height: 40, flexShrink: 0 }} />
                                <div>
                                    <h4
                                        style={{
                                            fontSize: 18,
                                            fontWeight: 600,
                                            color: "#fff",
                                            marginBottom: 4,
                                        }}
                                    >
                                        {index + 1}. {item.heading}
                                    </h4>
                                    <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.6 }}>
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container tutorials-section">
                <h2 className="testimonial-heading">Đánh giá từ khách hàng</h2>
                <p className="badge">   Lắng nghe những trải nghiệm chân thực từ khách hàng của chúng tôi. Sự hài lòng của khách hàng là thành công của chúng tôi</p>


                <div className="testimonial-grid">
                    {testimonials.map((item, idx) => (
                        <div className={`testimonial-card ${item.highlight ? "highlight" : ""}`} key={idx}>
                            <div className="testimonial-top">
                                <img className="avatar" src={avatars[idx]} />
                                <div className="user-info">
                                    <p className="name">{item.name}</p>
                                    <p className="username">{item.username}</p>
                                </div>
                                <img
                                    className="twitter-icon"
                                    src="https://cdn-icons-png.flaticon.com/512/733/733579.png"
                                />
                            </div>
                            <p className="testimonial-text">"{item.text}"</p>
                        </div>
                    ))}
                </div>
            </div>

            <footer className="footer" ref={footerRef}>
                <div
                    className="container"
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "stretch",
                        gap: 40,
                    }}
                >
                    {/* Bên trái: logo, mô tả, liên hệ, thanh toán */}
                    <div
                        className="footer-left"
                        style={{
                            flex: 1,
                            minWidth: 320,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            minHeight: 280,
                        }}
                    >
                        <div>
                            <div
                                className="footer-brand"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    marginBottom: 12,
                                }}
                            >
                                <img src={Logo} alt="logo" style={{ width: 202, height: 100 }} />
                            </div>

                            <p
                                className="footer-description"
                                style={{
                                    color: "#94a3b8",
                                    fontSize: 14,
                                    marginBottom: 24,
                                }}
                            >
                                AllOneAds.com là nền tảng quảng cáo tự động bằng AI giúp doanh nghiệp và cá nhân
                                dễ dàng tạo ra các chiến dịch quảng cáo chuyên nghiệp trên nhiều nền tảng chỉ trong
                                vài phút. Với công nghệ AI hiện đại, All One Ads hỗ trợ bạn tạo hình ảnh, video,
                                viết nội dung và thiết lập quảng cáo Facebook một cách nhanh chóng mà không cần kỹ
                                năng thiết kế hay chạy ads chuyên sâu. <br />
                                <br />
                                Chúng tôi cam kết mang đến giải pháp quảng cáo minh bạch, hiệu quả, tối ưu chi phí
                                và thời gian cho mọi đối tượng khách hàng. Toàn bộ quy trình đều được tối ưu bởi
                                AI, đảm bảo nội dung quảng cáo phù hợp và chất lượng, đồng thời tự động phân tích,
                                đánh giá hiệu quả để tối ưu chiến dịch liên tục. <br />
                                <br />
                                Đến với All One Ads, bạn hoàn toàn yên tâm trải nghiệm nền tảng tạo quảng cáo tự
                                động thông minh, tối ưu hiệu suất và giúp thương hiệu của bạn nổi bật, tiếp cận đúng
                                khách hàng mục tiêu một cách dễ dàng nhất.
                            </p>
                        </div>
                    </div>

                    {/* Bên phải: form đăng ký */}
                    <div
                        className="footer-right"
                        style={{
                            flex: 1,
                            minWidth: 320,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            minHeight: 280,
                        }}
                    >
                        <div
                            style={{
                                background: "linear-gradient(180deg, #0a0c1b, #0d1028)",
                                borderRadius: 12,
                                padding: "24px 20px",
                                textAlign: "center",
                                color: "#fff",
                            }}
                        >
                            <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: 600 }}>
                                ĐĂNG KÝ DÙNG THỬ <br /> MIỄN PHÍ 7 NGÀY
                            </h3>

                            <form
                                onSubmit={handleSubmit}
                                style={{ display: "flex", flexDirection: "column", gap: 12 }}
                            >
                                <input
                                    type="text"
                                    placeholder="Họ và tên*"
                                    value={form.fullName}
                                    onChange={handleChange("fullName")}
                                    style={{
                                        padding: "10px 12px",
                                        borderRadius: 8,
                                        border: "1px solid #333",
                                        background: "#111426",
                                        color: "#fff",
                                    }}
                                />
                                <input
                                    type="email"
                                    placeholder="Email đăng nhập*"
                                    value={form.email}
                                    onChange={handleChange("email")}
                                    style={{
                                        padding: "10px 12px",
                                        borderRadius: 8,
                                        border: "1px solid #333",
                                        background: "#111426",
                                        color: "#fff",
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Số điện thoại"
                                    value={form.phone}
                                    onChange={handleChange("phone")}
                                    style={{
                                        padding: "10px 12px",
                                        borderRadius: 8,
                                        border: "1px solid #333",
                                        background: "#111426",
                                        color: "#fff",
                                    }}
                                />

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{
                                        marginTop: 8,
                                        padding: "12px 16px",
                                        borderRadius: 8,
                                        border: "none",
                                        background: "#00ff88",
                                        color: "#000",
                                        fontWeight: 600,
                                        cursor: submitting ? "not-allowed" : "pointer",
                                        opacity: submitting ? 0.7 : 1,
                                    }}
                                >
                                    {submitting ? "ĐANG XỬ LÝ..." : "HOÀN TẤT ĐĂNG KÝ"}
                                </button>
                            </form>


                            <p style={{ marginTop: 12, fontSize: 12, color: "#bbb" }}>
                                Không cần thẻ thanh toán – Kích hoạt trong 1 phút
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
