import React, { useState } from "react";
import { Layout, Input, Button, Card, Typography, message } from "antd";

const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;

const VideoGenerator = () => {
  const [caption, setCaption] = useState("");
  const [promptText, setPromptText] = useState("");
  const [videoSrc, setVideoSrc] = useState("");
  const [loading, setLoading] = useState(false);

  const generateVideo = async () => {
    if (!promptText) {
      message.warning("Please enter a prompt.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer key_1c3c6373cdb636e164abec2910d92eb27597e0b58d385123a6d6c6d47167cf8fa860f206a6c45c1a7b1909c3e7220d5b84d20f29e023351b798bb621b675717b",
          "X-Runway-Version": "2024-11-06",
        },
        body: JSON.stringify({
          promptImage: "https://pasgo.vn/Upload/anh-chi-tiet/nha-hang-hotpot-kingdom-tran-quoc-hoan-1-normal-1422136542861.webp",
          promptText: promptText,
          model: "gen4_turbo",
          ratio: "1280:720",
          duration: 5,
        }),
      });

      const data = await response.json();

      if (data && data.video && data.video.base64) {
        const base64Video = `data:video/mp4;base64,${data.video.base64}`;
        setVideoSrc(base64Video);
      } else {
        message.error("Video generation failed.");
        console.error("Invalid API response:", data);
      }
    } catch (err) {
      console.error("Error generating video:", err);
      message.error("Error generating video.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#fff" }}>
      <Content
        style={{
          padding: "24px 24px 48px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: 1200 }}>
          {/* Input và nút hành động */}
          <Input
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Enter video prompt"
            style={{ width: "100%", marginBottom: 16 }}
          />
          <div
            style={{
              marginBottom: 24,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Button type="primary" loading={loading} onClick={generateVideo}>
              Generate Video
            </Button>
            <Button type="primary" disabled>
              Generate Caption
            </Button>
            <Button type="primary" disabled>
              Post Facebook
            </Button>
          </div>

          {/* Video + Caption Card */}
          <Card
            style={{
              width: "100%",
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            bodyStyle={{ padding: 24 }}
          >
            <div
              style={{
                display: "flex",
                gap: 24,
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "stretch",
              }}
            >
              {/* Video box */}
              <div
                style={{
                  flex: 1,
                  minWidth: 300,
                  backgroundColor: "#f0f0f0",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  maxHeight: 400,
                }}
              >
                {videoSrc ? (
                  <video
                    width="100%"
                    height="100%"
                    controls
                    style={{ borderRadius: 12, objectFit: "cover" }}
                    src={videoSrc}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <span style={{ color: "#999" }}>No Video</span>
                )}
              </div>

              {/* Caption Input */}
              <div style={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column" }}>
                <Title level={5}>Caption</Title>
                <TextArea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={6}
                  placeholder="Enter your caption..."
                  style={{ borderRadius: 8, flex: 1 }}
                />
              </div>
            </div>

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: 24,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <Button type="primary" onClick={generateVideo} loading={loading}>
                Regenerate
              </Button>
              <Button type="primary" disabled>
                Regenerate
              </Button>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default VideoGenerator;
