import React, { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "../../assets/images/next-logo.jpg";
import "./styles.scss";
import Reset from "../../assets/images/icon-reset.png";
import { useResetUserPasswordMutation } from "src/store/api/accountApi";

const { Title, Text } = Typography;

const ResetPasswordPage = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetUserPasswordMutation();

  const token = searchParams.get("token");
  console.log("Token:", token);

  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        token,
        newPassword: values.newPassword,
      };
      await resetPassword(payload).unwrap();

      message.success("Đặt lại mật khẩu thành công!");
      navigate("/signin");

    } catch (error) {
      message.error("Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
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
          <Title level={2} className="signin-title">Tạo mật khẩu mới</Title>
          <Text className="text-subtitle">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </Text>

          <div className="register-form-box">
            <Form layout="vertical" form={form}>
              <Form.Item
                name="newPassword"
                label={<Text style={{ color: "#fff" }}>Mật khẩu mới</Text>}
                rules={[{ required: true, min: 6, message: "Ít nhất 6 ký tự" }]}
              >
                <Input.Password
                  className="input-dark"
                  placeholder="Nhập mật khẩu mới"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  block
                  className="register-button"
                  htmlType="submit"
                  onClick={handleReset}
                  loading={loading}
                >
                  Xác nhận
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>



      </div>
    </div>
  );
};

export default ResetPasswordPage;
