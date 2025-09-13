import React from "react";
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
import Home_8 from "../../assets/images/image 49.png";
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
import Home_47 from "../../assets/images/image 47.png";
import Frame_696 from "../../assets/images/Frame 696.png";
import Frame_697 from "../../assets/images/Frame 697.png";
import image_51 from "../../assets/images/image 51.png";
import Frame_699 from "../../assets/images/Frame 699.png";
import image_54 from "../../assets/images/image 54.png";
import Logo from "../../assets/images/next-logo.jpg";
import Video from "../../assets/images/image 40.png";
import Simplify from "../../assets/images/Simplify.png";
import What from "../../assets/images/What.png";
import Expanding from "../../assets/images/Expanding.png";
import Frame from "../../assets/images/Frame.png";
import Mail from "../../assets/images/mail.png";
import Phone from "../../assets/images/phone.png";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { useTranslation } from "react-i18next";



const HomePage: React.FC = () => {
    const { t } = useTranslation();
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
        ]
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

    const plans = [
        {
            name: "FREE",
            price: "0đ",
            sub: "/ 7 Days",
            features: [
                "Số lượng chiến dịch: tối đa 2 chiến dịch.",
                "Ngân sách mỗi chiến dịch: tối đa 5 triệu/tháng.",
                "Không mở tính năng tối ưu nâng cao (AI chỉ gợi ý cơ bản).",
            ],
        },
        {
            name: "STARTER",
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
            name: "PRO",
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
            name: "ENTERPRISE",
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

    return (
        <PageTitleHOC title="Chi tiết tài khoản Credits">
            <Layout className="image-layout">
                <Content style={{ padding: 24 }}>
                    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                        <br />
                        {/* Hero */}
                        <div className="container hero">
                            <div className="hero-left">
                                <h1>{t("hero.title1")}</h1>
                                <p className="badge">{t("hero.subtitle")}</p>
                                <p>{t("hero.description")}</p>
                                <p>{t("hero.description2")}</p>
                                <p>{t("hero.description3")}</p>


                                {/* <Link to="/signin" className="btn-text" style={{ marginRight: "12px" }}>Bắt đầu</Link>
                    <Link to="/signin" className="btn-text-2">Khám phá</Link> */}
                            </div>
                            <div className="hero-right">
                                <img src={Container} alt="Hero" />
                            </div>
                        </div>
                        <br />

                        <div style={{ padding: "56px 0", color: "#E8ECFF" }}>
                            <div style={{ width: "min(1140px,92%)", margin: "0 auto" }}>
                                {/* ===== Title 1 ===== */}
                                <h2 className="section-title no-before" style={{
                                    textAlign: "center"
                                }}>
                                    Có thể đây là những <span style={{ color: "#f86808ff" }}>vấn đề</span> bạn gặp khi<br />chạy quảng cáo Facebook
                                </h2>

                                {/* ===== Row of 5 mini cards ===== */}
                                <div style={{
                                    display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 36
                                }}>
                                    {[
                                        { icon: "🎯", t: "Target sai tệp", d: "Chi nhiều mà đơn ít" },
                                        { icon: "⏱️", t: "Tốn thời gian", d: "Mất nhiều thời gian để set-up và A/B test từng nhóm quảng cáo" },
                                        { icon: "💸", t: "Chi phí cao", d: "CPC cao, ROAS thấp nhưng không biết chỉnh ở đâu" },
                                        { icon: "🧾", t: "Lãng phí", d: "Ngân sách bị lãng phí vì setup thủ công, dễ sai sót" },
                                        { icon: "👥", t: "Thiếu nhân sự", d: "Nhân sự nghỉ hoặc yếu tay là chiến dịch dừng hẳn" },
                                    ].map((it, i) => (
                                        <div key={i} style={{
                                            width: 210, background: "#121327", border: "1px solid rgba(255,255,255,.08)",
                                            borderRadius: 12, padding: "12px 14px", boxShadow: "0 8px 24px rgba(0,0,0,.35)"
                                        }}>
                                            <div style={{ fontWeight: 700, marginBottom: 6, display: "flex", gap: 8, alignItems: "center" }}>
                                                <span>{it.icon}</span><span>{it.t}</span>
                                            </div>
                                            <div style={{ fontSize: 13, color: "#A7AECD" }}>{it.d}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* ===== Spacer ===== */}
                                <div style={{ height: 28 }} />

                                {/* ===== Title 2 ===== */}
                                <h3 className="section-title no-before" style={{
                                    textAlign: "center"
                                }}>
                                    Những hệ lụy <span style={{ color: "#f86808ff" }}>đau đớn</span> phải gánh chịu<br />khi chạy Ads Facebook thủ công
                                </h3>

                                {/* ===== Grid: left checklist + right image ===== */}
                                <div style={{ display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 22, alignItems: "stretch" }}>
                                    {/* Left panel */}
                                    <div style={{
                                        background: "#121327", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "14px 16px",
                                        boxShadow: "0 8px 28px rgba(0,0,0,.35)"
                                    }}>
                                        {[
                                            ["Tốn thời gian vô ích", "Một sai sót nhỏ trong setup chiến dịch có thể khiến bạn lãng phí ngân sách."],
                                            ["Rủi ro tài khoản bị khóa", "Tài khoản bị khóa đột ngột gây gián đoạn chiến dịch, mất doanh thu."],
                                            ["Sai tệp khách hàng, lãng phí ngân sách", "Target sai khiến chi phí mỗi đơn (CPA) cao và hiệu quả thấp."],
                                            ["Khó theo dõi và tối ưu hiệu quả", "CPC tăng, ROAS giảm nhưng không biết tối ưu ở đâu."],
                                            ["Phụ thuộc vào nhân sự vận hành Ads", "Khi nhân sự nghỉ hoặc không đủ kinh nghiệm, chiến dịch dễ 'tắt thở'."]
                                        ].map((row, idx) => (
                                            <div key={idx} style={{ display: "grid", gridTemplateColumns: "18px 1fr", gap: 10, marginBottom: 12 }}>
                                                <div style={{ color: "#FF6B6B", fontWeight: 800 }}>✖</div>
                                                <div>
                                                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{row[0]}</div>
                                                    <div style={{ color: "#A7AECD", fontSize: 13 }}>{row[1]}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Right image */}
                                    <div style={{
                                        background: "#0F1023", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14,
                                        display: "grid", placeItems: "center", overflow: "hidden", boxShadow: "0 8px 28px rgba(0,0,0,.35)"
                                    }}>
                                        <img
                                            src={Home_8} // đổi path ảnh của bạn
                                            alt="Tech"
                                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="customer-segment">

                            <h2 className="section-title no-before">{t('section.title')}</h2>
                        </div>

                        {[Home_1, Home_2, Home_3, Home_4, Home_6, Home_7].map((img, i) => (
                            <div className="feature-block" key={i}>
                                <img className="feature-image" src={img} alt={t(`features.${i}.title`)} />
                                <div className="feature-content">
                                    <h3>{t(`features.${i}.title`)}</h3>
                                    <div className="feature-items">
                                        {[0, 1].map(j => (
                                            <div className="feature-item" key={j}>
                                                <div className="icon-wrapper">
                                                    <img src={[Home_icon_1, Home_icon_2, Home_icon_3, Home_icon_4][(i * 2 + j) % 4]} alt="icon" />
                                                </div>
                                                <div>
                                                    <div className="item-heading">{t(`features.${i}.content.${j}.heading`)}</div>
                                                    <div className="item-description">{t(`features.${i}.content.${j}.description`)}</div>
                                                </div>
                                            </div>
                                        ))}
                                        <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 20 }}>
                                            <Link
                                                to={t(`features.${i}.url`)}
                                                className="btn-text"
                                            >
                                                {t(`features.${i}.title`)}
                                            </Link>
                                        </div>

                                    </div>

                                </div>
                            </div>
                        ))}


                        {/* Tiêu đề căn giữa phía trên */}
                        <div style={{ textAlign: "center", marginBottom: 60 }}>
                            <h2
                                className="section-title no-before"
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


                        <div
                            className="feature-block"
                        >

                            {/* Left image */}
                            <div style={{ flex: 1, minWidth: 250, maxWidth: 500 }}>
                                <img
                                    src={data.img}
                                    alt="All One Ads"
                                    style={{ width: "100%", borderRadius: 12 }}
                                />
                            </div>

                            {/* Right content */}
                            <div style={{ flex: 1, minWidth: 250, maxWidth: 500 }}>


                                {/* List of features */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    {data.content.map((item, index) => (
                                        <div
                                            key={index}
                                            style={{ display: "flex", alignItems: "flex-start", gap: 16 }}
                                        >
                                            <img
                                                src={item.icon}
                                                alt="icon"
                                                style={{ width: 40, height: 40, flexShrink: 0 }}
                                            />
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
                        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                            <div className="container tutorials-section">

                                <h2 className="section-title no-before">Đánh giá từ khách hàng</h2>
                                <p className="badge">   Lắng nghe những trải nghiệm chân thực từ khách hàng của chúng tôi. Sự hài lòng của khách hàng là thành công của chúng tôi</p>



                                <div
                                    className="testimonial-grid"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                        gap: '20px',
                                    }}
                                >
                                    {testimonials.map((item, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.02)',
                                                border: item.highlight ? '1px solid #00bfff' : '1px solid rgba(255, 255, 255, 0.06)',
                                                borderRadius: '12px',
                                                padding: '20px',
                                                textAlign: 'left',
                                                maxWidth: '100%',
                                                transition: '0.3s ease',
                                                boxShadow: item.highlight ? '0 0 12px rgba(0, 191, 255, 0.4)' : 'none',
                                                color: 'white',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                                                <img
                                                    src={avatars[idx]}
                                                    alt="avatar"
                                                    style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 12 }}
                                                />
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 'bold', color: 'white' }}>{item.name}</p>
                                                    <p style={{ margin: 0, opacity: 0.7, color: 'white' }}>{item.username}</p>
                                                </div>
                                                <img
                                                    src="https://cdn-icons-png.flaticon.com/512/733/733579.png"
                                                    alt="Twitter Icon"
                                                    style={{ width: 20, height: 20, marginLeft: 'auto' }}
                                                />
                                            </div>
                                            <p style={{ margin: 0, fontStyle: 'italic', color: 'white' }}>
                                                "{item.text}"
                                            </p>

                                        </div>
                                    ))}

                                </div>


                            </div>
                        </div>

                        <div className="customer-segment">

                            <h2 className="section-title no-before"> Ưu đãi credits tốt nhất hôm nay</h2>
                        </div>

                        <div className="customer-segment" style={{ textAlign: "center", color: "#fff" }} >

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
                                            background:
                                                "linear-gradient(145deg, rgba(0,102,255,0.1), rgba(0,0,0,0.6))",
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
                                            <div
                                                style={{ fontSize: 24, textAlign: "center", fontWeight: "bold" }}
                                            >
                                                {plan.price} {plan.sub}
                                            </div>
                                            {plan.note && (
                                                <div style={{ fontSize: 12, color: "#bbb", marginBottom: 12 }}>
                                                    {plan.note}
                                                </div>
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
                                                        <span
                                                            style={{
                                                                position: "absolute",
                                                                left: 0,
                                                                color: "#3b82f6",
                                                            }}
                                                        >
                                                            ✔
                                                        </span>
                                                        {f}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <button
                                            className="btn-text"
                                            style={{
                                                marginTop: "auto", // 👈 đảm bảo nút nằm cuối

                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.background = "#3b82f6";
                                                e.currentTarget.style.color = "#fff";
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.background = "transparent";
                                                e.currentTarget.style.color = "#3b82f6";
                                            }}
                                        >
                                            Select plan
                                        </button>
                                    </div>

                                ))}
                            </div>
                        </div>

                        {/* Customer Segment */}
                        <div className="customer-segment">
                            <h2 className="section-title no-before">{t('partners.title')}</h2>

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
                        </div>

                        <footer className="footer">
                            <div
                                className="container"
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    alignItems: "stretch",
                                    gap: 40,
                                }}
                            >
                                {/* Bên trái: logo, mô tả */}
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
                                        <div className="footer-brand" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                                            <img src={Logo} alt="logo" style={{ width: 202, height: 100 }} />
                                        </div>

                                        <p className="footer-description" style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>
                                            {t("footer.description")}
                                        </p>
                                    </div>
                                </div>

                                {/* Bên phải: thông tin liên hệ và thanh toán */}
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
                                    <div>
                                        <br /><br /><br /><br />
                                        <h4 style={{
                                            fontFamily: "Inter, sans-serif",
                                            fontWeight: 500,
                                            fontSize: 24,
                                            lineHeight: "18px",
                                            color: "#e2e8f0",
                                            marginBottom: 12,
                                        }}>
                                            {t("footer.about")}
                                        </h4>

                                        <ul style={{
                                            listStyle: "none",
                                            padding: 0,
                                            margin: 0,
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 10,
                                            width: 673,
                                            color: "#94a3b8",
                                            fontSize: 14,
                                            lineHeight: 1.8,
                                        }}>
                                            <li style={{ display: "flex", alignItems: "center" }}>
                                                <img src={Frame} alt="address" style={{ width: 18, height: 18, marginRight: 8 }} />
                                                {t("footer.address")}
                                            </li>
                                            <li style={{ display: "flex", alignItems: "center" }}>
                                                <img src={Phone} alt="support" style={{ width: 18, height: 18, marginRight: 8 }} />
                                                {t("footer.support")}
                                            </li>
                                            {/* <li style={{ display: "flex", alignItems: "center" }}>
                                                <img src={Phone} alt="partner" style={{ width: 18, height: 18, marginRight: 8 }} />
                                                {t("footer.partner")}
                                            </li> */}
                                            <li style={{ display: "flex", alignItems: "center" }}>
                                                <img src={Mail} alt="email" style={{ width: 18, height: 18, marginRight: 8 }} />
                                                {t("footer.email")}
                                            </li>

                                        </ul>
                                        <h5 style={{
                                            fontFamily: "Inter, sans-serif",
                                            fontWeight: 500,
                                            fontSize: 18,
                                            marginTop: 24,
                                            marginBottom: 12,
                                            color: "#e2e8f0",
                                        }}>
                                            <a
                                                href="/policy-page"
                                                style={{ color: "inherit", textDecoration: "none" }}
                                            >
                                                {t("footer.contact")}
                                            </a>
                                        </h5>


                                        {/* <h4 style={{
                                            fontFamily: "Inter, sans-serif",
                                            fontWeight: 500,
                                            fontSize: 24,
                                            marginTop: 24,
                                            marginBottom: 12,
                                            color: "#e2e8f0",
                                        }}>
                                            {t("footer.payment")}
                                        </h4>

                                        <div style={{
                                            display: "flex",
                                            flexWrap: "nowrap",
                                            gap: 24,
                                            overflowX: "auto",
                                            padding: "16px 0",
                                        }}>
                                            <img src={Frame_696} style={{ width: 50, height: 39 }} />
                                            <img src={Frame_697} style={{ width: 50, height: 39 }} />
                                            <img src={image_51} style={{ width: 50, height: 39 }} />
                                            <img src={Frame_699} style={{ width: 50, height: 39 }} />
                                            <img src={image_54} style={{ width: 39, height: 39 }} />
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        </footer>



                    </div>
                </Content>
            </Layout>

        </PageTitleHOC>
    );
};

export default HomePage;
