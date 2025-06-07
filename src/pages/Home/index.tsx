import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ImageAI from "src/components/ImageAI";
import { PageTitleHOC } from "src/components/PageTitleHOC";

const Home = () => {
  const { t } = useTranslation();
  useEffect(() => {}, []);
  return (
    <PageTitleHOC title=" Next Ads AI ">
      <ImageAI />
    </PageTitleHOC>
  );
};
export default Home;
