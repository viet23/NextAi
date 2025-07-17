import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ImageAI from "src/components/ImageAI";
import { PageTitleHOC } from "src/components/PageTitleHOC";

const Image = () => {
  const { t} = useTranslation();

  useEffect(() => {
    // Optional logic when component mounts
  }, []);

  return (
    <PageTitleHOC title={`${t("image.title")}`}>
      <ImageAI />
    </PageTitleHOC>
  );
};

export default Image;
