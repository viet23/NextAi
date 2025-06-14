import React, { useState } from "react";
import { Layout, Input, Button, message, Checkbox, Select, Row, Col } from "antd";
import { useCreateCaseMutation } from "src/store/api/ticketApi";
import { UploadOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

const durationSceneMap: any = {
  5: 1,
  10: 1,
  30: 3,
  60: 6,
};

const VideoGenerator = () => {
  const [caption, setCaption] = useState("");
  const [promptTexts, setPromptTexts] = useState([""]);
  const [videoSrc, setVideoSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [createCase, { isLoading: creatingCase }] = useCreateCaseMutation();
  const [loadingCaption, setLoadingCaption] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls]: any = useState([]);
  const [generatedVideos, setGeneratedVideos] = useState<{ index: number; url: string; selected: boolean }[]>([]);
  const [videoDuration, setVideoDuration] = useState(5);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(null);

  const handlePostFacebook = async () => {
    if (!videoSrc || !caption) {
      message.warning("Vui lòng tạo video và caption trước khi đăng.");
      return;
    }

    try {
      const body = { urlVideo: videoSrc, caption };
      await createCase(body).unwrap();
      message.success("Đăng lên Facebook (mock) và lưu thành công!");
    } catch (err) {
      console.error("Error creating case:", err);
      message.error("Lỗi khi lưu dữ liệu");
    }
  };

  const generateAllScenesVideos = async () => {
    setLoading(true);
    for (let index = 0; index < activeScenes; index++) {
      await generateSingleSceneVideo(index);
    }
    setLoading(false);
  };

  const mergeSelectedVideos = async () => {
    const selectedUrls = generatedVideos.filter((v) => v.selected).map((v) => v.url);
    if (selectedUrls.length < 2) return message.warning("Chọn ít nhất 2 video để ghép.");

    message.loading("Đang gửi yêu cầu ghép video...");
    try {
      const res = await fetch(`${process.env.REACT_APP_URL}:4001/merge-videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videos: selectedUrls }),
      });

      const initData = await res.json();

      if (!initData.renderId) {
        message.error("Gửi render thất bại");
        return;
      }

      const renderId = initData.renderId;

      // Kiểm tra trạng thái render liên tục (polling)
      const maxAttempts = 20;
      let attempts = 0;
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      let mergedUrl = "";
      while (attempts < maxAttempts) {
        const statusRes = await fetch(`${process.env.REACT_APP_URL}:4001/render-status/${renderId}`);
        const statusData = await statusRes.json();

        if (statusData?.response?.status === "done") {
          mergedUrl = statusData.response.url;
          break;
        }

        if (statusData?.response?.status === "failed") {
          message.error("Render thất bại");
          return;
        }

        attempts++;
        await delay(3000);
      }

      if (mergedUrl) {
        setVideoSrc(mergedUrl);
        message.success("Đã ghép xong video!");
      } else {
        message.warning("Render mất quá nhiều thời gian, vui lòng thử lại sau");
      }
    } catch (err) {
      console.error(err);
      message.error("Lỗi server khi ghép video");
    }
  };


  const handleImageUpload = async (index: any, file: any) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        "https://api.imgbb.com/1/upload?key=8c9e574f76ebba8ad136a2715581c81c&expiration=86400",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (data?.data?.url) {
        const newUrls: any = [...uploadedImageUrls];
        newUrls[index] = data.data.url;
        setUploadedImageUrls(newUrls);
        message.success("Upload ảnh thành công");
      } else {
        message.error("Upload ảnh thất bại");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Lỗi khi upload ảnh");
    }
  };

  const generateSingleSceneVideo = async (index: any) => {
    if (!promptTexts[index] || !uploadedImageUrls[index]) {
      message.warning(`Vui lòng nhập mô tả và ảnh cho Scene ${index + 1}`);
      return;
    }

    let time = 5
    // if (videoDuration > 5) {
    //   time = 10
    // }

    try {
      const res = await fetch(`${process.env.REACT_APP_URL}:4001/generate-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: promptTexts[index],
          promptImage: uploadedImageUrls[index],
          ratio: "16:9",
          duration: time,
        }),
      });

      const data = await res.json();
      if (data?.videoUrl) {
        setGeneratedVideos((prev) => {
          const updated: any = [...prev.filter((v: any) => v.index !== index)];
          updated.push({ index, url: data.videoUrl, selected: false });
          return updated;
        });
        message.success(`Đã tạo lại video cho Scene ${index + 1}`);
      }
    } catch (error) {
      console.error("Generate video error:", error);
      message.error(`Lỗi khi tạo video cho Scene ${index + 1}`);
    }
  };

  const generateCaption = async () => {
    const combinedPrompt = promptTexts.filter(Boolean).join(". ");

    if (!combinedPrompt) {
      message.warning("Vui lòng nhập mô tả cho ít nhất một scene");
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
          messages: [{
            role: "user",
            content: `Viết một caption sáng tạo bằng tiếng Việt cho video có nội dung mô tả sau:\n"${combinedPrompt}"`
          }],
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


  const handleCheckboxChange = (index: any) => {
    setGeneratedVideos((prev: any) =>
      prev.map((item: any) =>
        item.index === index ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const activeScenes = durationSceneMap[videoDuration] || 1;

  return (
    <Layout style={{ minHeight: "100vh", background: "#fff" }}>
      <Content style={{ padding: 24 }}>
        <Row gutter={[24, 24]} justify="center" wrap>
          {/* Cột trái: nhập mô tả và upload */}
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500 }}>Video duration:</label>
              <Select
                value={videoDuration}
                onChange={(value) => {
                  setVideoDuration(value);
                  setPromptTexts(Array(durationSceneMap[value]).fill(""));
                  setUploadedImageUrls(Array(durationSceneMap[value]).fill(""));
                  setGeneratedVideos([]);
                }}
                style={{ width: "100%", marginTop: 4 }}
              >
                <Option value={5}>5 seconds</Option>
                <Option value={10}>10 seconds</Option>
                <Option value={30}>30 seconds</Option>
                <Option value={60}>60 seconds</Option>
              </Select>
            </div>

            {Array.from({ length: activeScenes }).map((_, index) => (
              <div key={index} style={{ marginBottom: 24 }}>
                <TextArea
                  rows={2}
                  placeholder={`Scene ${index + 1} description`}
                  value={promptTexts[index] || ""}
                  onChange={(e) => {
                    const newPrompts = [...promptTexts];
                    newPrompts[index] = e.target.value;
                    setPromptTexts(newPrompts);
                  }}
                  style={{ marginBottom: 8 }}
                />

                <Row gutter={[8, 8]} justify="center" wrap style={{ marginBottom: 8 }}>
                  <Col xs={24} sm={10}>
                    <Button
                      type="dashed"
                      block
                      size="small"
                      icon={<UploadOutlined />}
                      onClick={() => document.getElementById(`upload-${index}`)?.click()}
                    >
                      Upload Image
                    </Button>
                    <input
                      id={`upload-${index}`}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageUpload(index, e.target.files[0]);
                        }
                      }}
                    />
                  </Col>

                  <Col xs={24} sm={10}>
                    <Button
                      type="primary"
                      block
                      size="small"
                      onClick={() => generateSingleSceneVideo(index)}
                      style={{ backgroundColor: "#D2E3FC", color: "#000" }}
                    >
                      Generate Scene {index + 1}
                    </Button>
                  </Col>
                </Row>


                <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                  <Col span={12} style={{ textAlign: "center" }}>
                    {uploadedImageUrls[index] && (
                      <img
                        src={uploadedImageUrls[index]}
                        alt={`Scene ${index + 1}`}
                        style={{
                          width: 150,
                          height: 90,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: "1px solid #ccc",
                        }}
                      />
                    )}
                  </Col>

                  <Col span={12} style={{ textAlign: "center", position: "relative" }}>
                    {generatedVideos.find((v) => v.index === index) && (
                      <>
                        <video
                          src={generatedVideos.find((v) => v.index === index)?.url}
                          style={{
                            width: 150,
                            height: 90,
                            objectFit: "cover",
                            borderRadius: 6,
                            border: "1px solid #ccc",
                          }}
                          controls
                          muted
                        />
                        <Checkbox
                          checked={
                            generatedVideos.find((v) => v.index === index)?.selected
                          }
                          onChange={() => handleCheckboxChange(index)}
                          style={{
                            position: "absolute",
                            top: 4,
                            right: 12,
                            background: "white",
                            padding: 2,
                            borderRadius: 4,
                            zIndex: 2,
                          }}
                        />
                      </>
                    )}
                  </Col>
                </Row>

              </div>
            ))}

            <Row gutter={[12, 12]} justify="center">
              <Col>
                <Button
                  type="primary"
                  loading={loading}
                  style={{ backgroundColor: "#D2E3FC", color: "#000" }}
                  onClick={generateAllScenesVideos}
                >
                  Generate All
                </Button>
              </Col>
              <Col>
                <Button type="primary" style={{ backgroundColor: "#D2E3FC", color: "#000" }} onClick={mergeSelectedVideos}>
                  Merge Selected
                </Button>
              </Col>
              <Col>
                <Button loading={loadingCaption} style={{ backgroundColor: "#D2E3FC", color: "#000" }} onClick={generateCaption}>
                  Generate Caption
                </Button>
              </Col>
            </Row>
          </Col>

          {/* Cột phải: kết quả và caption */}
          <Col xs={24} md={12}>
            <div
              style={{
                background: "#f0f0f0",
                height: "40vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                marginBottom: 16,
              }}
            >
              {videoSrc ? (
                <video
                  key={videoSrc}
                  controls
                  style={{ width: "100%", borderRadius: 12 }}
                >
                  <source src={videoSrc} type="video/mp4" />
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

            <Button
              type="primary"
              block
              size="large"
              onClick={handlePostFacebook}
              loading={creatingCase}
            >
              Post Facebook
            </Button>
          </Col>
        </Row>
      </Content>
    </Layout>
  );

};

export default VideoGenerator;




