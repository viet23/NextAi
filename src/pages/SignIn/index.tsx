/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, Typography, Flex, message, Divider } from "antd";
import EmailLogo from "../../assets/images/logo-gmail.png";
import FaceBookLogo from "../../assets/images/logo-facebook.png";
import "./styles.scss";
import { useSignInMutation } from "src/store/api/authApi";
import { store } from "src/store/store";
import { setCurrentUser, setIsLogin, setToken } from "src/store/slice/auth.slice";

const { Text, Title } = Typography;

const SignIn = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signIn, { isLoading, isError, error }] = useSignInMutation();

  const handleLogin = async () => {
    try {
      const response = await signIn({ username, password }).unwrap();
      message.success("Đăng nhập thành công!");
      navigate("/");
    } catch (error) {
      message.error("Đăng nhập thất bại!");
    }
  };

  const handleSocialLogin = (provider: "facebook" | "google") => {
    const popup = window.open(
      `${process.env.REACT_APP_PUBLIC_URL}/api/v1/auth/${provider}`,
      "_blank",
      "width=600,height=700"
    );

    const handleMessage = (event: MessageEvent) => {
      // if (event.origin !== "http://localhost:3001") return;

      const { token, user } = event.data;
      store.dispatch(setToken(token));
      store.dispatch(setCurrentUser(user));
      store.dispatch(setIsLogin(true));
      if (token && user?.email) {
        message.success(`Hello, ${user.name || user.email}!`);
        navigate("/");
      }

      // Gỡ listener & đóng popup
      window.removeEventListener("message", handleMessage);
      popup?.close();
    };

    // ✅ KHÔNG console.log(popup) – sẽ gây lỗi CORS internal
    window.addEventListener("message", handleMessage);
  };

  return (
    <div className="auth-wrapper">
      <div
        className="auth-content"
        style={{
          maxWidth: 400,
          margin: "auto",
          padding: 24,
          backgroundColor: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <Title level={3}>Log in</Title>

        <Input
          placeholder="User name"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <Input.Password
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ marginBottom: 20 }}
        />
        <Button type="primary" onClick={handleLogin} block size="large">
          Log in
        </Button>

        <Divider plain>Or log in with</Divider>

        <Flex vertical gap={12}>
          {/* <Button
            icon={<img src={FaceBookLogo} alt="fb" width={20} style={{ marginRight: 8 }} />}
            onClick={() => handleSocialLogin("facebook")}
            block
            style={{
              backgroundColor: "#1877f2",
              color: "#fff",
              border: "none",
              fontWeight: 500,
            }}
          >
            Facebook
          </Button> */}

          <Button
            icon={<img src={EmailLogo} alt="gmail" width={20} style={{ marginRight: 8 }} />}
            onClick={() => handleSocialLogin("google")}
            block
            style={{
              backgroundColor: "#fff",
              color: "#000",
              border: "1px solid #ddd",
              fontWeight: 500,
            }}
          >
            Google
          </Button>
        </Flex>
      </div>
    </div>
  );
};

export default SignIn;
