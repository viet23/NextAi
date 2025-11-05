// src/App.tsx
import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { routes } from "./routes/routes";
import PrivateRoute from "./components/PrivateRoute";
import { useTranslation } from "react-i18next";
import { ConfigProvider } from "antd";
import ResetPasswordPage from "./pages/resetPassword";

// 👇 import Pixel
import { initFbPixel } from "./lib/fbPixel";
import ChatWidget from "./components/ChatWidget";


// Pixel ID – nên để ở .env (CRA dùng prefix REACT_APP_)
const PIXEL_ID = process.env.REACT_APP_META_PIXEL_ID || "2596456847365922";

// Endpoint server proxy tới ChatGPT (đổi nếu backend bạn khác)
// Yêu cầu server trả { reply: string }
const CHAT_ENDPOINT = process.env.REACT_APP_CHAT_ENDPOINT || "/api/chat";

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage("vi");
  }, [i18n]);

  // Khởi tạo Pixel 1 lần
  useEffect(() => {
    if (PIXEL_ID) {
      initFbPixel(PIXEL_ID);
    }
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "Roboto",
          colorPrimary: "#2AA7DF",
        },
      }}
    >
      <Router>
        {/* Toàn bộ routing */}
        <Routes>
          {/* Route riêng */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Các route còn lại */}
          {routes.map((group) => (
            <Route key={group.key} element={<group.layout />}>
              {group.routes.map((route) => (
                <Route
                  key={route.key}
                  path={route.path}
                  element={
                    route.isProtect ? (
                      <PrivateRoute>
                        <route.component />
                      </PrivateRoute>
                    ) : (
                      <route.component />
                    )
                  }
                />
              ))}
            </Route>
          ))}
        </Routes>

        {/* Widget chat cố định (hiển thị trên mọi trang) */}
        <ChatWidget
          title="Hỗ trợ quảng cáo"
          systemPrompt="Bạn là trợ lý giúp tối ưu quảng cáo Facebook/Google/TikTok cho SMEs Việt Nam. Trả lời ngắn gọn, có checklist/next-steps."
          endpoint={CHAT_ENDPOINT}
          defaultOpen={false}
          position={{ right: 18, bottom: 18 }}
          zIndex={2000}
        />
      </Router>
    </ConfigProvider>
  );
}

export default App;
