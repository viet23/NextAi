import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import VideoAI from "src/components/VideoAI";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import { Button } from "antd";

const Video = () => {
  const { t } = useTranslation();
  useEffect(() => {
    // Nếu cần xử lý khi load component
  }, []);

  return (
    <PageTitleHOC title={`${t("video.title")}`}>
      <VideoAI />
    </PageTitleHOC>
  );
};

export default Video;
