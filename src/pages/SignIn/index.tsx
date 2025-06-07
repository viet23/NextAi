/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSamlSigninMutation, useSignInMutation } from "../../store/api/authApi";
import { Flex, Typography, Input, Button } from "antd";
import EmailLogo from "../../assets/images/logo-gmail.png";
import FaceBookLogo from "../../assets/images/logo-facebook.png";
import "./styles.scss";

const { Text } = Typography;

const SignIn = () => {
  const [samlSignin, { isSuccess }] = useSamlSigninMutation();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signIn, { isLoading, isError, error }] = useSignInMutation();

  useEffect(() => {
    samlSignin({});
  }, []);

  useEffect(() => {
    if (isSuccess) {
      navigate("/", { replace: true });
    }
  }, [isSuccess]);

  const handleLogin = async () => {
    try {
      const response = await signIn({ username, password }).unwrap();
      console.log("Đăng nhập thành công:", response);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Đăng nhập thất bại:", err);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-content text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Form đăng nhập tài khoản mật khẩu */}
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
          <br />
          <Button style={{ width: '30%' }} type="primary" onClick={handleLogin} block>
            Đăng nhập
          </Button>
        </div>

        {/* Phần đăng nhập SAML */}
        <div className="saml-login-section" style={{ width: '100%' }}>
          <Flex
            className="saml-sign-btn"
            onClick={() => {
              window.location.href = `${process.env.REACT_APP_PUBLIC_URL}/adfs/auth/saml/login`;
            }}
          >
            <img src={FaceBookLogo} width={75} />
            <Text className="saml-sign-btn-title">
              Đăng nhập bằng tài khoản Facebook
            </Text>
          </Flex>

          {/* Đăng nhập bằng tài khoản Gtelpay */}
          <Flex
            className="saml-sign-btn"
            onClick={() => {
              window.location.href = `${process.env.REACT_APP_PUBLIC_URL}/adfs/auth/saml/login-gtelpay`;
            }}
          >
            <img src={EmailLogo} width={75} />
            <Text className="saml-sign-btn-title">
              Đăng nhập bằng tài khoản Gmail
            </Text>
          </Flex>
        </div>

      </div>
    </div>
  );
};

export default SignIn;
