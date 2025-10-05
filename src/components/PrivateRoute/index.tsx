import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { IRootState } from "../../interfaces/app.interface";
import { Modal } from "antd";

const PrivateRoute = React.memo(({ children }: any) => {
  // hooks luôn gọi ở đầu
  const navigate = useNavigate();
  const location = useLocation();
  const shownRef = useRef(false);
  const { isLogin, user } = useSelector((state: IRootState) => state.auth || { user: undefined });

  useEffect(() => {
    if (!isLogin || !user?.id) return;
    if (user.phone && user.phone.length > 0) return;
    if (location.pathname.startsWith(`/user/${user.id}`)) return;
    if (shownRef.current) return;

    shownRef.current = true;

    Modal.warning({
      // tiêu đề màu đỏ
      title: <span style={{ color: "red" }}>Cập nhật thông tin</span>,
      // nội dung: nền trắng, chữ đỏ
      content: (
        <div style={{ background: "#ffffff", color: "red", padding: "4px 0" }}>
          Vui lòng cập nhật số điện thoại để tiếp tục sử dụng đầy đủ tính năng.
        </div>
      ),
      okText: "Cập nhật ngay",
      onOk: () => navigate(`/user/${user.id}`),
      // đảm bảo phần thân modal có nền trắng
      bodyStyle: { background: "#ffffff" },
      centered: true,
    });
  }, [isLogin, user, location.pathname, navigate]);

  if (!isLogin || !user?.id) {
    return <Navigate to="/home" replace />;
  }

  return children;
});

export default PrivateRoute;
