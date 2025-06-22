// components/FullscreenLoader.tsx
import React from "react";
import { Spin } from "antd";

interface FullscreenLoaderProps {
  spinning: boolean;
  tip?: string;
  backgroundColor?: string;
}

const FullscreenLoader: React.FC<FullscreenLoaderProps> = ({
  spinning,
  tip = "Đang xử lý...",
  backgroundColor = "rgba(255, 255, 255, 0.7)",
}) => {
  if (!spinning) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <Spin size="large" tip={tip} />
    </div>
  );
};

export default FullscreenLoader;
