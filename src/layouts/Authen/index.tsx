import { Col, Row, Typography } from "antd";
import { Outlet } from "react-router-dom";
import authBackground from "../../assets/images/auth-bg.png";
import styled from "styled-components";
const { Text } = Typography;
const RightPanel = styled.div`
  height: 100vh;
  background-image: url(${authBackground}); /* Đường dẫn đến ảnh nền */
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
`;
const AuthenLayout = () => {
  return (
    <>
      <Row>
        <Col md={12}>
          <Outlet />
        </Col>
        <Col md={12}>
          <RightPanel />
        </Col>
      </Row>
    </>
  );
};
export default AuthenLayout;
