import React, { useRef, useState } from "react";
import { Layout, Input, Button, message, Progress, Typography } from "antd";
import { useSelector } from "react-redux";
import { IRootState } from "src/interfaces/app.interface";
import { useGetAccountQuery } from "src/store/api/accountApi";
import { useCreateCaseMutation } from "src/store/api/ticketApi";
import AutoPostModal from "../AutoPostModal";
import FullscreenLoader from "../FullscreenLoader"; import { contentFetchOpportunityScore, contentGenerateCaption } from "src/utils/facebook-utild";
import { useTranslation } from "react-i18next";
;
const { Title, Text } = Typography;

const { Content } = Layout;
const { TextArea } = Input;

const FullscreenSplitCard = () => {
  const { t } = useTranslation();
  const [caption, setCaption] = useState("");
  const [prompt, setPrompt] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingCaption, setLoadingCaption] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [resolution, setResolution] = useState("720p");
  const [ratio, setRatio] = useState("16:9");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const { user } = useSelector((state: IRootState) => state.auth);
  const { data: accountDetailData } = useGetAccountQuery(user.id || "0", {
    skip: !user.id,
  });
  const [showModal, setShowModal] = useState(false);
  const [createCase, { isLoading: creatingCase }] = useCreateCaseMutation();
  const [score, setScore] = useState<number | null>(null);
  const [scoreLabel, setScoreLabel] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);


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
        message.success("Photo uploaded successfully!");
      } else {
        message.error("Error uploading image to imgbb.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      message.error("Error uploading image.");
    }
  };

  const fetchOpportunityScore = async (captionText: string) => {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: contentFetchOpportunityScore,
            },
            {
              role: "user",
              content: `${captionText}\n\nChấm theo thang 100 điểm. Chỉ trả lời bằng một con số.`,
            },
          ],
        }),
      });

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content || "";

      // Tách dữ liệu từ phản hồi
      const scoreMatch = content.match(/Điểm:\s*(\d+)/i);
      const ratingMatch = content.match(/Đánh giá:\s*(Kém|Khá|Tốt)/i);
      const suggestionMatch = content.match(/Gợi ý:\s*([\s\S]*)/i);

      const scoreValue = scoreMatch ? parseInt(scoreMatch[1]) : null;
      const rating = ratingMatch ? ratingMatch[1] : null;
      const suggestion = suggestionMatch ? suggestionMatch[1].trim() : null;

      // ✅ Cập nhật UI nếu dùng trong React
      if (scoreValue !== null && !isNaN(scoreValue)) {
        setScore(scoreValue);         // ví dụ: 84
      } else {
        setScore(null);
      }

      setScoreLabel(rating || null);  // ví dụ: "Tốt"
      setSuggestion(suggestion || null); // ví dụ: "Nên thêm icon mở đầu..."
    } catch (error) {
      console.error("❌ Error fetching score:", error);
      setScore(null);
    }
  };

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCaption(value);

    if (value.length > 10) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchOpportunityScore(value);
      }, 800);
    } else {
      setScore(null);
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
          max_tokens: 1000,
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
      message.warning(t("image.enter_prompt")); // "Please enter a prompt."
      return;
    }

    setLoadingImage(true);
    setImgError(false);

    try {
      const translatedPrompt = await translatePromptToEnglish(prompt);
      if (!translatedPrompt) {
        message.error(t("image.generate_error"));
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
        const body = { urlVideo: data.imageUrl, caption: `Generate Image : ${prompt}` };
        await createCase(body).unwrap();
      } else {
        message.error(t("image.generate_error"));
      }
    } catch (err) {
      console.error("Image error:", err);
      message.error(t("image.generate_error"));
    } finally {
      setLoadingImage(false);
    }
  };

  const generateCaption = async () => {
    if (!description) {
      message.warning("Please enter a description first.");
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
              role: "system",
              content: contentGenerateCaption,
            },
            {
              role: "user",
              content: `Mô tả hình ảnh sản phẩm: "${description}". Hãy viết một caption quảng cáo theo đúng 10 tiêu chí trên.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      const data = await response.json();
      setCaption(data?.choices?.[0]?.message?.content?.trim().replace(/^"|"$/g, '') || "");
      const body = { urlVideo: imageUrl, caption: `Generate caption : ${data?.choices?.[0]?.message?.content?.trim().replace(/^"|"$/g, '') || ""}` };
      await createCase(body).unwrap();
    } catch (error) {
      console.error("Caption error:", error);
      message.error("Caption generation error. Your budget may be out. Please contact Admin.");
    } finally {
      setLoadingCaption(false);
    }
  };


  const handlePostFacebook = async () => {
    if (!imageUrl) {
      message.warning("Please create a video or photo before posting.");
      return;
    }

    if (!caption) {
      message.warning("Please enter caption.");
      return;
    }

    try {
      const payload = {
        type: "photo",
        media_url: imageUrl,
        caption: caption,
      };
      if (accountDetailData?.extension) {
        await fetch(accountDetailData?.extension, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        message.success("Posted to Facebook (via Make.com) successfully!");
      } else {
        message.error("Not configured to post to Facebook.");
      }
    } catch (err) {
      console.error("❌Error when submitting to Make:", err);
      message.error("Error posting to Facebook.");
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
              placeholder={t("image.describe_prompt")} // "Describe your image"
              rows={5}
              style={{ marginBottom: 16, fontSize: 16 }}
            />
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
              <select
                style={{ width: 110, padding: "4px 6px", fontSize: 13 }}
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              >
                <option value="" disabled>Resolution</option>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
              </select>
              <select
                style={{ width: 110, padding: "4px 6px", fontSize: 13 }}
                value={ratio}
                onChange={(e) => setRatio(e.target.value)}
              >
                <option value="" disabled>Size</option>
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
                <option value="1:1">1:1</option>
                <option value="4:3">4:3</option>
                <option value="3:4">3:4</option>
                <option value="21:9">21:9</option>
              </select>
            </div>

            <br />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 8,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              <Button
                type="primary"
                size="middle" // 👈 nhỏ hơn "large"
                onClick={() => document.getElementById("upload-image")?.click()}
                style={{
                  backgroundColor: "#D2E3FC",
                  color: "#000",
                  border: "1px solid #D2E3FC",
                  borderRadius: 6,
                  minWidth: 120, // 👈 giảm chiều rộng
                  padding: "4px 12px", // 👈 giảm padding
                  fontSize: 13, // 👈 thu nhỏ chữ
                }}
              >
                {t("image.upload_image")}
              </Button>

              <input
                id="upload-image"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />

              <Button
                type="primary"
                size="middle"
                onClick={generateImage}
                loading={loadingImage}
                style={{
                  backgroundColor: "#D2E3FC",
                  color: "#000",
                  border: "1px solid #D2E3FC",
                  borderRadius: 6,
                  minWidth: 120,
                  padding: "4px 12px",
                  fontSize: 13,
                }}
              >
                {t("image.generate_image")}
              </Button>
            </div>


            <div style={{ textAlign: "center", marginBottom: 16 }}>
              {uploadedImage && (
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    objectFit: "contain",
                    opacity: 1,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                  }}
                />
              )}
            </div>


          </div>

          <div style={{ flex: 1, minWidth: 320, maxWidth: 600 }}>
            {/* Modal hiển thị khi click */}
            <AutoPostModal visible={showModal} onClose={() => setShowModal(false)} />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end", // ✅ đẩy nút sang phải
                padding: "6px 0",           // ✅ khoảng trống trên dưới (có thể tăng/giảm)
              }}
            >
              <button
                onClick={() => setShowModal(true)}
                style={{
                  backgroundColor: "#D2E3FC",
                  color: "#000",
                  border: "1px solid #D2E3FC",
                  borderRadius: 6,
                  padding: "6px 12px",       // ✅ padding cho nút đẹp hơn
                  fontSize: 11,
                  cursor: "pointer",
                  marginRight: 16,           // ✅ nếu cần cách xa mép phải
                }}
              >
                {t("image.auto_post_setting")}
              </button>
            </div>

            <div style={{ background: "#f0f0f0", height: 350, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, marginBottom: 16, overflow: "hidden" }}>
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
            <div style={{ marginBottom: 16 }}>
              <TextArea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("video.enter_description")}
                style={{
                  width: "100%",
                  fontSize: 15,
                  borderRadius: 8,
                  padding: 10,
                  backgroundColor: "#ffffff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <Button
                  loading={loadingCaption}
                  style={{
                    backgroundColor: "#D2E3FC",
                    color: "#000",
                    borderRadius: 8,
                    whiteSpace: "nowrap",
                  }}
                  onClick={generateCaption}
                >
                  {t("image.generate_caption")}
                </Button>
              </div>
            </div>
            <TextArea
              rows={4}
              value={caption}
              onChange={handleCaptionChange}
              placeholder={t("image.caption_placeholder")} // "Caption"
              style={{ fontSize: 15, marginBottom: 16 }}
            />


            {/* Chỉ hiển thị nếu có điểm */}
            {score !== null && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: "#fff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  marginBottom: 24,
                  maxWidth: 500,
                }}
              >
                <div style={{ marginRight: 24 }}>
                  <Progress
                    type="circle"
                    percent={score}
                    width={80}
                    strokeColor={
                      score >= 80 ? "#52c41a" : score >= 50 ? "#faad14" : "#f5222d"
                    }
                    format={() => (
                      <div style={{ fontSize: 16, color: "#000" }}>
                        <div style={{ fontWeight: 500 }}>{score}</div>
                        <div style={{ fontSize: 12, color: "#999" }}>points</div>
                      </div>
                    )}
                  />
                </div>

                <div>
                  <Title level={5} style={{ margin: 0 }}>
                    {scoreLabel} <span style={{ color: '#999' }}>ℹ️</span>
                  </Title>
                  <Text type="secondary">
                    {suggestion}
                  </Text>
                </div>
              </div>
            )}

            <Button onClick={handlePostFacebook} type="primary" style={{ backgroundColor: "#D2E3FC", color: "#000", border: "1px solid #D2E3FC", borderRadius: 6 }} block size="large">
              {t("image.post_facebook")}
            </Button>
          </div>
        </div>
      </Content>
      <FullscreenLoader spinning={loadingImage || loadingCaption || creatingCase} />
    </Layout>
  );
};

export default FullscreenSplitCard;
