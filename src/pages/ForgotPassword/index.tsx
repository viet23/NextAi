import React, { useEffect } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../../assets/images/next-logo.jpg";
import Reset from "../../assets/images/icon-reset.png";
import "./styles.scss";
import { useForgotPasswordMutation } from "src/store/api/accountApi";

const { Title, Text } = Typography;

const ForgotPasswordPage = () => {

  const [form] = Form.useForm();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();



  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await forgotPassword(values).unwrap();
      console.log("Send email to:", values.email);
      message.success("Hướng dẫn khôi phục đã được gửi đến email của bạn");
      form.resetFields();
      navigate("/signin");

      form.resetFields();
    } catch (err) {
      message.error("Vui lòng nhập đúng địa chỉ email");
    }
  };

  return (
    <div className="register-page">
      <img src={Logo} alt="logo" className="register-logo" />

      <div className="register-form-box">
        <div className="icon-wrapper">
          <img src={Reset} alt="reset-icon" className="reset-icon-img" />
        </div>


        <div className="register-header">
          <Title level={2} className="signin-title">
            {t("forgot.title")}
          </Title>
          <Text className="text-subtitle">
            {t("forgot.description")}
          </Text>
        </div>

        <Form layout="vertical" form={form}>
          <div className="input-button-row">
            <Form.Item
              name="email"
              style={{ flex: 1, marginBottom: 0 }}
              rules={[
                {
                  required: true,
                  type: "email",
                  message: t("forgot.emailRequired"),
                },
              ]}
            >
              <Input
                placeholder={t("forgot.emailPlaceholder")}
                className="input-dark"
              />
            </Form.Item>

            <Form.Item style={{ marginLeft: 12, marginBottom: 0 }}>
              <Button
                htmlType="submit"
                className="register-button"
                onClick={handleSubmit}
                style={{ height: 44 }}
              >
                {t("forgot.submit")}
              </Button>
            </Form.Item>
          </div>
        </Form>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
