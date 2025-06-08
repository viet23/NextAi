import React, { useState } from "react";
import { Layout, Input, Button, message } from "antd";

const { Content } = Layout;
const { TextArea } = Input;

const VideoGenerator = () => {
  const [caption, setCaption] = useState("");
  const [promptText, setPromptText] = useState("");
  const [videoSrc, setVideoSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCaption, setLoadingCaption] = useState(false);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedImageFile(file);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("https://api.imgbb.com/1/upload?key=8c9e574f76ebba8ad136a2715581c81c&expiration=86400", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data?.data?.url) {
        setUploadedImageUrl(data.data.url);
        message.success("Upload image thành công");
      } else {
        message.error("Upload ảnh thất bại");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Lỗi khi upload ảnh");
    }
  };

  const generateVideo = async () => {
    if (!promptText || !uploadedImageUrl) {
      message.warning("Vui lòng nhập mô tả và tải ảnh lên.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://31.97.67.219:4001/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText,
          promptImage: uploadedImageUrl,
          ratio: "16:9",
          duration: 5,
        }),
      });

      const data = await response.json();
      if (data?.videoUrl) {
        setVideoSrc(data.videoUrl);
      } else {
        message.error("Không tạo được video");
        console.error("Video API error:", data);
      }
    } catch (error) {
      console.error("Generate video error:", error);
      message.error("Lỗi tạo video");
    } finally {
      setLoading(false);
    }
  };

  const generateCaption = async () => {
    if (!promptText) {
      message.warning("Vui lòng nhập mô tả");
      return;
    }

    setLoadingCaption(true);
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "user",
              content: `Viết một caption sáng tạo bằng tiếng Việt cho: "${promptText}"`,
            },
          ],
          temperature: 0.8,
          max_tokens: 100,
        }),
      });

      const data = await response.json();
      if (data?.choices?.[0]?.message?.content) {
        setCaption(data.choices[0].message.content.trim());
      } else {
        message.error("Không tạo được caption");
      }
    } catch (err) {
      console.error("Caption error:", err);
      message.error("Lỗi tạo caption");
    } finally {
      setLoadingCaption(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#fff" }}>
      <Content style={{ padding: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
          {/* LEFT */}
          <div style={{ flex: 1, minWidth: 300, maxWidth: 600 }}>
            <TextArea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Mô tả để tạo video"
              rows={6}
              style={{ marginBottom: 20, fontSize: 16 }}
            />
            <div style={{ textAlign: "center", marginBottom: 16 }}>
            <Button
              type="primary"
              size="large"
              onClick={() => document.getElementById("upload-image")?.click()}
              style={{ backgroundColor: "#D2E3FC", color: "#000", borderRadius: 6, marginBottom: 16 }}
            >
              Upload product Image
            </Button>

            <input
              id="upload-image"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
            <div style={{ marginBottom: 24, textAlign: "center" }}>
              <img
                src={uploadedImageUrl || "https://via.placeholder.com/300x200?text=Upload"}
                alt="Uploaded"
                style={{ maxWidth: "100%", height: "auto", borderRadius: 6, border: "1px solid #ccc", opacity: uploadedImageUrl ? 1 : 0.5 }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <Button
              style={{ backgroundColor: "#D2E3FC", color: "#000", borderRadius: 6 }}
              type="primary"
              size="large"
              onClick={generateVideo}
              loading={loading}
            >
              Generate Video
            </Button>
            <Button
              style={{ backgroundColor: "#D2E3FC", color: "#000", borderRadius: 6 }}
              type="primary"
              size="large"
              onClick={generateCaption}
              loading={loadingCaption}
            >
              Generate Caption
            </Button>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ flex: 1, minWidth: 300, maxWidth: 600 }}>
          <div style={{ background: "#f0f0f0", height: "40vh", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, marginBottom: 16 }}>
            {videoSrc ? (
              <video controls style={{ width: "100%", borderRadius: 12 }}>
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <span style={{ color: "#999" }}>No Video</span>
            )}
          </div>
          <TextArea
            rows={4}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption"
            style={{ fontSize: 15, marginBottom: 16 }}
          />
          <Button type="primary" style={{ backgroundColor: "#D2E3FC", color: "#000", borderRadius: 6 }} block size="large">
            Post Facebook
          </Button>
        </div>
      </div>
    </Content>
    </Layout >
  );
};

export default VideoGenerator;
