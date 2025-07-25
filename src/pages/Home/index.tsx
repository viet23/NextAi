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




const LandingPage: React.FC = () => {
    const data = {
        img: Home_5,
        title: "Tại sao chọn All One Ads",
        content: [
            {
                heading: "AI dễ dùng – không cần kỹ thuật",
                description: "Ai cũng dùng được – không cần học quảng cáo",
                icon: Home_icon_5,
            },
            {
                heading: "Tạo nội dung siêu nhanh",
                description: "Không cần designer – AI lo tất cả",
                icon: Home_icon_3,
            },
            {
                heading: "Chạy quảng cáo thật",
                description: "Không chỉ tạo nội dung mà còn thực thi hiệu quả",
                icon: Home_icon_6,
            },
        ],
    };
    return (
        <div className="page">

            {/* Header */}
            <div className="container header">
                <div className="nav-center">
                    <img src={Logo} alt="logo" style={{ width: 202, height: 100 }} />
                    {/* <Link to="/signin">Home</Link>
                    <Link to="/signin">About</Link>
                    <Link to="/signin">Pages</Link>
                    <Link to="/signin">Contact</Link> */}
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
                    <p className="badge"> WE'VE ANNOUNCED AI+ 2.0. CHECK IT OUT</p>
                    <h1>Quảng cáo tự động </h1>
                    <h1> Hiệu quả tối đa</h1>
                    <h1>Tất cả trong một</h1>
                    <p>Nền tảng giúp bạn tạo hình ảnh, video, viết nội dung, chạy quảng cáo Facebook tự động bằng AI. Không cần kỹ năng thiết kế hay marketing.</p>

                    <Link to="/signin" className="btn-text" style={{ marginRight: "12px" }}>Bắt đầu</Link>
                    <Link to="/signin" className="btn-text-2">Khám phá</Link>
                </div>
                <div className="hero-right">
                    <img src={Container} alt="Hero" />
                </div>
            </div>
            <br />

            {/* Customer Segment */}
            <div className="customer-segment">
                <p className="customer-title">Đối tác hoặc khách hàng tiêu biểu</p>

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
            {[
                {
                    img: Home_1,
                    title: "Phân tích fanpage và quảng cáo",
                    content: [
                        {
                            heading: "Phân tích trang web",
                            description: "Dựa trên URL bạn cung cấp",
                            icon: Home_icon_1,
                        },
                        {
                            heading: "Phân tích hiệu quả quảng cáo",
                            description: "Theo ngành hàng, nội dung, CTA",
                            icon: Home_icon_2,
                        },
                    ],
                },
                {
                    img: Home_2,
                    title: "Quảng cáo tự động",
                    content: [
                        {
                            heading: "Sử dụng AI phân tích quảng cáo",
                            description: "Tối ưu hoá nội dung hiệu quả",
                            icon: Home_icon_3,
                        },
                        {
                            heading: "Tự động gửi thông báo",
                            description: "Thông báo thông minh dựa trên dữ liệu AI",
                            icon: Home_icon_4,
                        },
                    ],
                },
                {
                    img: Home_3,
                    title: "Tạo video AI theo kịch bản",
                    content: [
                        {
                            heading: "Ghép nhạc, cảnh quay",
                            description: "Tạo video hoàn chỉnh trong vài phút",
                            icon: Home_icon_1,
                        },
                        {
                            heading: "Tự động hoàn chỉnh video",
                            description: "Không cần kỹ thuật, chỉ cần nội dung",
                            icon: Home_icon_2,
                        },
                    ],
                },
                {
                    img: Home_4,
                    title: "AI đánh giá hiệu quả quảng cáo",
                    content: [
                        {
                            heading: "Sử dụng AI phân tích quảng cáo",
                            description: "Hiệu quả theo hành vi và phản hồi",
                            icon: Home_icon_3,
                        },
                        {
                            heading: "Tự động gửi thông báo",
                            description: "Đánh giá và nhắc nhở tối ưu thời gian thực",
                            icon: Home_icon_4,
                        },
                    ],
                },

            ].map((block, i) => (
                <div className="feature-block" key={i}>
                    <img className="feature-image" src={block.img} alt={block.title} />
                    <div className="feature-content">
                        <h3>{block.title}</h3>
                        <div className="feature-items">
                            {block.content.map((item: any, j) => (
                                <div className="feature-item" key={j}>
                                    <div className="icon-wrapper">
                                        <img src={item.icon} alt="icon" />
                                    </div>
                                    <div>
                                        <div className="item-heading">{item.heading}</div>
                                        <div className="item-description">{item.description}</div>
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
                    {data.title}
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
                    All One Ads là công cụ hỗ trợ quảng cáo thế hệ mới, ứng dụng trí tuệ nhân tạo để tạo ra hình ảnh, video, nội dung và chiến dịch quảng cáo một cách tự động – giúp tiết kiệm thời gian, chi phí và tăng hiệu quả vượt trội trên nền tảng Facebook.
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
                <div style={{ flex: 1, minWidth: 250, maxWidth: 300 }}>


                    {/* List of features */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
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

            {/* <div className="video-demo-wrapper">
              
                <div className="video-demo-image">
                    <img
                        src={Video}
                        alt="Video demo"
                    />
                </div>

              
                <div className="video-demo-content">
                    <h2>Video Demo</h2>
                    <p>Từ ý tưởng đến chiến dịch hoàn chỉnh – chỉ trong 5 phút</p>
                </div>
            </div> */}





            <div className="container tutorials-section">
                {/* <p className="container testimonial-label">PHẢN HỒI</p> */}
                <p className="badge">ALL ONE ADS</p>
                <h2 className="testimonial-heading">Đánh giá từ khách hàng</h2>
                {/* <p className="testimonial-subtext">
                    Khách hàng đánh giá rất cao trải nghiệm sử dụng nền tảng của chúng tôi. Từ giao diện dễ dùng, tính năng AI thông minh cho đến hiệu quả quảng cáo mang lại – tất cả đều vượt kỳ vọng.
                </p> */}

                <div className="testimonial-grid">
                    {[
                        {
                            name: "Anh Tiến ",
                            highlight: true,
                            username: "Chủ chuỗi lẩu Hotpot Kingdom",
                            avatar: "https://htmediagroup.vn/wp-content/uploads/2022/11/Anh-58-copy-min.jpg.webp",
                            text: "Tôi không rành công nghệ, nhưng nhờ All One Ads tôi có thể tự tạo video món ăn cực hấp dẫn chỉ với vài cú nhấp. Khách đến quán đông hơn hẳn sau mỗi video đăng!",
                        },
                        {
                            name: "Anh Linh",
                            username: "COO BestMall",
                            avatar: "https://htmediagroup.vn/wp-content/uploads/2024/12/Anh-profile-nam-8-min.jpg.webp",
                            text: "Chúng tôi tích hợp All One Ads vào hệ thống marketing của BestMall. Nhờ đó, đội ngũ tiết kiệm được hàng chục giờ mỗi tuần mà vẫn đảm bảo chất lượng hình ảnh và nội dung vượt chuẩn.",
                            highlight: true,
                        },
                        {
                            name: "Chị Huệ",
                            username: "Trung tâm tiếng Anh",
                            highlight: true,
                            avatar: "https://sohanews.sohacdn.com/thumb_w/480/2017/15780713-1193573474058728-4385323881681449622-n-1486883057646.jpg",
                            text: "Trước đây tôi phải thuê cả đội media làm video tuyển sinh. Giờ thì chỉ cần nhập nội dung, All One Ads lo hết. Video chuyên nghiệp, phụ đề đẹp, học viên inbox về liên tục!",
                        },
                        {
                            name: "Anh Giang",
                            username: "Admin Cộng đồng AI Agent Vietnam",
                            highlight: true,
                            avatar: "https://bizweb.dktcdn.net/100/175/849/files/chup-anh-phong-cach-cho-nam-gioi-trong-studio-nghe-thuat-o-ha-noi-18.jpg?v=1595935877803",
                            text: "All One Ads đúng nghĩa là AI hỗ trợ toàn diện. Chúng tôi dùng để tạo nội dung cho cộng đồng mỗi ngày – từ ảnh, video, caption cho đến chạy quảng cáo – tất cả tự động hóa!",
                        },
                        {
                            name: "Anh Việt",
                            username: "Admin Cộng đồng B.A và Những Người Bạn",
                            highlight: true,
                            avatar: "https://danviet.ex-cdn.com/files/f1/296231569849192448/2021/7/29/12-16275551684732026163150.jpg",
                            text: "Chúng tôi dùng All One Ads để quảng bá các sự kiện, khóa học. Chất lượng video AI tạo ra rất ổn, nội dung rõ ràng, tiết kiệm thời gian mà vẫn chuyên nghiệp.",
                        },
                        {
                            name: "Chị Ngọc",
                            username: "Product Design, All One Ads",
                            highlight: true,
                            avatar: "https://kenh14cdn.com/thumb_w/660/2017/6-1513528894695.png",
                            text: "Tôi đồng hành từ ngày đầu thiết kế trải nghiệm người dùng cho All One Ads. Giờ chính tôi cũng đang dùng nó mỗi ngày để tạo video mô phỏng và thiết kế nội dung cho khách hàng nhanh gấp 5 lần!”",
                        },
                    ].map((item, idx) => (
                        <div className={`testimonial-card ${item.highlight ? 'highlight' : ''}`} key={idx}>
                            <div className="testimonial-top">
                                <img className="avatar" src={item.avatar} />
                                <div className="user-info">
                                    <p className="name">{item.name}</p>
                                    <p className="username">{item.username}</p>
                                </div>
                                <img className="twitter-icon" src="https://cdn-icons-png.flaticon.com/512/733/733579.png" />
                            </div>
                            <p className="testimonial-text">"{item.text}"</p>
                        </div>
                    ))}
                </div>
                {/* <Link to="/signin" className="btn-text">Bắt đầu ngay</Link> */}
            </div>

            {/* 
            <div className="container tutorials-section">
                <h2 className="tutorials-title">Hướng dẫn sử dụng</h2>
                <div className="tutorials-grid">
                    {[
                        {
                            img: Simplify,
                            tag: "Company",
                            date: "Aug 8, 2023",
                            title: "Cách sử dụng video",
                            link: "#",
                        },
                        {
                            img: Expanding,
                            tag: "Product",
                            date: "Aug 8, 2023",
                            title: "Cách tạo hình ảnh",
                            link: "#",
                        },
                        {
                            img: What,
                            tag: "News",
                            date: "Aug 8, 2023",
                            title: "Cách chạy ads tự động",
                            link: "#",
                        },
                    ].map((item, idx) => (
                        <div className="tutorial-card" key={idx}>
                            <div className="tutorial-thumbnail">
                                <img src={item.img} alt={item.title} />
                            </div>
                            <div className="tutorial-info">
                                <p className="tutorial-meta">
                                    <span>{item.tag}</span> &nbsp;|&nbsp; {item.date}
                                </p>
                                <a href={item.link} className="tutorial-title-link">{item.title}</a>
                            </div>
                        </div>
                    ))}
                </div>
            </div> */}

            <footer className="footer">
                <div
                    className="container"
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "stretch", // Giúp 2 khối cao bằng nhau
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
                            minHeight: 280, // Ép chiều cao đều
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
                                AllOneAds.com là nền tảng quảng cáo tự động bằng AI giúp doanh nghiệp và cá nhân dễ dàng tạo ra các chiến dịch quảng cáo chuyên nghiệp trên nhiều nền tảng chỉ trong vài phút. Với công nghệ AI hiện đại, All One Ads hỗ trợ bạn tạo hình ảnh, video, viết nội dung và thiết lập quảng cáo Facebook một cách nhanh chóng mà không cần kỹ năng thiết kế hay chạy ads chuyên sâu. <br />
                                <br />
                                Chúng tôi cam kết mang đến giải pháp quảng cáo minh bạch, hiệu quả, tối ưu chi phí và thời gian cho mọi đối tượng khách hàng. Toàn bộ quy trình đều được tối ưu bởi AI, đảm bảo nội dung quảng cáo phù hợp và chất lượng, đồng thời tự động phân tích, đánh giá hiệu quả để tối ưu chiến dịch liên tục. <br />
                                <br />
                                Đến với All One Ads, bạn hoàn toàn yên tâm trải nghiệm nền tảng tạo quảng cáo tự động thông minh, tối ưu hiệu suất và giúp thương hiệu của bạn nổi bật, tiếp cận đúng khách hàng mục tiêu một cách dễ dàng nhất.
                            </p>

                            {/* <hr
                                style={{
                                    borderColor: "rgba(255,255,255,0.05)",
                                    margin: "24px 0",
                                }}
                            /> */}


                        </div>
                    </div>

                    {/* Bên phải: banner BestMall + form email */}
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
                            <h4
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontWeight: 500,
                                    fontSize: 24,
                                    lineHeight: "18px",
                                    letterSpacing: "0",
                                    verticalAlign: "middle",
                                    color: "#e2e8f0",
                                    marginBottom: 12,
                                }}
                            >
                                Về chúng tôi
                            </h4>

                            <ul
                                style={{
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
                                }}
                            >
                                <li style={{ display: "flex", alignItems: "center" }}>
                                    <img src={Frame} alt="Địa chỉ" style={{ width: 18, height: 18, marginRight: 8 }} />
                                    Số 1 ngõ 75 Hồ Tùng Mậu, Quận Cầu Giấy, Hà Nội
                                </li>
                                <li style={{ display: "flex", alignItems: "center" }}>
                                    <img src={Phone} alt="CSKH" style={{ width: 18, height: 18, marginRight: 8 }} />
                                    CSKH: 0989 471 727
                                </li>
                                <li style={{ display: "flex", alignItems: "center" }}>
                                    <img src={Phone} alt="Đối tác" style={{ width: 18, height: 18, marginRight: 8 }} />
                                    Đối tác: 0962 753 455
                                </li>
                                <li style={{ display: "flex", alignItems: "center" }}>
                                    <img src={Mail} alt="Email" style={{ width: 18, height: 18, marginRight: 8 }} />
                                    chamsockhachhang.alloneads@gmail.com
                                </li>
                            </ul>
                            <h4
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontWeight: 500,
                                    fontSize: 24,
                                    lineHeight: "18px",
                                    letterSpacing: "0",
                                    marginTop: 24,
                                    marginBottom: 12,
                                    color: "#e2e8f0",
                                    verticalAlign: "middle",
                                }}
                            >
                                Phương thức thanh toán
                            </h4>

                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "nowrap",
                                    gap: 24,
                                    overflowX: "auto",
                                    padding: "16px 0",
                                }}
                            >
                                <img src={Frame_696} style={{ width: 50, height: 39, flexShrink: 0 }} />
                                <img src={Frame_697} style={{ width: 50, height: 39, flexShrink: 0 }} />
                                <img src={image_51} style={{ width: 50, height: 39, flexShrink: 0 }} />
                                <img src={Frame_699} style={{ width: 50, height: 39, flexShrink: 0 }} />
                                <img src={image_54} style={{ width: 39, height: 39, flexShrink: 0 }} />
                            </div>
                            {/* <img
                                src={Home_47}
                                alt="Bestmall"
                                style={{
                                    maxWidth: "100%",
                                    borderRadius: 8,
                                    marginBottom: 20,
                                }}
                            />

                            <h4 style={{ fontSize: 16, color: "#e2e8f0", marginBottom: 12 }}>Liên hệ</h4>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    // xử lý email
                                }}
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    gap: 12,
                                    alignItems: "center",
                                    marginTop: "auto",
                                }}
                            >
                                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 20 }}>
                                    <input
                                        type="email"
                                        placeholder="Email của bạn"
                                        style={{
                                            width: 400, // 👈 Kích thước như ảnh
                                            height: 48,
                                            padding: "12px 16px",
                                            borderRadius: 8,
                                            border: "1px solid rgba(255,255,255,0.15)",
                                            backgroundColor: "#0f172a", // Màu nền theo ảnh
                                            color: "#e2e8f0",
                                            fontSize: 16,
                                            fontFamily: "Inter, sans-serif",
                                            outline: "none",
                                        }}
                                    />

                                    <button type="submit" className="btn-text">
                                        Gửi
                                    </button>
                                </div>

                            </form> */}
                        </div>
                    </div>
                </div>
            </footer>


        </div>
    );
};

export default LandingPage;
