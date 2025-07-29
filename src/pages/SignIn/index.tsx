import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, Typography, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useSignInMutation } from "src/store/api/authApi";
import { store } from "src/store/store";
import { setCurrentUser, setIsLogin, setToken } from "src/store/slice/auth.slice";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import EmailLogo from "../../assets/images/logo-gmail.png";
import FaceBookLogo from "../../assets/images/logo-facebook.png";
import Logo from "../../assets/images/next-logo.jpg";
import "./styles.scss";

const { Title, Text } = Typography;

const SignIn = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signIn] = useSignInMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [title, setTitle] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setTitle(t("signin.welcomeBack"));
  }, [t]);

  const handleLogin = async () => {
    try {
      const response = await signIn({ username, password }).unwrap();
      const { token, user } = response;
      if (token && user?.email) {
        store.dispatch(setToken(token));
        store.dispatch(setCurrentUser(user));
        store.dispatch(setIsLogin(true));
        message.success(`Hello, ${user.name || user.email}!`);
        navigate("/");
      }
    } catch (error: any) {
      message.error(t("signin.failed"));
      setTitle(t("signin.welcomeBack")); // đảm bảo dùng ngôn ngữ hiện tại
      setErrorMsg(t("signin.invalid"));
    }
  };

  const handleSocialLogin = (provider: "facebook" | "google") => {
    const popup = window.open(
      `${process.env.REACT_APP_PUBLIC_URL}/api/v1/auth/${provider}`,
      "_blank",
      "width=600,height=700"
    );

    const handleMessage = (event: MessageEvent) => {
      const { token, user } = event.data;
      store.dispatch(setToken(token));
      store.dispatch(setCurrentUser(user));
      store.dispatch(setIsLogin(true));
      if (token && user?.email) {
        message.success(`Hello, ${user.name || user.email}!`);
        navigate("/");
      }
      window.removeEventListener("message", handleMessage);
      popup?.close();
    };

    window.addEventListener("message", handleMessage);
  };

  return (
    <div className="signin-wrapper">
      <div className="signin-header">
        <img className="signin-logo" src={Logo} alt="Logo" />
        <Title level={2} className="signin-title">{title}</Title>
        <Text className="signin-sub">{t("signin.welcomeSub")}</Text>
      </div>

      <div className="signin-box">
        <div className="signin-input-group">
          <label className="signin-input-label">{t("signin.emailLabel")}</label>
          <Input
            className="signin-input"
            placeholder={t("signin.emailPlaceholder")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="signin-input-group">
          <label className="signin-input-label">{t("signin.passwordLabel")}</label>
          <Input
            type={showPassword ? "text" : "password"}
            className="signin-input"
            placeholder={t("signin.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            suffix={
              showPassword ? (
                <EyeTwoTone onClick={() => setShowPassword(false)} style={{ cursor: "pointer" }} />
              ) : (
                <EyeInvisibleOutlined onClick={() => setShowPassword(true)} style={{ cursor: "pointer" }} />
              )
            }
          />
          {errorMsg && (
            <Text type="danger" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
              {errorMsg}
            </Text>
          )}
        </div>

        <div className="signin-forgot">
          <label>
            <input type="checkbox" style={{ marginRight: 4 }} /> {t("signin.remember")}
          </label>

          <Link to="/forgot">{t("signin.forgot")}</Link>

        </div>

        <Button className="signin-btn" onClick={handleLogin} block>
          {t("signin.login")}
        </Button>

        <div className="signin-divider">{t("signin.or")}</div>

        <Button
          icon={<img src={EmailLogo} alt="gmail" width={20} />}
          onClick={() => handleSocialLogin("google")}
          className="signin-social-btn"
          block
        >
          {t("signin.google")}
        </Button>

        <Button
          icon={<img src={FaceBookLogo} alt="fb" width={20} />}
          onClick={() => handleSocialLogin("facebook")}
          className="signin-social-btn facebook"
          block
        >
          {t("signin.facebook")}
        </Button>

        <Text className="signin-footer">
          {t("signin.noAccount")} <Link to="/register">{t("signin.signupNow")}</Link>
        </Text>
      </div>
    </div>
  );
};

export default SignIn;
