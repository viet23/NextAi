import React, { useEffect, useState, useRef } from "react";
import { Layout, Input, Button, message, Checkbox, Select, Row, Col, Modal, Radio, Spin, Typography } from "antd";
import { useCreateCaseMutation } from "src/store/api/ticketApi";
import { UploadOutlined } from "@ant-design/icons";
// import { Row, Col, Button, Modal, Radio, Typography, Spin, message } from 'antd';
import axios from 'axios';
import { useSelector } from "react-redux";
import { IRootState } from "src/interfaces/app.interface";
import { useGetAccountQuery } from "src/store/api/accountApi";
import AutoPostModal from "../AutoPostModal";
import FullscreenLoader from "../FullscreenLoader";
const genres = [
  "Ambient", "Piano", "Orchestra", "Lofi", "Chill", "Hiphop", "Electronic",
  "Pop", "Rock", "Jazz", "Blues", "Acoustic", "Guitar", "Drums", "Trap",
  "Classical", "Funk", "Dubstep", "House", "Trance", "Folk", "Reggae",
  "Metal", "Synth", "Vocals", "Choir", "Soundtrack", "Score"
];


const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

type MusicItem = {
  id: number;
  name: string;
  url: string;
  previews?: {
    'preview-lq-mp3': string;
  };
};

type FreesoundResponse = {
  results: MusicItem[];
};

type FreesoundDetail = {
  previews: {
    'preview-lq-mp3': string;
  };
};

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
  const { user } = useSelector((state: IRootState) => state.auth)
  const [selectedId, setSelectedId] = useState(null);
  const [loadingMusic, setLoadingMusic] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [musicList, setMusicList] = useState<MusicItem[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<MusicItem | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>('lofi');
  const { data: accountDetailData } = useGetAccountQuery(user.id || "0", {
    skip: !user.id,
  });
  const SHOTSTACK_API_KEY = "fHK6q16tBau8galfuCqHp7d1K98zOqnluqIZZQAQ";
  const [description, setDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeScenes, setActiveScenes] = useState(1);
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [scriptPrompt, setScriptPrompt] = useState("");
  const [loadingScript, setLoadingScript] = useState(false);
  const uploadRefs = useRef<(HTMLInputElement | null)[]>([]);


  const handleMergeMusic = async () => {

    if (!selectedMusic || !videoSrc) {
      message.warning("Please select music and make sure you have a video before adding music.");
      return;
    }

    try {
      // 1. Lấy URL nhạc từ Freesound
      const res = await axios.get<FreesoundDetail>(
        `https://freesound.org/apiv2/sounds/${selectedMusic.id}/`,
        {
          headers: {
            Authorization: 'Token iBAdDZZGpucb5MVWNUbeNTXiAbqux8zOu8T3skyf',
          },
        }
      );

      const audioUrl = res.data.previews['preview-lq-mp3'];
      if (!audioUrl) {
        message.error("Cannot get music link from Freesound.");
        return;
      }

      // 2. Tạo payload gửi Shotstack để render video mới
      const payload = {
        timeline: {
          soundtrack: {
            src: audioUrl,
            effect: "fadeInFadeOut",
          },
          tracks: [
            {
              clips: [
                {
                  asset: {
                    type: "video",
                    src: videoSrc,
                  },
                  start: 0,
                  length: videoDuration,
                },
              ],
            },
          ],
        },
        output: {
          format: "mp4",
          resolution: "hd",
        },
      };



      // 3. Gửi render request đến Shotstack
      const response = await axios.post("https://api.shotstack.io/v1/render", payload, {
        headers: {
          "x-api-key": SHOTSTACK_API_KEY,
          "Content-Type": "application/json",
        },
      });

      const renderId = (response.data as { response: { id: string } }).response.id;
      message.success("Music merge request sent. Processing...");

      await pollRenderStatus(renderId)

    } catch (error) {
      console.error("Error when merging music:", error);
      message.error("Music pairing failed. Your budget run out! Please contact Admin");
    }
  };

  const pollRenderStatus = async (renderId: string, maxAttempts = 15, delay = 5000) => {
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const statusRes = await axios.get(`https://api.shotstack.io/v1/render/${renderId}`, {
          headers: {
            "x-api-key": SHOTSTACK_API_KEY,
          },
        });

        const { status, url } = (statusRes.data as { response: { status: string; url?: string } }).response;

        console.log(`🎞️ Render status [${attempts + 1}]:`, status);

        if (status === "done") {
          message.success("✅Music pairing successful!");
          console.log("🎬 Video with music:", url);
          if (url) setVideoSrc(url);
          return;
        } else if (status === "failed") {
          message.error("❌ Render failed! Your budget run out! Please contact Admin");
          return;
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, delay);
          } else {
            message.warning("⚠️ Render timeout.");
          }
        }
      } catch (err) {
        console.error("❌ Error when testing render:", err);
        message.error("Error checking render status. Your budget run out! Please contact Admin");
      }
    };

    checkStatus();
  };

  const generateScriptByGPT = async () => {
    if (!scriptPrompt) {
      message.warning("Please enter your request");
      return;
    }

    setLoadingScript(true);

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
              content: `${scriptPrompt}

Trả về kết quả dưới dạng JSON mảng các chuỗi, mỗi chuỗi là một cảnh. Mỗi cảnh mô tả chi tiết bằng 2–4 câu. Và đúng số lượng cảnh theo yêu cầu, không được thêm hoặc bớt cảnh.

Ví dụ:
[
  "Cảnh 1: ...",
  "Cảnh 2: ...",
  "Cảnh 3: ..."
]`
            },
          ],
          temperature: 0.8,
          max_tokens: 1000,
        }),
      });

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        message.error("Không nhận được phản hồi từ GPT.");
        return;
      }

      let scenes: string[] = [];
      try {
        scenes = JSON.parse(content);
      } catch (err) {
        console.error("Lỗi parse JSON:", err);
        message.error("Không đọc được định dạng kịch bản từ GPT. Vui lòng thử lại.");
        return;
      }

      if (scenes.length === 0) {
        message.warning("GPT không tạo được nội dung cảnh.");
        return;
      }

      // Gán nội dung cảnh và reset trạng thái liên quan
      setPromptTexts(scenes);
      setUploadedImageUrls(Array(scenes.length).fill(""));
      setGeneratedVideos([]);
      setActiveScenes(scenes.length);

      // Đồng bộ videoDuration tương ứng
      const reverseSceneMap: Record<number, number> = {
        1: 5,
        3: 30,
        6: 60,
      };
      const matchedDuration = reverseSceneMap[scenes.length];
      if (matchedDuration) {
        setVideoDuration(matchedDuration);
      } else {
        message.warning("Số lượng cảnh không khớp với thời lượng video được hỗ trợ. Hãy yêu cầu GPT trả về đúng 1, 3 hoặc 6 cảnh.");
        return;
      }

      setScriptModalOpen(false);
      message.success(`✅ Đã tạo ${scenes.length} cảnh thành công!`);
    } catch (error) {
      console.error("Lỗi gọi GPT:", error);
      message.error("Có lỗi khi tạo kịch bản.");
    } finally {
      setLoadingScript(false);
    }
  };


  const fetchMusic = async (genre: string) => {
    setLoadingMusic(true);
    try {
      const res = await axios.get<FreesoundResponse>(
        `https://freesound.org/apiv2/search/text/?query=${genre}&filter=duration%3A[60%20TO%20*]`,
        {
          headers: {
            Authorization: 'Token iBAdDZZGpucb5MVWNUbeNTXiAbqux8zOu8T3skyf',
          },
        }
      );
      setMusicList(res.data.results.slice(0, 5));
    } catch (err) {
      message.error('Playlist loading error. Your budget run out! Please contact Admin');
    }
    setLoadingMusic(false);
  };


  const playPreview = async (id: number) => {
    if (playingId === id) {
      // Nếu đang phát bài đó → thì dừng lại
      if (audio) audio.pause();
      setAudio(null);
      setPlayingId(null);
      return;
    }

    try {
      const res = await axios.get<FreesoundDetail>(`https://freesound.org/apiv2/sounds/${id}/`, {
        headers: {
          Authorization: 'Token iBAdDZZGpucb5MVWNUbeNTXiAbqux8zOu8T3skyf',
        },
      });
      const url = res.data.previews['preview-lq-mp3'];

      if (audio) audio.pause(); // Dừng nhạc cũ
      const newAudio = new Audio(url);
      newAudio.play();

      setAudio(newAudio);
      setPlayingId(id);
    } catch (err) {
      message.error('Cannot play music . Your budget run out! Please contact Admin');
    }
  };

  const openMusicModal = () => {
    setModalOpen(true);
    if (musicList.length === 0) {
      fetchMusic(selectedGenre);
    }
  };

  const closeModal = () => {
    if (audio) audio.pause();
    setAudio(null);
    setPlayingId(null);
    setModalOpen(false);
  };

  const confirmSelect = () => {
    const track = musicList.find((t) => t.id === selectedId);
    if (!track) {
      message.warning('Please select a song');
      return;
    }
    if (audio) audio.pause();
    console.log('track', track);

    setSelectedMusic(track);
    setAudio(null);
    setPlayingId(null);
    setModalOpen(false);
    message.success(`Selected: ${track.name}`);
  };


  const handlePostFacebook = async () => {
    if (!videoSrc) {
      message.warning("Please create a video or photo before posting.");
      return;
    }

    if (!caption) {
      message.warning("Please enter caption.");
      return;
    }

    try {
      const payload = {
        type: "video",
        media_url: videoSrc,
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
        const body = { urlVideo: videoSrc, caption };
        await createCase(body).unwrap();

        message.success("Posted to Facebook (via Make.com) successfully!");
      } else {
        message.error("Not configured to post to Facebook.");
      }


    } catch (err) {
      console.error("❌ Error when submitting to Make:", err);
      message.error("Error posting to Facebook.");
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
    if (selectedUrls.length < 2) return message.warning("Select at least 2 videos to merge.");

    message.loading("Sending video merge request...");
    try {
      const res = await fetch(`${process.env.REACT_APP_URL}/merge-videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videos: selectedUrls }),
      });

      const initData = await res.json();

      if (!initData.renderId) {
        message.error("Send render failed , Your budget run out! Please contact Admin");
        return;
      }

      const renderId = initData.renderId;

      // Kiểm tra trạng thái render liên tục (polling)
      const maxAttempts = 20;
      let attempts = 0;
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      let mergedUrl = "";
      while (attempts < maxAttempts) {
        const statusRes = await fetch(`${process.env.REACT_APP_URL}/render-status/${renderId}`);
        const statusData = await statusRes.json();

        if (statusData?.response?.status === "done") {
          mergedUrl = statusData.response.url;
          break;
        }

        if (statusData?.response?.status === "failed") {
          message.error("Render thất bại , Your budget run out! Please contact Admin");
          return;
        }

        attempts++;
        await delay(3000);
      }

      if (mergedUrl) {
        setVideoSrc(mergedUrl);
        message.success("Video merging done!");
      } else {
        message.warning("Rendering took too long, please try again later");
      }
    } catch (err) {
      console.error(err);
      message.error("Server error when merging video , Your budget run out! Please contact Admin");
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
        message.success("Upload photo successfully");
      } else {
        message.error("Image upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Error when uploading photos");
    }
  };

  const generateSingleSceneVideo = async (index: any) => {
    if (!promptTexts[index] || !uploadedImageUrls[index]) {
      message.warning(`Please enter a description and photo for the Scene ${index + 1}`);
      return;
    }

    let time = 5
    if (videoDuration > 5) {
      time = 10
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_URL}/generate-video`, {
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
        if (videoDuration <= 10) {
          setVideoSrc(data?.videoUrl);
        }
        setGeneratedVideos((prev) => {
          const updated: any = [...prev.filter((v: any) => v.index !== index)];
          updated.push({ index, url: data.videoUrl, selected: false });
          return updated;
        });
        message.success(`Recreated video for Scene ${index + 1}`);
      }
    } catch (error) {
      console.error("Generate video error:", error);
      message.error(`Error creating video for Scene ${index + 1} Your budget run out!
Please contact Admin`);
    }
  };

  const generateCaption = async () => {
    if (!description) {
      message.warning("Please enter a description for at least one scene");
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
            content: `Viết một caption sáng tạo bằng tiếng Việt cho video có nội dung mô tả sau:\n"${description}"`
          }],
          temperature: 0.8,
          max_tokens: 1000,
        }),
      });

      const data = await response.json();
      if (data?.choices?.[0]?.message?.content) {
        setCaption(data.choices[0].message.content.trim().replace(/^"|"$/g, ''));
      } else {
        message.error("Unable to create caption");
      }
    } catch (err) {
      console.error("Caption error:", err);
      message.error("Error creating caption");
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

  useEffect(() => {
    setActiveScenes(durationSceneMap[videoDuration]);
  }, [videoDuration]);

  return (
    <><FullscreenLoader spinning={loading || loadingCaption || loadingScript || creatingCase || loadingMusic} /><Layout style={{ minHeight: "100vh", background: "#fff" }}>
      <Content style={{ padding: 24 }}>
        <Row gutter={[24, 24]} justify="center" wrap>
          {/* Cột trái: nhập mô tả và upload */}
          <Col xs={24} md={12}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <label style={{ fontWeight: 500, whiteSpace: "nowrap" }}>Video duration:</label>
              <Select
                value={videoDuration}
                onChange={(value) => {
                  setVideoDuration(value);
                  setPromptTexts(Array(durationSceneMap[value]).fill(""));
                  setUploadedImageUrls(Array(durationSceneMap[value]).fill(""));
                  setGeneratedVideos([]);
                }}
                style={{ width: 150, marginLeft: 12 }}
              >
                <Option value={5}>5 seconds</Option>
                <Option value={10}>10 seconds</Option>
                <Option value={30}>30 seconds</Option>
                <Option value={60}>60 seconds</Option>
              </Select>
              <Button
                size="small"
                style={{ backgroundColor: "#D2E3FC", color: "#000" }}
                onClick={() => setScriptModalOpen(true)}
              >
                Generate Script
              </Button>
            </div>
            {Array.from({ length: activeScenes }).map((_, index) => (
              <div key={index} style={{ marginBottom: 24 }}>
                <TextArea
                  autoSize={{ minRows: 2, maxRows: 10 }} // ✅ tự co giãn chiều cao
                  placeholder={`Scene ${index + 1} description`}
                  value={promptTexts[index] || ""}
                  onChange={(e) => {
                    const newPrompts = [...promptTexts];
                    newPrompts[index] = e.target.value;
                    setPromptTexts(newPrompts);
                  }}
                  style={{ marginBottom: 8 }} />

                <Row gutter={[8, 8]} justify="center" wrap style={{ marginBottom: 8 }}>
                  <Col xs={24} sm={10}>
                    {/* <Button
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
                      }} /> */}

                    <input
                      type="file"
                      accept="image/*"
                      ref={(el) => (uploadRefs.current[index] = el)}
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageUpload(index, e.target.files[0]);
                        }
                      }}
                    />

                    <Button
                      type="dashed"
                      block
                      size="small"
                      icon={<UploadOutlined />}
                      onClick={() => {
                        if (uploadRefs.current[index]) {
                          uploadRefs.current[index]?.click();
                        } else {
                          console.warn("❗Không tìm thấy input file tại index:", index);
                        }
                      }}
                    >
                      Upload Image
                    </Button>

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
                        }} />
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
                          muted />
                        <Checkbox
                          checked={generatedVideos.find((v) => v.index === index)?.selected}
                          onChange={() => handleCheckboxChange(index)}
                          style={{
                            position: "absolute",
                            top: 4,
                            right: 12,
                            background: "white",
                            padding: 2,
                            borderRadius: 4,
                            zIndex: 2,
                          }} />
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
                <Button style={{ backgroundColor: "#D2E3FC", color: "#000" }} onClick={openMusicModal}>
                  {selectedMusic ? `🎵 ${selectedMusic.name}` : "Choose music"}
                </Button>
              </Col>

              <Col>
                <Button
                  style={{
                    backgroundColor: "#D2E3FC",
                    color: "#000",
                    fontWeight: 500,
                  }}
                  onClick={handleMergeMusic}
                >
                  🎬 Music pairing
                </Button>
              </Col>
            </Row>
            <Modal
              title="Choose background music"
              open={modalOpen}
              onOk={confirmSelect}
              onCancel={closeModal}
              okText="Confirm"
              cancelText="Cancel"
            >
              <Select
                showSearch
                placeholder="Choose music genre"
                style={{ width: '100%', marginBottom: 16 }}
                value={selectedGenre}
                onChange={(value) => {
                  setSelectedGenre(value);
                  fetchMusic(value);
                }}
                options={genres.map((g) => ({ label: g, value: g.toLowerCase() }))} />

              {loadingMusic ? (
                <Spin />
              ) : (
                <Radio.Group
                  onChange={(e) => setSelectedId(e.target.value)}
                  value={selectedId}
                  style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  {musicList.map((track) => (
                    <Radio
                      key={track.id}
                      value={track.id}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <Button
                        shape="circle"
                        size="small"
                        style={{ marginRight: 8 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          playPreview(track.id);
                        }}
                      >
                        {playingId === track.id ? '⏸' : '▶'}
                      </Button>
                      <Text>{track.name || `Track ${track.id}`}</Text>
                    </Radio>
                  ))}
                </Radio.Group>
              )}
            </Modal>
          </Col>

          {/* Cột phải: kết quả và caption */}
          <Col xs={24} md={12}>
            {/* Modal hiển thị khi click */}
            <AutoPostModal visible={showModal} onClose={() => setShowModal(false)} />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end", // ✅ đẩy nút sang phải
                padding: "6px 0", // ✅ khoảng trống trên dưới (có thể tăng/giảm)
              }}
            >
              <button
                onClick={() => setShowModal(true)}
                style={{
                  backgroundColor: "#D2E3FC",
                  color: "#000",
                  border: "1px solid #D2E3FC",
                  borderRadius: 6,
                  padding: "6px 12px", // ✅ padding cho nút đẹp hơn
                  fontSize: 11,
                  cursor: "pointer",
                  marginRight: 16, // ✅ nếu cần cách xa mép phải
                }}
              >
                Thiết lập đăng bài tự động
              </button>
            </div>
            <div
              style={{
                background: "#fafafa",
                border: "1px solid #e0e0e0",
                height: "40vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                overflow: "hidden",
                marginBottom: 24,
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              }}
            >
              {videoSrc ? (
                <video
                  key={videoSrc}
                  controls
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                >
                  <source src={videoSrc} type="video/mp4" />
                </video>
              ) : (
                <span style={{ color: "#999", fontSize: 16 }}>No videos yet</span>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <TextArea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter video content description..."
                style={{
                  width: "100%",
                  fontSize: 15,
                  borderRadius: 8,
                  padding: 10,
                  backgroundColor: "#ffffff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }} />

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <Button
                  loading={loadingCaption}
                  style={{
                    backgroundColor: "#D2E3FC",
                    color: "#000",
                    borderRadius: 8,
                    whiteSpace: "nowrap"
                  }}
                  onClick={generateCaption}
                >
                  Generate Caption
                </Button>
              </div>
            </div>
            <TextArea
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="The caption content will appear here..."
              style={{
                fontSize: 15,
                borderRadius: 8,
                padding: 10,
                marginBottom: 16,
                backgroundColor: "#ffffff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }} />

            <Button
              type="primary"
              block
              size="large"
              onClick={handlePostFacebook}
              loading={creatingCase}
              style={{
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              Post Facebook
            </Button>
          </Col>
        </Row>
      </Content>

      <Modal
        title="Generate Video Script"
        open={scriptModalOpen}
        onCancel={() => setScriptModalOpen(false)}
        okText="Generate"
        cancelText="Cancel"
        confirmLoading={loadingScript}
        onOk={generateScriptByGPT} // ✅ tách logic ra hàm
      >
        <TextArea
          rows={4}
          value={scriptPrompt}
          onChange={(e) => setScriptPrompt(e.target.value)}
          placeholder="Ví dụ: Cho tôi 3 cảnh video quảng cáo quán lẩu..."
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              generateScriptByGPT(); // ✅ nhấn Enter cũng chạy như click
            }
          }} />
      </Modal>
    </Layout></>
  );
};

export default VideoGenerator;






