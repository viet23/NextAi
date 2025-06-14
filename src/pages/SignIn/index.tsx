/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, Typography, Flex, message } from "antd";
import EmailLogo from "../../assets/images/logo-gmail.png";
import FaceBookLogo from "../../assets/images/logo-facebook.png";
import "./styles.scss";

const { Text } = Typography;

const SignIn = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    // Giả định gọi API đăng nhập thông thường
    try {
      // TODO: gọi login username/password nếu có
      message.success("Đăng nhập thành công!");
      navigate("/");
    } catch (error) {
      message.error("Đăng nhập thất bại!");
    }
  };

  const handleFacebookLogin = () => {
    const popup = window.open(
      "http://localhost:3001/api/v1/auth/facebook", // <-- backend NestJS
      "_blank",
      "width=600,height=700"
    );

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "http://localhost:3001") return;

      const user = event.data;
      if (user?.facebookId) {
        // Bạn có thể lưu vào localStorage/token tùy mục đích
        localStorage.setItem("user", JSON.stringify(user));
        message.success(`Xin chào, ${user.name}!`);
        navigate("/");
      }

      window.removeEventListener("message", handleMessage);
      popup?.close();
    };

    window.addEventListener("message", handleMessage);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-content text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Đăng nhập tài khoản mật khẩu */}
        <div className="account-login-form" style={{ width: '100%', marginBottom: 100 }}>
          <Input
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <Input.Password
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <Button style={{ width: '30%' }} type="primary" onClick={handleLogin} block>
            Đăng nhập
          </Button>
        </div>

        {/* Đăng nhập Facebook */}
        <div className="saml-login-section" style={{ width: '100%' }}>
          <Flex className="saml-sign-btn" onClick={handleFacebookLogin}>
            <img src={FaceBookLogo} width={75} />
            <Text className="saml-sign-btn-title">Đăng nhập bằng tài khoản Facebook</Text>
          </Flex>

          <Flex
            className="saml-sign-btn"
            onClick={() => {
              window.location.href = `${process.env.REACT_APP_PUBLIC_URL}/adfs/auth/saml/login-gtelpay`;
            }}
          >
            <img src={EmailLogo} width={75} />
            <Text className="saml-sign-btn-title">Đăng nhập bằng tài khoản Gmail</Text>
          </Flex>
        </div>

      </div>
    </div>
  );
};

export default SignIn;
