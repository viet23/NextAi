import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import VideoAI from "src/components/VideoAI";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import { Button } from "antd";

const Video = () => {
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
    // Nếu cần xử lý khi load component
  }, []);

  return (
    <PageTitleHOC title={`${t("video.title")}`}>
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
      <VideoAI />
    </PageTitleHOC>
  );
};

export default Video;
