import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Space,
  message,
  Table,
  Typography,
} from "antd";
import dayjs from "dayjs";
import {
  useLazyDetailCaseQuery,
} from "src/store/api/ticketApi";

const { Title, Paragraph } = Typography;

interface TicketFormProps {
  id: string | null;
  onRefetch: () => void;
}

const DetailTicket: React.FC<TicketFormProps> = ({ id }) => {
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
          <Title level={4}>Video information</Title>
          <Paragraph>
            <strong>Video creation date:</strong>{" "}
            {dayjs(videoData.createdAt).format("YYYY-MM-DD HH:mm:ss")}
          </Paragraph>
          <Paragraph>
            <strong>Caption:</strong> {videoData.caption}
          </Paragraph>
          <video
            controls
            style={{ width: "100%", borderRadius: 8 }}
            src={videoData.urlVideo}
          >
            Your browser does not support video.
          </video>
        </div>
      )}
    </div>
  );
};

export default DetailTicket;
