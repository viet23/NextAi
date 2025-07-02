import React, { useEffect, useState, useRef } from "react";
import { Layout, Input, Button, message, Checkbox, Select, Row, Col, Modal, Radio, Spin, Typography, Progress } from "antd";
import { useCreateCaseMutation } from "src/store/api/ticketApi";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
// import { Row, Col, Button, Modal, Radio, Typography, Spin, message } from 'antd';
import axios from 'axios';
import { CloseCircleOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { IRootState } from "src/interfaces/app.interface";
import { useGetAccountQuery } from "src/store/api/accountApi";
import AutoPostModal from "../AutoPostModal";
import FullscreenLoader from "../FullscreenLoader";
import { contentFetchOpportunityScore, contentGenerateCaption } from "src/utils/facebook-utild";
import { useTranslation } from "react-i18next";
const genres = [
  "Ambient", "Piano", "Orchestra", "Lofi", "Chill", "Hiphop", "Electronic",
  "Pop", "Rock", "Jazz", "Blues", "Acoustic", "Guitar", "Drums", "Trap",
  "Classical", "Funk", "Dubstep", "House", "Trance", "Folk", "Reggae",
  "Metal", "Synth", "Vocals", "Choir", "Soundtrack", "Score"
];


const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

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
  const { t } = useTranslation();
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
  const SHOTSTACK_API_KEY = "A6urmAlot4I2VNzJEiRVFFqeVQwcrk4zfpQJRvSE";
  const [description, setDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeScenes, setActiveScenes] = useState(1);
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [scriptPrompt, setScriptPrompt] = useState("");
  const [loadingScript, setLoadingScript] = useState(false);
  const uploadRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [scoreLabel, setScoreLabel] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [resolution, setResolution] = useState("720p");
  const [ratio, setRatio] = useState("16:9");

  const [sceneCount, setSceneCount] = useState(3);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productSurrounding, setProductSurrounding] = useState("");
  const [specialEffects, setSpecialEffects] = useState("");


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


  const handleMergeMusic = async () => {

    if (!selectedMusic || !videoSrc) {
      message.warning("Please select music and make sure you have a video before adding music.");
      return;
    }
    setLoading(true);
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
        setLoading(false);
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
      setLoading(false);
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
          if (url) {
            setVideoSrc(url);
            const promptTextsMerge = promptTexts
              .slice(0, activeScenes)
              .filter(Boolean)
              .join('\n - ');
            const body = { urlVideo: url, caption: `Music pairing : ${promptTextsMerge}` };
            await createCase(body).unwrap();
            setLoading(false);
          }

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

  const generateScriptPrompt = () => {
    const sceneText = `${sceneCount} ${t("video.scenes")}`;
    const productText = productName ? `${t("video.about_product")} ${productName}` : "";
    const descriptionText = productDescription ? `${t("video.description")}: ${productDescription}` : "";
    const surroundingText = productSurrounding ? `${t("video.around")}: ${productSurrounding}` : "";
    const effectsText = specialEffects ? `${t("video.effects")}: ${specialEffects}` : "";

    return `${t("video.generate_instruction")} ${sceneText}. ${productText}. ${descriptionText}. ${surroundingText}. ${effectsText}.`.trim();
  };


  const generateScriptByGPT = async () => {
    setScriptPrompt(generateScriptPrompt())
    if (!scriptPrompt) {
      message.warning("Please enter your request");
      return;
    }

    console.log(`scriptPrompt`, scriptPrompt);


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

. Mỗi cảnh dài khoảng 10 giây, mô tả chi tiết cảnh quay với nhiều hoạt động và chuyển động sống động trong khung hình. Kết quả trả về dưới dạng JSON mảng các chuỗi, mỗi chuỗi là một cảnh.

Yêu cầu:
- Quảng cáo chỉ tạo cảnh bao quanh sản phẩm thôi .
- KHÔNG mô tả bất kỳ con người nào (không khách hàng, không nhân viên, không bàn tay...).
- Mỗi cảnh dài khoảng 10 giây, nhưng phải có **nhiều hoạt động và hiệu ứng liên tục, lồng ghép hoặc chuyển tiếp mượt mà**.
- Mỗi cảnh cần có ít nhất **5 hoạt động hoặc hiệu ứng**, ví dụ:
  + Nguyên liệu rơi, xoay, lăn, va đập
  + Hiệu ứng nước sôi, khói, tia sáng, tia ớt cay bắn ra
  + Chuyển động camera (zoom cận topping → xoay quanh nồi → cắt cảnh nhanh)
  + Kỹ thuật dựng hình ảnh: slow-motion, fast cut, lặp nhịp
- Cảnh phải sinh động, mạnh mẽ, đầy năng lượng — giúp truyền tải cảm giác hấp dẫn của món ăn và kích thích người xem muốn đặt mua hoặc đến trải nghiệm ngay lập tức.
- Trả về đúng 3 cảnh, dạng JSON, mỗi cảnh là 1 chuỗi mô tả sinh động. Không được thêm hoặc bớt cảnh.
Định dạng kết quả:
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


    const selectedUrls = generatedVideos
      .filter(v => v.selected)
      .sort((a, b) => a.index - b.index)
      .map(v => v.url);

    if (selectedUrls.length < 2) return message.warning("Select at least 2 videos to merge.");
    setLoading(true);
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
        setLoading(false);
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
          setLoading(false);
          return;
        }

        attempts++;
        await delay(3000);
      }

      if (mergedUrl) {
        setVideoSrc(mergedUrl);
        message.success("Video merging done!");
        const promptTextsMerge = promptTexts
          .slice(0, activeScenes)
          .filter(Boolean) // loại bỏ undefined/null
          .join('\n - ');
        const body = { urlVideo: mergedUrl, caption: `Merge Selected Videos : ${promptTextsMerge}` };
        await createCase(body).unwrap();
        setLoading(false);
      } else {
        message.warning("Rendering took too long, please try again later");
        setLoading(false);
      }

    } catch (err) {
      console.error(err);
      message.error("Server error when merging video , Your budget run out! Please contact Admin");
      setLoading(false);
    }

  };

  const handleRemoveImage = (indexToRemove: number) => {
    const newUrls = [...uploadedImageUrls];
    newUrls[indexToRemove] = "";
    setUploadedImageUrls(newUrls);
  };


  const handleImageUpload = async (index: any, file: any) => {
    setLoading(true);
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
      // ✅ Reset input sau upload thành công
      if (uploadRefs.current[index]) {
        uploadRefs.current[index]!.value = "";
      }

      if (data?.data?.url) {
        const newUrls: any = [...uploadedImageUrls];
        newUrls[index] = data.data.url;
        setUploadedImageUrls(newUrls);
        message.success("Upload photo successfully");
      } else {
        message.error("Image upload failed");
      }
      setLoading(false);
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Error when uploading photos");
      setLoading(false);
    }

  };

  const generateSingleSceneVideo = async (index: any) => {
    setLoading(true);
    if (!promptTexts[index] || !uploadedImageUrls[index]) {
      message.warning(`Please enter a description and photo for the Scene ${index + 1}`);
      setLoading(false)
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
          ratio: ratio,
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
        const body = { urlVideo: data?.videoUrl, caption: promptTexts[index] };
        await createCase(body).unwrap();
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
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
          temperature: 0.8,
          max_tokens: 1000,
        }),
      });

      const data = await response.json();
      if (data?.choices?.[0]?.message?.content) {
        setCaption(data.choices[0].message.content.trim().replace(/^"|"$/g, ''));
        const body = { urlVideo: videoSrc, caption: `Generate caption : ${data.choices[0].message.content.trim().replace(/^"|"$/g, '')}` };
        await createCase(body).unwrap();
      } else {
        message.error("Unable to create caption");
      }
      setLoadingCaption(false);
    } catch (err) {
      console.error("Caption error:", err);
      message.error("Error creating caption");
      setLoadingCaption(false);
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <label style={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                {t("video.duration_label")}:
              </label>
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
                <Option value={5}>{t("video.seconds", { count: 5 })}</Option>
                <Option value={10}>{t("video.seconds", { count: 10 })}</Option>
                <Option value={30}>{t("video.seconds", { count: 30 })}</Option>
                <Option value={60}>{t("video.seconds", { count: 60 })}</Option>
              </Select>
              <Button
                size="small"
                style={{ backgroundColor: "#D2E3FC", color: "#000" }}
                onClick={() => setScriptModalOpen(true)}
              >
                {t("video.generate_script")}
              </Button>
            </div>
            {Array.from({ length: activeScenes }).map((_, index) => (
              <div key={index} style={{ marginBottom: 24 }}>
                <TextArea
                  autoSize={{ minRows: 2, maxRows: 10 }}
                  placeholder={t("video.scene_description", { index: index + 1 })}
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
                      {t("video.upload_image")}
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
                      {t("video.generate_scene", { index: index + 1 })}
                    </Button>
                  </Col>
                </Row>


                <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                  <Col span={12} style={{ textAlign: "center" }}>
                    {uploadedImageUrls[index] && (
                      <div style={{ position: "relative", display: "inline-block" }}>
                        {/* Ảnh */}
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

                        {/* Nút Xoá */}
                        <CloseCircleOutlined
                          onClick={() => handleRemoveImage(index)}
                          style={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            fontSize: 18,
                            color: "red",
                            backgroundColor: "#fff",
                            borderRadius: "50%",
                            cursor: "pointer",
                          }}
                        />
                      </div>
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

                        {/* Checkbox chọn video */}
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
                          }}
                        />

                        {/* Icon tải xuống */}
                        <DownloadOutlined
                          onClick={() => {
                            const url = generatedVideos.find((v) => v.index === index)?.url;

                            if (!url) {
                              message.error("Không tìm thấy video để tải");
                              return;
                            }

                            Modal.confirm({
                              title: "Tải video?",
                              content: "Bạn có chắc muốn tải video này xuống thiết bị của mình?",
                              okText: "Tải xuống",
                              cancelText: "Hủy",
                              onOk: async () => {
                                try {
                                  const response = await fetch(url);
                                  const blob = await response.blob();
                                  const blobUrl = window.URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = blobUrl;
                                  a.download = `video-${index}.mp4`;
                                  document.body.appendChild(a);
                                  a.click();
                                  a.remove();
                                  window.URL.revokeObjectURL(blobUrl);
                                  message.success("Đã bắt đầu tải video");
                                } catch (err) {
                                  console.error("Tải video thất bại:", err);
                                  message.error("Tải video thất bại");
                                }
                              },
                            });
                          }}
                          style={{
                            position: "absolute",
                            bottom: 8,
                            right: 12,
                            fontSize: 12,
                            background: "#fff",
                            padding: 6,
                            borderRadius: "50%",
                            cursor: "pointer",
                            zIndex: 2,
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                          }}
                          title="Tải video"
                        />
                      </>
                    )}
                  </Col>
                </Row>

              </div>
            ))}
            <div style={{ marginBottom: 24 }}>
              <Row gutter={[12, 12]} justify="center">
                <Col> <select
                  style={{ width: 110, padding: "4px 6px", fontSize: 13 }}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                >
                  <option value="" disabled>Resolution</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                </select></Col>
                <Col> <select
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
                </select></Col>
                <Col> <Button
                  type="primary"
                  loading={loading}
                  style={{ backgroundColor: "#D2E3FC", color: "#000" }}
                  onClick={generateAllScenesVideos}
                >
                  {t("video.generate_all")}
                </Button></Col>

              </Row>
            </div>

            <Row gutter={[12, 12]} justify="center">
              <Col>
                <Button
                  type="primary"
                  style={{ backgroundColor: "#D2E3FC", color: "#000" }}
                  onClick={mergeSelectedVideos}
                >
                  {t("video.merge_selected")}
                </Button>
              </Col>
              <Col>
                <Button
                  style={{ backgroundColor: "#D2E3FC", color: "#000" }}
                  onClick={openMusicModal}
                >
                  {selectedMusic
                    ? t("video.selected_music", { name: selectedMusic.name })
                    : t("video.choose_music")}
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
                  {t("video.music_pairing")}
                </Button>
              </Col>
            </Row>
            <Modal
              title={t("video.choose_music_title")}
              open={modalOpen}
              onOk={confirmSelect}
              onCancel={closeModal}
              okText={t("video.confirm")}
              cancelText={t("video.cancel")}
            >
              <Select
                showSearch
                placeholder={t("video.choose_music_genre")}
                style={{ width: '100%', marginBottom: 16 }}
                value={selectedGenre}
                onChange={(value) => {
                  setSelectedGenre(value);
                  fetchMusic(value);
                }}
                options={genres.map((g) => ({ label: g, value: g.toLowerCase() }))}
              />

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
                      <Text>
                        {track.name || t("video.track", { id: track.id })}
                      </Text>
                    </Radio>
                  ))}
                </Radio.Group>
              )}
            </Modal>
          </Col>

          {/* Cột phải: kết quả và caption */}
          <Col xs={24} md={12}>
            <AutoPostModal visible={showModal} onClose={() => setShowModal(false)} />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "6px 0",
              }}
            >
              <button
                onClick={() => setShowModal(true)}
                style={{
                  backgroundColor: "#D2E3FC",
                  color: "#000",
                  border: "1px solid #D2E3FC",
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontSize: 11,
                  cursor: "pointer",
                  marginRight: 16,
                }}
              >
                {t("video.auto_post_setting")}
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
                position: "relative", // để icon tải định vị tuyệt đối
              }}
            >
              {videoSrc ? (
                <>
                  <video
                    key={videoSrc}
                    controls
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  >
                    <source src={videoSrc} type="video/mp4" />
                  </video>

                  {/* Nút tải video */}
                  <DownloadOutlined
                    onClick={() => {
                      Modal.confirm({
                        title: "Tải video?",
                        content: "Bạn có chắc muốn tải video này xuống thiết bị của mình?",
                        okText: "Tải xuống",
                        cancelText: "Hủy",
                        onOk: async () => {
                          try {
                            const response = await fetch(videoSrc);
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "downloaded-video.mp4";
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);
                            message.success("Đã bắt đầu tải video");
                          } catch (err) {
                            console.error("Lỗi tải video:", err);
                            message.error("Tải video thất bại");
                          }
                        },
                      });
                    }}
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      fontSize: 20,
                      background: "#fff",
                      padding: 8,
                      borderRadius: "50%",
                      cursor: "pointer",
                      zIndex: 10,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                    title="Tải video"
                  />
                </>
              ) : (
                <span style={{ color: "#999", fontSize: 16 }}>{t("video.no_video")}</span>
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
                  {t("video.generate_caption")}
                </Button>
              </div>
            </div>

            <TextArea
              rows={4}
              value={caption}
              onChange={handleCaptionChange}
              placeholder={t("video.caption_placeholder")}
              style={{
                fontSize: 15,
                borderRadius: 8,
                padding: 10,
                marginBottom: 16,
                backgroundColor: "#ffffff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            />

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
                        <div style={{ fontSize: 12, color: "#999" }}>{t("video.points")}</div>
                      </div>
                    )}
                  />
                </div>

                <div>
                  <Title level={5} style={{ margin: 0 }}>
                    {scoreLabel} <span style={{ color: "#999" }}>ℹ️</span>
                  </Title>
                  <Text type="secondary">{suggestion}</Text>
                </div>
              </div>
            )}

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
              {t("video.post_facebook")}
            </Button>
          </Col>
        </Row>
      </Content>

      <Modal
        title={
          <div style={{ textAlign: "center", width: "100%" }}>
            {t("video.script_modal_title")}
          </div>
        }
        open={scriptModalOpen}
        onCancel={() => setScriptModalOpen(false)}
        okText={t("video.generate")}
        cancelText={t("video.cancel")}
        confirmLoading={loadingScript}
        onOk={() => {
          if (
            !sceneCount ||
            !productName.trim() ||
            !productDescription.trim() ||
            !productSurrounding.trim() ||
            !specialEffects.trim()
          ) {
            message.warning(t("video.required_fields_warning"));
            return;
          }

          generateScriptByGPT();
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          <label>{t("video.scene_count_label")}</label>
          <Select
            value={sceneCount}
            onChange={setSceneCount}
            placeholder={t("video.scene_count_placeholder")}
          >
            {[3, 4, 5, 6].map((num) => (
              <Select.Option key={num} value={num}>
                {num} {t("video.scenes")}
              </Select.Option>
            ))}
          </Select>

          <label>{t("video.product_name_label")}</label>
          <Input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder={t("video.product_name_placeholder")}
          />

          <label>{t("video.product_description_label")}</label>
          <Input
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            placeholder={t("video.product_description_placeholder")}
          />

          <label>{t("video.product_surrounding_label")}</label>
          <Input
            value={productSurrounding}
            onChange={(e) => setProductSurrounding(e.target.value)}
            placeholder={t("video.product_surrounding_placeholder")}
          />

          <label>{t("video.special_effects_label")}</label>
          <Input
            value={specialEffects}
            onChange={(e) => setSpecialEffects(e.target.value)}
            placeholder={t("video.special_effects_placeholder")}
          />
        </div>
      </Modal>


    </Layout></>
  );
};

export default VideoGenerator;






