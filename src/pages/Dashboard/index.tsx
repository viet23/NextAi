import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import DashboardAI from "src/components/Dashboard";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import { Button } from "antd";

const Dashboard = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "vi" ? "en" : "vi";
    i18n.changeLanguage(newLang);
  };

  const currentFlag =
    i18n.language === "vi"
      ? "/VN.png" // icon cờ Việt Nam
      : "/EN.png"; // icon cờ Anh

  useEffect(() => {
    // Bạn có thể thêm logic khi mount nếu cần
  }, []);

  return (
    <PageTitleHOC title={`${t("dashboard.title")}`}>
      {/* Nút đổi ngôn ngữ */}
      <div style={{ textAlign: "right", marginBottom: 12 }}>
        <Button
          onClick={toggleLanguage}
          shape="circle"
          style={{ width: 32, height: 32, padding: 0 }}
        >
          <img
            src={currentFlag}
            alt="flag"
            style={{ width: 20, height: 20, borderRadius: "50%" }}
          />
        </Button>
      </div>

      <DashboardAI />
    </PageTitleHOC>
  );
};

export default Dashboard;
