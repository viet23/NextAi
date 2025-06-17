import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { IRootState } from "../../interfaces/app.interface";

export default React.memo(({ children }: any) => {
  const { isLogin ,user } = useSelector((state: IRootState) => state.auth)

  if (!isLogin || !user?.id)
    return <Navigate to='/signin' />;
  return children;
});