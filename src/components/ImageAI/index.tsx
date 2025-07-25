import React, { useEffect, useRef, useState } from "react";
import { Layout, Input, Button, message, Progress, Typography, Modal, RadioChangeEvent, Row, Image, Col, Card, Radio, Table, Tooltip, Empty, Flex, Pagination, Drawer } from "antd";
import { useSelector } from "react-redux";
import "./styles.scss";
import { ReactComponent as RefetchIcon } from "src/assets/images/icon/ic-refetch.svg";
import { IRootState } from "src/interfaces/app.interface";
import { useGetAccountQuery } from "src/store/api/accountApi";
import { useCreateCaseMutation, useGetCasesQuery } from "src/store/api/ticketApi";
import AutoPostModal from "../AutoPostModal";
import FullscreenLoader from "../FullscreenLoader";
import { contentFetchOpportunityScore, contentGenerateCaption } from "src/utils/facebook-utild";
import { useTranslation } from "react-i18next";
import { CloseCircleOutlined, DownloadOutlined, EyeOutlined, UploadOutlined } from "@ant-design/icons";
import DetailTicket from "../DetailTicket";
const { Title, Text } = Typography;

const { Content } = Layout;
const { TextArea } = Input;

const FullscreenSplitCard = () => {
  const { t } = useTranslation();
  const [caption, setCaption] = useState("");
  const [taskId, setTaskId] = useState("");
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
  const { user } = useSelector((state: IRootState) => state.auth || { user: undefined });
  const { data: accountDetailData } = useGetAccountQuery(user?.id || "0", {
    skip: !user?.id,
  });
  const [showModal, setShowModal] = useState(false);
  const [createCase, { isLoading: creatingCase }] = useCreateCaseMutation();
  const [score, setScore] = useState<number | null>(null);
  const [scoreLabel, setScoreLabel] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [showDetailInputs, setShowDetailInputs] = useState(false);


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
      const res = await fetch(
        "https://api.imgbb.com/1/upload?key=8c9e574f76ebba8ad136a2715581c81c&expiration=1800",
        {
          method: "POST",
          body: formData,
        }
      );
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
        setScore(scoreValue); // ví dụ: 84
      } else {
        setScore(null);
      }

      setScoreLabel(rating || null); // ví dụ: "Tốt"
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

    const parts = [prompt];

    if (subInputs.name) {
      parts.push(`Tên sản phẩm/dịch vụ: ${subInputs.name}`);
    }
    if (subInputs.desc) {
      parts.push(`Mô tả sản phẩm/dịch vụ: ${subInputs.desc}`);
    }
    if (subInputs.effect) {
      parts.push(`Hiệu ứng: ${subInputs.effect}`);
    }
    if (subInputs.object) {
      parts.push(`Vật thể xung quanh: ${subInputs.object}`);
    }

    // Ghép nội dung mô tả đầy đủ, xuống dòng giữa các phần
    const moTaDayDu = parts.join("\n");

    console.log(`========moTaDayDu=====`, moTaDayDu);




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
        const body = { urlVideo: data.imageUrl, caption: `Generate Image : ${prompt}`,taskId: data?.taskId  ,action: "generate_image" };
        setTaskId(data?.taskId || "");
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
      setCaption(data?.choices?.[0]?.message?.content?.trim().replace(/^"|"$/g, "") || "");
      const body = {
        urlVideo: imageUrl,
        caption: `Generate caption : ${data?.choices?.[0]?.message?.content?.trim().replace(/^"|"$/g, "") || ""}`,
        taskId: taskId || "",
        action: "generate_image_caption", 
      };
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


  const [subInputs, setSubInputs] = useState({
    name: "",
    desc: "",
    effect: "",
    object: ""
  });

  const handleInputChange = (key: "name" | "desc" | "effect" | "object", value: string) => {
    setSubInputs(prev => ({ ...prev, [key]: value }));
  };

  const [detailId, setDetailId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSuspect, setIsSuspect] = useState(false);
  const [filter, setFilter] = useState<any>({ page: 1, pageSize: 3 });

  const { data, refetch } = useGetCasesQuery(filter);
  const onChangePagination = (pageNumber: number, pageSize: number) => {
    setFilter((prev: any) => ({ ...prev, page: pageNumber, pageSize }));
  };

  const handleReset = () => refetch();

  const handleOnChangeRadio = (e: RadioChangeEvent) => {
    if (e.target.value === "all") {
      setIsSuspect(false);
      setFilter({ page: 1, pageSize: 20 });
    } else {
      setIsSuspect(true);
      setFilter((prev: any) => {
        const where = prev?.where ? { ...prev.where, isSuspect: 1 } : { isSuspect: 1 };
        return { ...prev, page: 1, pageSize: 20, where };
      });
    }
  };

  const handleOnClickDetail = (record: any) => {
    console.log(`record`, record);

    setDetailId(record?.id);
    setIsOpen(true);
  };

  const handleOnCloseDrawer = () => {
    setDetailId(null);
    setIsOpen(false);
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <Layout className="image-layout">
      <Content style={{ padding: 24 }}>
        <h3 style={{ textAlign: "center", color: "#fff", marginBottom: 12 }}>
          {t("image.title")}
        </h3>
        <p style={{ textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
          {t("image.subtitle")} {/* subtitle :Tạo hình ảnh và nội dung độc đáo chỉ trong vài giây. */}
        </p>

        <div className="image-page">
          {/* Cột trái */}
          <div className="image-column">
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
                <h4 style={{ marginBottom: 4, color: "#fff", fontWeight: 600 }}>
                  {t("image.main_idea_title")}
                </h4>
              </div>
              {/* {t("image.warning_required")} */}

              {/* <div className="image-warning" > {t("image.main_describe_title")}</div> */}
              <br />

              {/* Bọc TextArea và ảnh vào 1 div tương đối */}
              <div className="prompt-container">
                <div className="textarea-wrapper">
                  <TextArea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t("image.describe_prompt")}
                    rows={10}
                    className="image-textarea image-prompt-textarea"
                  />

                  {/* Ảnh hoặc nút tải ảnh nằm bên trong vùng TextArea */}
                  {!uploadedImage ? (
                    <label htmlFor="upload-image" className="image-upload-inside">
                      <UploadOutlined className="image-upload-icon" />
                      <span>{t("image.upload_image")}</span>
                      <input
                        id="upload-image"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                      />
                    </label>
                  ) : (
                    <div className="image-preview-inside">
                      <img src={uploadedImage} alt="Uploaded" />
                      <CloseCircleOutlined
                        className="image-remove-icon"
                        onClick={() => setUploadedImage("")}
                        title={t("image.remove_image")}
                      />
                    </div>

                  )}
                </div>
              </div>

            </div>

            <div className="image-options-bar">
              {/* Nút toggle mô tả chi tiết */}

              <button
                className={`detail-toggle-btn ${showDetailInputs ? "active" : ""}`}
                onClick={() => setShowDetailInputs(prev => !prev)}
              >
                {t("image.generate_detail_prompt")}
              </button>

              {/* Dropdown: Ratio */}
              <select className="image-dropdown" value={ratio} onChange={(e) => setRatio(e.target.value)}>
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
                <option value="1:1">1:1</option>
              </select>

              {/* Dropdown: Resolution */}
              <select className="image-dropdown" value={resolution} onChange={(e) => setResolution(e.target.value)}>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
              </select>
            </div>

            {/* Các ô nhập chi tiết – hiển thị khi toggle bật */}
            {showDetailInputs && (
              <div className="image-subinputs bordered">
                <div className="input-group">
                  <label>{t("image.label_name")}</label>
                  <input
                    className="image-input"
                    placeholder={t("image.placeholder_name")}
                    value={subInputs.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>{t("image.label_desc")}</label>
                  <input
                    className="image-input"
                    placeholder={t("image.placeholder_desc")}
                    value={subInputs.desc}
                    onChange={(e) => handleInputChange("desc", e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>{t("image.label_effect")}</label>
                  <input
                    className="image-input"
                    placeholder={t("image.placeholder_effect")}
                    value={subInputs.effect}
                    onChange={(e) => handleInputChange("effect", e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>{t("image.label_object")}</label>
                  <input
                    className="image-input"
                    placeholder={t("image.placeholder_object")}
                    value={subInputs.object}
                    onChange={(e) => handleInputChange("object", e.target.value)}
                  />
                </div>
              </div>
            )}
            {/* Nút upload và tạo ảnh */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
              <Button
                type="primary"
                size="middle"
                onClick={generateImage}
                loading={loadingImage}
                className="image-button image-button-large"
              >
                {t("image.generate_image")}
              </Button>
            </div>
          </div>


          {/* Cột phải */}
          <div className="image-column">
            <AutoPostModal visible={showModal} onClose={() => setShowModal(false)} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
              <h4 style={{ marginBottom: 4, color: "#fff", fontWeight: 600 }}>
                {t("image.main_result")}
              </h4>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  fontSize: 16,
                  fontWeight: 600,
                  padding: "4px 12px",       // padding nhỏ vừa phải
                  border: "1px solid #3b82f6",
                  borderRadius: 8,
                  boxShadow: "0 0 8px rgba(59,130,246,0.6)",
                  whiteSpace: "nowrap",      // không cho xuống dòng
                }}
              >
                {t("image.auto_post_setting")}
              </button>
            </div>


            <div className="image-generated-block">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt="Generated"
                    className="image-generated-img"
                    onError={() => setImgError(true)}
                  />
                  {!imgError && (
                    <DownloadOutlined
                      onClick={() => {
                        if (!imageUrl) {
                          message.error("Không tìm thấy ảnh để tải");
                          return;
                        }

                        Modal.confirm({
                          title: "Tải ảnh?",
                          content: "Bạn có chắc muốn tải ảnh này xuống thiết bị của mình?",
                          okText: "Tải xuống",
                          cancelText: "Hủy",
                          onOk: async () => {
                            try {
                              const response = await fetch(imageUrl);
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = "generated-image.jpg";
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              window.URL.revokeObjectURL(url);
                              message.success("Đã bắt đầu tải ảnh");
                            } catch (err) {
                              console.error("Tải ảnh thất bại:", err);
                              message.error("Tải ảnh thất bại");
                            }
                          },
                        });
                      }}
                      className="image-download-icon"
                      title="Tải ảnh"
                    />
                  )}
                </>
              ) : (
                <span style={{ color: "#aaa" }}>No Image</span>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <TextArea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t("image.enter_description")}
                className="image-textarea image-description-textarea"
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <Button
                  loading={loadingCaption}
                  onClick={generateCaption}
                  className="image-button image-button-large"
                >
                  {t("image.generate_caption")}
                </Button>
              </div>
            </div>

            <TextArea
              rows={8}
              value={caption}
              onChange={handleCaptionChange}
              placeholder={t("image.caption_placeholder")}
              className="image-textarea image-caption-textarea"
            />

            {score !== null && (
              <div
                className="image-score-container"
              >
                <div className="image-score-right">
                  <Progress
                    type="circle"
                    percent={score}
                    width={80}
                    strokeColor={score >= 80 ? "#00ff99" : score >= 50 ? "#faad14" : "#f5222d"}
                    format={() => (
                      <div style={{ fontSize: 16, color: "#fff" }}>
                        <div style={{ fontWeight: 600 }}>{score}%</div>
                      </div>
                    )}
                  />
                </div>

                <div>
                  <Title level={5} style={{ margin: 0, color: "#fff" }}>
                    {scoreLabel}
                  </Title>
                  <Text className="image-score-subtext">{suggestion}</Text>
                </div>
              </div>
            )}

            <Button
              onClick={handlePostFacebook}
              type="primary"
              className="image-button image-button-large"
              block
              size="large"
            >
              {t("image.post_facebook")}
            </Button>
          </div>
        </div>
        <br />
        <div style={{
          maxWidth: 1222,
          margin: "0 auto",
          width: "100%",
        }}>
          <Card
            bordered={false}
            className="criclebox tablespace mb-24"
            title={t("media_ls.card_history")}
            headStyle={{ color: "#ffffff" }}
          >

            <>
              {isMobile ? (
                <div className="mobile-card-list">
                  {data?.data?.map((item: any, index: any) => {
                    const url = item.urlVideo;
                    const isVideo = /\.(mp4|webm|ogg)(\?|$)/i.test(url);

                    const handleDownload = async () => {
                      Modal.confirm({
                        title: "Tải xuống?",
                        content: "Bạn có chắc muốn tải file này xuống thiết bị của mình?",
                        okText: "Tải xuống",
                        cancelText: "Hủy",
                        onOk: async () => {
                          try {
                            const response = await fetch(url);
                            const blob = await response.blob();
                            const blobUrl = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = blobUrl;
                            a.download = isVideo ? "video.mp4" : "image.jpg";
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
                    };

                    return (
                      <div className="mobile-card" key={index}>
                        <div className="mobile-card-media">
                          <div
                            style={{
                              position: "relative",
                              width: "100%",
                              height: 200,
                              overflow: "hidden",
                              borderRadius: 6,
                            }}
                          >
                            {isVideo ? (
                              <video
                                src={url}
                                controls
                                width="100%"
                                height="100%"
                                style={{
                                  objectFit: "cover",
                                  borderRadius: 6,
                                  display: "block",
                                }}
                              />
                            ) : (
                              <img
                                src={url}
                                alt="media"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: 6,
                                  display: "block",
                                }}
                              />
                            )}

                            <DownloadOutlined
                              onClick={handleDownload}
                              style={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                fontSize: 18,
                                background: "#fff",
                                padding: 6,
                                borderRadius: "50%",
                                cursor: "pointer",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                zIndex: 2,
                              }}
                              title="Tải xuống"
                            />
                          </div>
                        </div>

                        <div className="mobile-card-content">
                          <div className="mobile-card-caption">{item.caption}</div>
                          <div className="mobile-card-footer">
                            <Button size="small" className="btn-text" onClick={() => handleOnClickDetail(item)}>
                              Xem chi tiết
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Table

                  columns={[
                    {
                      title: t("media_ls.table.no"),
                      dataIndex: "no",
                      width: 20,
                      fixed: "left",
                      key: "no",
                      render: (_text, _obj, index) => index + 1,
                    },
                    {
                      title: t("media_ls.table.media"),
                      fixed: "left",
                      dataIndex: "urlVideo",
                      key: "urlVideo",
                      width: 200,
                      render: url => {
                        if (!url) {
                          return (
                            <Image width={250} src="https://via.placeholder.com/60" alt="No media" />
                          );
                        }

                        const isVideo = /\.(mp4|webm|ogg)(\?|$)/i.test(url);

                        const handleDownload = async () => {
                          Modal.confirm({
                            title: "Tải xuống?",
                            content: "Bạn có chắc muốn tải file này xuống thiết bị của mình?",
                            okText: "Tải xuống",
                            cancelText: "Hủy",
                            onOk: async () => {
                              try {
                                const response = await fetch(url);
                                const blob = await response.blob();
                                const blobUrl = window.URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = blobUrl;
                                a.download = isVideo ? "video.mp4" : "image.jpg";
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
                        };

                        return (
                          <div
                            style={{
                              position: "relative",
                              width: 250,
                              height: 200,
                              overflow: "hidden",
                              borderRadius: 6,
                            }}
                          >
                            {/* Media */}
                            {isVideo ? (
                              <video
                                src={url}
                                width="100%"
                                height="80%"
                                controls
                                style={{
                                  objectFit: "cover",
                                  borderRadius: 6,
                                  display: "block",
                                }}
                              />
                            ) : (
                              <img
                                src={url}
                                alt="media"
                                style={{
                                  width: "100%",
                                  height: "80%",
                                  objectFit: "cover",
                                  borderRadius: 6,
                                  display: "block",
                                }}
                              />
                            )}

                            {/* Icon tải xuống */}
                            <DownloadOutlined
                              onClick={handleDownload}
                              style={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                fontSize: 18,
                                background: "#fff",
                                padding: 6,
                                borderRadius: "50%",
                                cursor: "pointer",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                zIndex: 2,
                              }}
                              title="Tải xuống"
                            />
                          </div>
                        );
                      },
                    },
                    {
                      title: t("media_ls.table.caption"),
                      fixed: "left",
                      dataIndex: "caption",
                      key: "caption",
                    },
                    {
                      title: t("media_ls.table.actions"),
                      key: "action",
                      dataIndex: "action",
                      fixed: "right",
                      width: 100,
                      render: (_, record) => (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                          }}
                        >
                          <Tooltip title={t("media_ls.table.tooltip_detail")}>
                            <EyeOutlined onClick={() => handleOnClickDetail(record)} />
                          </Tooltip>
                        </div>
                      ),
                    },
                  ]}
                  rowClassName={(record: any) => (record?.isSuspect ? "suspect-row" : "")}
                  dataSource={data?.data || []}
                  pagination={false}
                  locale={{
                    emptyText: <Empty description={t("media_ls.empty")} />,
                  }}
                  className="ant-border-space dark-header-table"
                  scroll={{ x: "max-content" }}
                />
              )}

              {/* 🎯 CSS ép màu header tiêu đề giống giao diện ảnh */}
              <style>
                {`
            .dark-header-table .ant-table-thead > tr > th {
              background-color: #1F2937 !important;
              color: #e2e8f0 !important;
              font-weight: 500;
              text-transform: uppercase;
              font-size: 13px;
            }
          `}
              </style>
            </>

            <Flex vertical style={{ paddingTop: 20, paddingBottom: 20 }}>
              <Pagination
                pageSize={filter.pageSize}
                current={filter.page}
                total={data?.total || 0}
                onChange={onChangePagination}
                showSizeChanger
                pageSizeOptions={["10", "20", "50", "100"]}
                onShowSizeChange={(current, size) => onChangePagination(current, size)}
              />
            </Flex>
          </Card>
          {/* </Col>
          </Row> */}

          <Drawer
            open={isOpen}
            onClose={handleOnCloseDrawer}
            width={"98%"}
            maskClosable={false}
            title={detailId ? t("media_ls.drawer.title_detail") : t("media_ls.drawer.title_new")}
          >
            <DetailTicket
              id={detailId}
              onRefetch={() => {
                refetch();
              }}
            />
          </Drawer>
        </div>
      </Content>
      <FullscreenLoader spinning={loadingImage || loadingCaption || creatingCase} />
    </Layout>
  );
};

export default FullscreenSplitCard;
