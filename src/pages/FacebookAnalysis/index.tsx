import { useTranslation } from "react-i18next";
import FacebookAnalysis from "src/components/FacebookAnalysis";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import { Button } from "antd";

const Home = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "vi" ? "en" : "vi";
    i18n.changeLanguage(newLang);
  };

  const currentFlag =
    i18n.language === "vi"
      ? "/VN.png" // icon cờ Việt Nam
      : "/EN.png"; // icon cờ Anh

  return (
    <PageTitleHOC title={`${t("home.title")}`}>
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

      <FacebookAnalysis />
    </PageTitleHOC>
  );
};

export default Home;
