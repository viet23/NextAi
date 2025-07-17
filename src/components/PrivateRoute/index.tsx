import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { IRootState } from "../../interfaces/app.interface";

export default React.memo(({ children }: any) => {
  let { isLogin, user } = useSelector((state: IRootState) => state.auth || { user: undefined });
  console.log(`user`, user);
  if (user == null) {
    user = undefined
  }

  if (!isLogin || !user?.id) return <Navigate to="/home" />;
  return children;
});
