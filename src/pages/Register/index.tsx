import React, { useState } from "react";
import {
  Form,
  Input,
  Checkbox,
  Button,
  Typography,
  Divider,
  message,
} from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { store } from "src/store/store";
import {
  setCurrentUser,
  setIsLogin,
  setToken,
} from "src/store/slice/auth.slice";
import { useNavigate, Link } from "react-router-dom";
import { useCreateAccountMutation } from "src/store/api/accountApi";
import "./styles.scss";

import EmailLogo from "../../assets/images/logo-gmail.png";
import FaceBookLogo from "../../assets/images/logo-facebook.png";
import Logo from "../../assets/images/next-logo.jpg";

const { Title, Text } = Typography;

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [createAccount, { isLoading }] = useCreateAccountMutation();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createAccount(values).unwrap();
      message.success("Account created successfully!");
      form.resetFields();
      navigate("/signin"); // ✅ Điều hướng về trang đăng nhập
    } catch (error: any) {
      message.error(error?.data?.message || "Account creation failed!");
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
      if (token && user?.email) {
        store.dispatch(setToken(token));
        store.dispatch(setCurrentUser(user));
        store.dispatch(setIsLogin(true));
        message.success(`Hello, ${user.name || user.email}!`);
        navigate("/");
      }
      window.removeEventListener("message", handleMessage);
      popup?.close();
    };

    window.addEventListener("message", handleMessage);
  };

  return (
    <div className="register-page">
      <img src={Logo} alt="logo" className="register-logo" />

      <div className="register-header">
        <Title level={2} className="signin-title">
          {t("register.title")}
        </Title>
        <Text className="text-subtitle">
          {t("register.subtitle1")}
          <br />
          {t("register.subtitle2")}
        </Text>
      </div>

      <div className="register-form-box">
        <Form layout="vertical" form={form}>
          <div className="register-input-group">
            <Form.Item
              name="username"
              label={<Text style={{ color: "#ffffff" }}>{t("register.fullname")}</Text>}
              style={{ flex: 1, minWidth: 240 }}
              rules={[{ required: true, message: t("register.fullnameRequired") }]}
            >
              <Input
                placeholder={t("register.fullnamePlaceholder")}
                className="input-dark"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<Text style={{ color: "#ffffff" }}>{t("register.email")}</Text>}
              style={{ flex: 1, minWidth: 240 }}
              rules={[
                { required: true, type: "email", message: t("register.emailRequired") },
              ]}
            >
              <Input
                placeholder={t("register.emailPlaceholder")}
                className="input-dark"
              />
            </Form.Item>
          </div>
          <div className="register-input-group">
            <Form.Item
              name="phone"
              label={<Text style={{ color: "#ffffff" }}>{t("register.phone")}</Text>}
              style={{ flex: 1, minWidth: 240 }}
              rules={[
                { required: true, message: t("register.phoneRequired") },
              ]}
            >
              <Input
                placeholder={t("register.phonePlaceholder")}
                className="input-dark"
              />
            </Form.Item>
            <Form.Item
              name="zalo"
              label={<Text style={{ color: "#ffffff" }}>{t("register.zalo")}</Text>}
              style={{ flex: 1, minWidth: 240 }}
              rules={[
                { required: true,  message: t("register.zaloRequired") },
              ]}
            >
              <Input
                placeholder={t("register.zaloPlaceholder")}
                className="input-dark"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="password"
            label={<Text style={{ color: "#ffffff" }}>{t("register.password")}</Text>}
            rules={[{ required: true, min: 6, message: t("register.passwordRequired") }]}
          >
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={t("register.passwordPlaceholder")}
              className="password-input-dark"
              autoComplete="off"
              suffix={
                showPassword ? (
                  <EyeTwoTone onClick={() => setShowPassword(false)} style={{ cursor: "pointer" }} />
                ) : (
                  <EyeInvisibleOutlined onClick={() => setShowPassword(true)} style={{ cursor: "pointer" }} />
                )
              }
            />
          </Form.Item>

          <Form.Item
            name="agree"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(t("register.termsRequired")),
              },
            ]}
          >
            <Checkbox className="register-checkbox">
              {t("register.terms")}
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              htmlType="submit"
              block
              className="register-button"
              onClick={handleSubmit}
              loading={isLoading}
            >
              {t("register.submit")}
            </Button>
          </Form.Item>

          <Divider plain className="register-divider">
            {t("register.or")}
          </Divider>

          <Button
            block
            icon={<img src={EmailLogo} alt="google" />}
            className="register-social-btn"
            onClick={() => handleSocialLogin("google")}
          >
            {t("register.withGoogle")}
          </Button>

          {/* <Button
            block
            icon={<img src={FaceBookLogo} alt="fb" />}
            className="register-social-btn"
            style={{ marginBottom: 0 }}
            onClick={() => handleSocialLogin("facebook")}
          >
            {t("register.withFacebook")}
          </Button> */}

          <div className="register-footer">
            {t("register.alreadyHaveAccount")}{" "}
            <Link to="/signin">{t("register.loginNow")}</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default RegisterPage;
