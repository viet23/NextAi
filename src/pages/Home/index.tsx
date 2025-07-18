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



const LandingPage: React.FC = () => {
    return (
        <div className="page">

            {/* Header */}
            <div className="container header">
                <div className="nav-center">
                    <Link to="/signin">Home</Link>
                    <Link to="/signin">About</Link>
                    <Link to="/signin">Pages</Link>
                    <Link to="/signin">Contact</Link>
                </div>
                <div className="nav-right">
                    <Link to="/signin" className="btn-text">Sign in</Link>
                    <Link to="/signin" className="btn-primary">Get started</Link>
                </div>
            </div>

            <br />
            {/* Hero */}
            <div className="container hero">
                <div className="hero-left">
                    <p className="badge">NEW AI PLATFORM FOR CREATORS</p>
                    <h1>Tạo quảng cáo tự động bằng AI, chỉ trong vài phút</h1>
                    <p>Nền tảng giúp bạn tạo hình ảnh, video, viết nội dung, chạy quảng cáo Facebook tự động bằng AI. Không cần kỹ năng thiết kế hay marketing.</p>

                    <Link to="/signin" className="btn-primary" style={{ marginRight: "12px" }}>Bắt đầu</Link>
                    <Link to="/signin" className="btn-text">Khám phá</Link>
                </div>
                <div className="hero-right">
                    <img src={Container} alt="Hero" />
                </div>
            </div>

            {/* Customer Segment */}
            <div className="container segments">
                <p>Đối tượng khách hàng phù hợp bao gồm</p>
                <div className="segment-options">
                    <span>agency</span>
                    <span>application</span>
                    <span>business</span>
                    <span>enterprise</span>
                    <span>startup</span>
                    <span>institute</span>
                    <span>organization</span>
                </div>
            </div>

            {/* Section title */}
            <div className="section-title">Mở khoá tính năng phân tích fanpage</div>

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
                {
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
                            icon: Home_icon_6
                        },
                    ],
                },
                {
                    img: "https://fmit.vn/public/uploads/images/artificia-Intelligence.jpg",
                    title: "Video Demo",
                    content: [
                        {
                            heading: "Xem thử video AI tạo thật",
                            description: "Ghép cảnh – lồng nhạc – xuất bản nhanh chóng",
                            icon: Home_icon_1,
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


            <div className="container tutorials-section">
                <p className="container testimonial-label">TESTIMONIALS</p>
                <h2 className="testimonial-heading">Đánh giá từ khách hàng</h2>
                <p className="testimonial-subtext">
                    Lorem ipsum dolor sit amet consectetur fringilla nulla cursus enim at. Ipsum adipiscing arcu sed at sed habitant tincidunt pellentesque venenatis arcu amet iaculis id nisl cursus id urna a sed dolor enim at.
                </p>

                <div className="testimonial-grid">
                    {[
                        {
                            name: "John Carter",
                            username: "@johncarter",
                            avatar: "https://randomuser.me/api/portraits/men/1.jpg",
                            text: "Lorem ipsum dolor sit amet consectetur. Nulla nulla tincidunt metus sit est. Ut nunc diam at lobortis sed blandit erat odio ultrices volutpat.",
                        },
                        {
                            name: "Chị Hoa – Chủ shop mỹ phẩm",
                            username: "@sophiemoore",
                            avatar: "https://randomuser.me/api/portraits/women/2.jpg",
                            text: "Tôi không biết gì về quảng cáo, nhưng AI của All One Ads đã giúp tôi có video và ảnh cực chuyên nghiệp. Lượt inbox tăng gấp đôi!",
                            highlight: true,
                        },
                        {
                            name: "Matt Cannon",
                            username: "@mattcannon",
                            avatar: "https://randomuser.me/api/portraits/men/3.jpg",
                            text: "Lectus faucibus sapien facilisis egestas tincidunt libero commodo et vitae at pellentesque diam quam a risus nulla etiam id.",
                        },
                        {
                            name: "Andy Smith",
                            username: "@andysmith",
                            avatar: "https://randomuser.me/api/portraits/men/4.jpg",
                            text: "Sagittis pulvinar pretium egestas tincidunt hac felis iaculis urna varius ut in eleifend semper aliquet dui habitant id nisi nullam.",
                        },
                        {
                            name: "Patrick Meyer",
                            username: "@patrickmeyer",
                            avatar: "https://randomuser.me/api/portraits/men/5.jpg",
                            text: "Lectus volutpat id ultricies leo ipsum ut sociis amet cursus purus dis feugiat eget curabitur nibh quis quam nec tincidunt feugiat.",
                        },
                        {
                            name: "Graham Hills",
                            username: "@grahamhills",
                            avatar: "https://randomuser.me/api/portraits/men/6.jpg",
                            text: "Tortor at libero facilisis arcu sed vel nascetur. vel purus amet dictumst nunc tellus in adipiscing nunc eu duis viverra morbi nulla.",
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
            </div>


            <div className="container tutorials-section">
                <h2 className="tutorials-title">Hướng dẫn sử dụng</h2>
                <div className="tutorials-grid">
                    {[
                        {
                            img: "https://www.fahasa.com/blog/wp-content/uploads/2025/03/AI-dai-dien-new.jpg",
                            tag: "Company",
                            date: "Aug 8, 2023",
                            title: "Cách sử dụng video",
                            link: "#",
                        },
                        {
                            img: "https://wisebusiness.vn/wp-content/uploads/2025/04/top-10-cac-ung-dung-ai-noi-bat-nhat-hien-nay-67f87cff2c0c9.jpg",
                            tag: "Product",
                            date: "Aug 8, 2023",
                            title: "Cách tạo hình ảnh",
                            link: "#",
                        },
                        {
                            img: "https://ai4kids.ai/cdn/shop/articles/ai.png?v=1692957193",
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
            </div>

            <footer className="footer">
                <div className="container">
                    <div className="footer-left">
                        <div className="footer-brand">
                            <div className="logo-circle" />
                            <span className="footer-logo-text">AI X+</span>
                        </div>
                        <p className="footer-description">
                            Lorem ipsum dolor sit amet consectetur iaculis viverra amet pulvinar vitae ultrices arcu gravida odio diam gravida congue.
                        </p>

                        <div className="footer-links">
                            <div className="footer-column">
                                <h4>Main pages</h4>
                                <ul>
                                    <li>Home (Sales)</li>
                                    <li>Home V1</li>
                                    <li>Home V2</li>
                                    <li>Home V3</li>
                                    <li>About</li>
                                    <li>Features</li>
                                    <li>Blog V1</li>
                                    <li>Blog V2</li>
                                    <li>Blog V3</li>
                                </ul>
                            </div>

                            <div className="footer-column">
                                <h4></h4>
                                <ul>
                                    <li>Blog post</li>
                                    <li>Contact V1</li>
                                    <li>Contact V2</li>
                                    <li>Contact V3</li>
                                    <li>Careers</li>
                                    <li>Career single</li>
                                    <li>Integrations</li>
                                    <li>Integration single</li>
                                </ul>
                            </div>

                            <div className="footer-column">
                                <h4></h4>
                                <ul>
                                    <li>Pricing</li>
                                    <li>Pricing single</li>
                                    <li>Request a demo</li>
                                    <li>Sign in</li>
                                    <li>Sign up</li>
                                    <li>Coming soon</li>
                                    <li>Reset password</li>
                                    <li>Update password</li>
                                </ul>
                            </div>

                            <div className="footer-column">
                                <h4>Utility pages</h4>
                                <ul>
                                    <li>Start here</li>
                                    <li>Style guide</li>
                                    <li>404 not found</li>
                                    <li>Password protected</li>
                                    <li>Changelog</li>
                                    <li>Licenses</li>
                                    <li><strong>More Webflow Templates</strong></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="footer-right">
                        <h3>The easiest way to power up your business with AI</h3>
                        <p>
                            Lorem ipsum dolor sit amet consectetur iaculis viverra amet pulvinar vitae ultrices arcu.
                        </p>
                        <button className="btn-primary">Get started</button>
                    </div>
                </div>
            </footer>


        </div>
    );
};

export default LandingPage;
