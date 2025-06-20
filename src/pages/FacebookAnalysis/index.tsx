import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import FacebookAnalysis from "src/components/FacebookAnalysis";
import { PageTitleHOC } from "src/components/PageTitleHOC";

const Home = () => {
  const { t } = useTranslation();
  useEffect(() => {}, []);
  return (
    <PageTitleHOC title=" ALL ONE ADS ">
      <FacebookAnalysis />
    </PageTitleHOC>
  );
};
export default Home;
