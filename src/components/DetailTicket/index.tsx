import React, { useEffect, useState } from "react";
import {
  message,
  Modal,
  Typography,
} from "antd";
import dayjs from "dayjs";
import {
  useLazyDetailCaseQuery,
} from "src/store/api/ticketApi";
import { useTranslation } from "react-i18next";
import { DownloadOutlined } from "@ant-design/icons";

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
          {/* <Title level={4}>{t("video.info_title")}</Title> */}

          <Paragraph>
            <strong>{t("video.created_date")}:</strong>{" "}
            {dayjs(videoData.createdAt).format("YYYY-MM-DD HH:mm:ss")}
          </Paragraph>

          <Paragraph>
            <strong>{t("video.caption")}:</strong> {videoData.caption}
          </Paragraph>

          <div style={{ position: "relative", width: "100%" }}>
            {videoData.urlVideo ? (
              /\.(mp4|webm|ogg)(\?|$)/i.test(videoData.urlVideo) ? (
                <video
                  controls
                  style={{ width: "100%", borderRadius: 8, display: "block" }}
                  src={videoData.urlVideo}
                >
                  {t("video.not_supported")}
                </video>
              ) : (
                <img
                  src={videoData.urlVideo}
                  alt="Generated media"
                  style={{ width: "100%", borderRadius: 8, display: "block" }}
                />
              )
            ) : (
              <Paragraph>{t("video.no_media")}</Paragraph>
            )}

            {/* Icon tải xuống nếu có media */}
            {videoData.urlVideo && (
              <DownloadOutlined
                onClick={() => {
                  Modal.confirm({
                    title: "Tải xuống?",
                    content: "Bạn có chắc muốn tải file này về thiết bị?",
                    okText: "Tải xuống",
                    cancelText: "Hủy",
                    onOk: async () => {
                      try {
                        const response = await fetch(videoData.urlVideo);
                        const blob = await response.blob();
                        const blobUrl = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = blobUrl;
                        a.download = /\.(mp4|webm|ogg)(\?|$)/i.test(videoData.urlVideo)
                          ? "video.mp4"
                          : "image.jpg";
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(blobUrl);
                        message.success("Đã bắt đầu tải xuống");
                      } catch (err) {
                        console.error("Tải thất bại:", err);
                        message.error("Tải xuống thất bại");
                      }
                    },
                  });
                }}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  fontSize: 20,
                  background: "#fff",
                  padding: 6,
                  borderRadius: "50%",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  zIndex: 10,
                }}
                title="Tải xuống"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailTicket;
