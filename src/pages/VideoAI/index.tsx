import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import VideoAI from "src/components/VideoAI";
import { PageTitleHOC } from "src/components/PageTitleHOC";

const Video = () => {
  const { t } = useTranslation();
  useEffect(() => {}, []);
  return (
    <PageTitleHOC title=" ALL ONE ADS ">
      <VideoAI />
    </PageTitleHOC>
  );
};
export default Video;
