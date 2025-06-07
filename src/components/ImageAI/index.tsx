import React, { useState } from "react";
import { Layout, Input, Button, Typography, Card, message } from "antd";

const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;

const FullscreenSplitCard = () => {
  const [caption, setCaption] = useState("");
  const [prompt, setPrompt] = useState("");
  const [imagePrompt, setImagePrompt] = useState(""); // tiếng Anh
  const [imageUrl, setImageUrl] = useState("");
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingCaption, setLoadingCaption] = useState(false);
  const [imgError, setImgError] = useState(false);

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
              content: `
You are an expert in creating prompts for photorealistic AI image generation.

Given the following Vietnamese description, translate it into an **English prompt**, and **expand it** into a detailed, vivid, and visually rich description including design ideas such as lighting, setting, mood, subject details, background elements, and camera angle.

Make sure the final prompt is optimized for a model like DALL·E 3.

Vietnamese description: "${text}"
`,
            },
          ],
          temperature: 0.9,
          max_tokens: 300,
        }),
      });

      const data = await response.json();
      return data?.choices?.[0]?.message?.content?.trim() || "";
    } catch (err) {
      console.error("Translation/Expansion error:", err);
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
      // Step 1: Translate to English
      const translatedPrompt = await translatePromptToEnglish(prompt);

      if (!translatedPrompt) {
        message.error("Failed to translate prompt.");
        return;
      }

      setImagePrompt(translatedPrompt); // Optional: hiển thị cho người dùng

      // Step 2: Generate image with translated prompt
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3", // vẫn là model này cho hình ảnh
          prompt: translatedPrompt,
          n: 1,
          size: "1024x1024", // hoặc "1024x1792", "1792x1024" tùy yêu cầu
          response_format: "b64_json" // có thể đổi thành 'url' nếu muốn link ảnh
        }),
      });


      const data = await response.json();

      if (data?.data?.[0]?.b64_json) {
        const base64Image = `data:image/png;base64,${data.data[0].b64_json}`;
        setImageUrl(base64Image);
      } else {
        message.error("Image generation failed.");
        console.error("API response:", data);
      }
    } catch (err) {
      console.error("Error generating image:", err);
      message.error("Error generating image.");
    } finally {
      setLoadingImage(false);
    }
  };

  const generateCaption = async () => {
    if (!prompt) {
      message.warning("Please enter a prompt first.");
      return;
    }
    console.log('logg-----------',process.env.REACT_APP_OPENAI_API_KEY);
    

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
              content: `Viết một caption sáng tạo và hấp dẫn bằng tiếng Việt cho mô tả hình ảnh sau: "${prompt}"`,
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
        message.error("Caption generation failed.");
        console.error("Caption API response:", data);
      }
    } catch (error) {
      console.error("Error generating caption:", error);
      message.error("Error generating caption.");
    } finally {
      setLoadingCaption(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#fff" }}>
      <Content style={{ padding: "24px", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 1200 }}>
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Mô tả ảnh bằng tiếng Việt"
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
            <Button type="primary" loading={loadingImage} onClick={generateImage}>
              Generate Image
            </Button>
            <Button type="primary" loading={loadingCaption} onClick={generateCaption}>
              Generate Caption
            </Button>
            <Button type="primary" disabled>
              Post Facebook
            </Button>
          </div>

          <Card
            style={{ width: "100%", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
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

              <div style={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column" }}>
                <Title level={5}>Caption</Title>
                <TextArea
                  rows={6}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Enter your caption..."
                  style={{ borderRadius: 8, flex: 1 }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: 24,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <Button type="primary" onClick={generateImage}>
                Regenerate
              </Button>
              <Button type="primary" onClick={generateCaption}>
                Regenerate Caption
              </Button>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default FullscreenSplitCard;
