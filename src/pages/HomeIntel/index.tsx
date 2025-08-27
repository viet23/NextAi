import React from "react";
import "./styles.scss";
import { Link } from "react-router-dom";
import Container from "../../assets/images/Container.png";
import Home_1 from "../../assets/images/home_1.png";
import Home_2 from "../../assets/images/home_2.png";
import Home_3 from "../../assets/images/home_3.png";
import Home_4 from "../../assets/images/home_4.png";
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


    return (
        <PageTitleHOC title="Chi tiết tài khoản Credits">
            <Layout className="image-layout">
                <Content style={{ padding: 24 }}>
                    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                        <br />
                        {/* Hero */}
                        <div className="container hero">
                            <div className="hero-left">
                                <p className="badge"> {t("hero.subtitle")}</p>
                                <h1>{t("hero.title1")}</h1>
                                <h1>{t("hero.title2")}</h1>
                                <h1>{t("hero.title3")}</h1>
                                <p>{t("hero.description")}</p>


                                {/* <Link to="/signin" className="btn-text" style={{ marginRight: "12px" }}>Bắt đầu</Link>
                    <Link to="/signin" className="btn-text-2">Khám phá</Link> */}
                            </div>
                            <div className="hero-right">
                                <img src={Container} alt="Hero" />
                            </div>
                        </div>
                        <br />

                        {/* Customer Segment */}
                        <div className="customer-segment">
                            <p className="customer-title">{t('partners.title')}</p>

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

                            <p
                                style={{
                                    display: 'inline-block',
                                    padding: '8px 22px',
                                    borderRadius: '999px',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: '#ffffff',
                                    fontSize: '12px',
                                    letterSpacing: '1px',
                                    fontWeight: 400,
                                    textTransform: 'uppercase',
                                    fontFamily: "'Inter', sans-serif",
                                    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                                    marginBottom: '24px',
                                }}
                            >
                                ALL ONE ADS
                            </p>


                            <h2 className="section-title">{t('section.title')}</h2>
                        </div>



                        {[Home_1, Home_2, Home_3, Home_4].map((img, i) => (
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

                                <p
                                    style={{
                                        display: 'inline-block',
                                        padding: '8px 22px',
                                        borderRadius: '999px',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: '#ffffff',
                                        fontSize: '12px',
                                        letterSpacing: '1px',
                                        fontWeight: 400,
                                        textTransform: 'uppercase',
                                        fontFamily: "'Inter', sans-serif",
                                        boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                                        marginBottom: '24px',
                                    }}
                                >
                                    ALL ONE ADS
                                </p>

                                <h2 className="testimonial-heading"> {t("testimonial.title")}</h2>

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
                                            <li style={{ display: "flex", alignItems: "center" }}>
                                                <img src={Phone} alt="partner" style={{ width: 18, height: 18, marginRight: 8 }} />
                                                {t("footer.partner")}
                                            </li>
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


                                        <h4 style={{
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
                                        </div>
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
