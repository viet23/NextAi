import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ImageAI from "src/components/ImageAI";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import { Button } from "antd";

const Image = () => {
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
    // Optional logic when component mounts
  }, []);

  return (
    <PageTitleHOC title={`${t("image.title")}`}>
      {/* Nút đổi ngôn ngữ bằng emoji */}
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

      <ImageAI />
    </PageTitleHOC>
  );
};

export default Image;
