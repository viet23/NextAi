import { useTranslation } from "react-i18next";
import FacebookAnalysi from "src/components/FacebookAnalysis";
import { PageTitleHOC } from "src/components/PageTitleHOC";

const FacebookAnalysis = () => {
  const { t } = useTranslation();

  return (
    <PageTitleHOC title={`${t("home.title")}`}>
      <FacebookAnalysis />
    </PageTitleHOC>
  );
};

export default FacebookAnalysi;
