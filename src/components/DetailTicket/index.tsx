import React, { useEffect, useState } from "react";
import {
  message,
  Typography,
} from "antd";
import dayjs from "dayjs";
import {
  useLazyDetailCaseQuery,
} from "src/store/api/ticketApi";
import { useTranslation } from "react-i18next";

const { Title, Paragraph } = Typography;

interface TicketFormProps {
  id: string | null;
  onRefetch: () => void;
}

const DetailTicket: React.FC<TicketFormProps> = ({ id }) => {
  const { t } = useTranslation();
  const [getDetailTicket] = useLazyDetailCaseQuery();
  const [videoData, setVideoData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      getDetailTicket(id)
        .unwrap()
        .then((ticketData) => {

          // Lưu lại dữ liệu video nếu có
          if (ticketData?.urlVideo || ticketData?.caption) {
            setVideoData({
              urlVideo: ticketData.urlVideo,
              caption: ticketData.caption,
              createdAt: ticketData.createdAt,
            });
          }
        })
        .catch(() => {
          message.error("Error getting article information!");
        });
    } else {

      setVideoData(null);
    }
  }, [id, getDetailTicket]);

  return (
   <div style={{ backgroundColor: "#fff", padding: 20, borderRadius: 8 }}>
    {videoData && (
      <div style={{ marginTop: 10 }}>
        <Title level={4}>{t("video.info_title")}</Title>

        <Paragraph>
          <strong>{t("video.created_date")}:</strong>{" "}
          {dayjs(videoData.createdAt).format("YYYY-MM-DD HH:mm:ss")}
        </Paragraph>

        <Paragraph>
          <strong>{t("video.caption")}:</strong> {videoData.caption}
        </Paragraph>

        {videoData.urlVideo ? (
          /\.(mp4|webm|ogg)(\?|$)/i.test(videoData.urlVideo) ? (
            <video
              controls
              style={{ width: "100%", borderRadius: 8 }}
              src={videoData.urlVideo}
            >
              {t("video.not_supported")}
            </video>
          ) : (
            <img
              src={videoData.urlVideo}
              alt="Generated media"
              style={{ width: "100%", borderRadius: 8 }}
            />
          )
        ) : (
          <Paragraph>{t("video.no_media")}</Paragraph>
        )}
      </div>
    )}
  </div>
  );
};

export default DetailTicket;
