import React, { useState } from "react";
import { Layout, Input, Button, message } from "antd";

const { Content } = Layout;
const { TextArea } = Input;

const FullscreenSplitCard = () => {
  const [caption, setCaption] = useState("");
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingCaption, setLoadingCaption] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [resolution, setResolution] = useState("720p");
  const [ratio, setRatio] = useState("16:9");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("https://api.imgbb.com/1/upload?key=8c9e574f76ebba8ad136a2715581c81c&expiration=1800", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data?.data?.url) {
        setUploadedImageUrl(data.data.url);
        message.success("Ảnh đã được tải lên thành công!");
      } else {
        message.error("Lỗi tải ảnh lên imgbb.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      message.error("Lỗi khi upload ảnh.");
    }
  };

  const translatePromptToEnglish = async (text: string) => {
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
              content: `Translate and expand into detailed English prompt: "${text}"`,
            },
          ],
          temperature: 0.9,
          max_tokens: 300,
        }),
      });

      const data = await response.json();
      return data?.choices?.[0]?.message?.content?.trim() || "";
    } catch (err) {
      console.error("Translation error:", err);
      return "";
    }
  };

  const generateImage = async () => {
    if (!prompt) {
      message.warning("Please enter a prompt.");
      return;
    }

    setLoadingImage(true);
    setImgError(false);

    try {
      const translatedPrompt = await translatePromptToEnglish(prompt);
      if (!translatedPrompt) {
        message.error("Failed to translate prompt.");
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_URL}/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: translatedPrompt,
          resolution,
          ratio,
          referenceImage: uploadedImageUrl,
        }),
      });

      const data = await response.json();
      if (data?.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        message.error("Image generation failed.");
      }
    } catch (err) {
      console.error("Image error:", err);
      message.error("Image generation error.");
    } finally {
      setLoadingImage(false);
    }
  };

  const generateCaption = async () => {
    if (!prompt) {
      message.warning("Please enter a prompt first.");
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
              content: `Viết một caption hấp dẫn bằng tiếng Việt cho mô tả hình ảnh: "${prompt}"`,
            },
          ],
          temperature: 0.8,
          max_tokens: 100,
        }),
      });

      const data = await response.json();
      setCaption(data?.choices?.[0]?.message?.content?.trim() || "");
    } catch (error) {
      console.error("Caption error:", error);
      message.error("Caption generation error.");
    } finally {
      setLoadingCaption(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#fff" }}>
      <Content style={{ padding: 24 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
          <div style={{ flex: 1, minWidth: 320, maxWidth: 600 }}>
            <TextArea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your image"
              rows={5}
              style={{ marginBottom: 16, fontSize: 16 }}
            />
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <select
                style={{ flex: 1, padding: 8, fontSize: 14 }}
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              >
                <option value="" disabled>Image Resolution</option>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
              </select>
              <select
                style={{ flex: 1, padding: 8, fontSize: 14 }}
                value={ratio}
                onChange={(e) => setRatio(e.target.value)}
              >
                <option value="" disabled>Image Size</option>
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
                <option value="1:1">1:1</option>
                <option value="4:3">4:3</option>
                <option value="3:4">3:4</option>
                <option value="21:9">21:9</option>
              </select>
            </div>
            <br />
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <Button
                type="primary"
                size="large"
                onClick={() => document.getElementById("upload-image")?.click()}
                style={{ backgroundColor: "#D2E3FC", color: "#000", border: "1px solid #D2E3FC", borderRadius: 6 }}
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
            </div>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <img
                src={uploadedImage || "https://via.placeholder.com/300x200?text=Upload"}
                alt="Uploaded"
                style={{ maxWidth: "100%", height: "auto", objectFit: "contain", opacity: uploadedImage ? 1 : 0.6, borderRadius: 6, border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
              <Button style={{ backgroundColor: "#D2E3FC", color: "#000", border: "1px solid #D2E3FC", borderRadius: 6 }} type="primary" size="large" onClick={generateImage} loading={loadingImage}>
                Generate Image
              </Button>
              <Button style={{ backgroundColor: "#D2E3FC", color: "#000", border: "1px solid #D2E3FC", borderRadius: 6 }} type="primary" size="large" onClick={generateCaption} loading={loadingCaption}>
                Generate Caption
              </Button>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 320, maxWidth: 600 }}>
            <div style={{ background: "#f0f0f0", height: 400, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, marginBottom: 16, overflow: "hidden" }}>
              {!imgError && imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Generated"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={() => setImgError(true)}
                />
              ) : (
                <span style={{ color: "#999" }}>No Image</span>
              )}
            </div>
            <TextArea
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption"
              style={{ fontSize: 15, marginBottom: 16 }}
            />
            <Button type="primary" style={{ backgroundColor: "#D2E3FC", color: "#000", border: "1px solid #D2E3FC", borderRadius: 6 }} block size="large">
              Post Facebook
            </Button>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default FullscreenSplitCard;
