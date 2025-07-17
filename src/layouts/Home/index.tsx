import { Suspense } from "react";
import { Row } from "antd";
import { Outlet } from "react-router-dom";

const HomeLayout = () => {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <Row>
        <Outlet />
      </Row>
    </Suspense>
  );
};

export default HomeLayout;
