import React, { useEffect, useState, useRef } from "react";
import {
  Layout,
  Input,
  Button,
  message,
  Checkbox,
  Select,
  Image,
  Row,
  Col,
  Modal,
  Radio,
  Spin,
  Typography,
  Progress,
  Form,
  Card,
  Table,
  Empty,
  Tooltip,
  Flex,
  Pagination,
  Drawer,
  RadioChangeEvent,
} from "antd";
import { useCreateCaseMutation, useGetCasesQuery } from "src/store/api/ticketApi";
import { DownloadOutlined, EyeOutlined, UploadOutlined } from "@ant-design/icons";
// import { Row, Col, Button, Modal, Radio, Typography, Spin, message } from 'antd';
import axios from "axios";
import "./styles.scss";
import { CloseCircleOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { IRootState } from "src/interfaces/app.interface";
import { useGetAccountQuery, useLazyGetAccountQuery } from "src/store/api/accountApi";
import AutoPostModal from "../AutoPostModal";
import FullscreenLoader from "../FullscreenLoader";
import { contentFetchOpportunityScore, contentGenerateCaption } from "src/utils/facebook-utild";
import { useTranslation } from "react-i18next";
import { buildScriptPrompt } from "src/utils/build-script-prompt-utild";
import { genres, headersMusic, reverseSceneMap } from "src/utils/common-utils";
import { ReactComponent as RefetchIcon } from "src/assets/images/icon/ic-refetch.svg";
import DetailTicket from "../DetailTicket";

const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const inputStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid #334155",
  color: "#e2e8f0",
  borderRadius: 8,
  height: 36,
  padding: "4px 10px",
  fontSize: 13,
  lineHeight: 1.4,
};


type MusicItem = {
  id: number;
  name: string;
  url: string;
  previews?: {
    "preview-lq-mp3": string;
  };
};

type FreesoundResponse = {
  results: MusicItem[];
};

type FreesoundDetail = {
  previews: {
    "preview-lq-mp3": string;
  };
};

const durationSceneMap: any = {
  5: 1,
  10: 1,
  20: 2,
  30: 3,
  40: 4,
  50: 5,
  60: 6,
};

const VideoGenerator = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [caption, setCaption] = useState("");
  const [promptTexts, setPromptTexts] = useState([""]);
  const [videoSrc, setVideoSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [createCase, { isLoading: creatingCase }] = useCreateCaseMutation();
  const [loadingCaption, setLoadingCaption] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls]: any = useState([]);
  const [generatedVideos, setGeneratedVideos] = useState<
    { index: number; url: string; selected: boolean }[]
  >([]);
  const [videoDuration, setVideoDuration] = useState(5);
  const { user } = useSelector((state: IRootState) => state.auth);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingMusic, setLoadingMusic] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [musicList, setMusicList] = useState<MusicItem[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<MusicItem | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>("lofi");
  const { data: accountDetailData } = useGetAccountQuery(user?.id || "0", {
    skip: !user?.id,
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
   const [getAccount] = useLazyGetAccountQuery();

  const [sceneCount, setSceneCount] = useState(30);
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
          headers: headersMusic,
        }
      );

      const audioUrl = res.data.previews["preview-lq-mp3"];
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

      await pollRenderStatus(renderId);
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

        const { status, url } = (statusRes.data as { response: { status: string; url?: string } })
          .response;
        console.log(`🎞️ Render status [${attempts + 1}]:`, status);

        if (status === "done") {
          message.success("✅Music pairing successful!");
          console.log("🎬 Video with music:", url);
          if (url) {
            setVideoSrc(url);
            const promptTextsMerge = promptTexts
              .slice(0, activeScenes)
              .filter(Boolean)
              .join("\n - ");
            const body = { urlVideo: url, caption: `Music pairing : ${promptTextsMerge}`, taskId: renderId, action: "merge_music" };
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
    console.log(`sceneCount`, sceneCount);

    const sceneCountGPT = durationSceneMap[sceneCount];
    console.log(`sceneCountGPT`, sceneCountGPT);
    const sceneText = `${sceneCountGPT} ${t("video.scenesGpt")}`;
    const productText = productName ? `${t("video.about_product")} ${productName}` : "";
    const descriptionText = productDescription
      ? `${t("video.description")}: ${productDescription}`
      : "";
    const surroundingText = productSurrounding ? `${t("video.around")}: ${productSurrounding}` : "";
    const effectsText = specialEffects ? `${t("video.effects")}: ${specialEffects}` : "";

    return `${t("video.generate_instruction")} ${sceneText}. ${productText}. ${descriptionText}. ${surroundingText}. ${effectsText}.`.trim();
  };

  const generateScriptByGPT = async () => {
    const prompt = generateScriptPrompt();  // tạo prompt tạm
    if (!prompt || !prompt.trim()) {
      message.warning("Please enter your request");
      return;
    }
    setScriptPrompt(prompt);  // cập nhật state sau

    console.log(`scriptPrompt`, scriptPrompt);
    setLoadingScript(true);

    const promptContent = buildScriptPrompt({
      scriptPrompt: prompt,
      sceneCount,
      durationSceneMap,
    });

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
              content: promptContent,
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

      const matchedDuration = reverseSceneMap[scenes.length];
      if (matchedDuration) {
        console.log(`matchedDuration`, matchedDuration);

        if (matchedDuration == 5) {
          setVideoDuration(sceneCount);
        } else {
          setVideoDuration(matchedDuration);
        }
      } else {
        message.warning(
          "Số lượng cảnh không khớp với thời lượng video được hỗ trợ. Hãy yêu cầu GPT trả về đúng 1, 3 hoặc 6 cảnh."
        );
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
          headers: headersMusic,
        }
      );
      setMusicList(res.data.results.slice(0, 5));
    } catch (err) {
      message.error("Playlist loading error. Your budget run out! Please contact Admin");
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
        headers: headersMusic,
      });
      const url = res.data.previews["preview-lq-mp3"];

      if (audio) audio.pause(); // Dừng nhạc cũ
      const newAudio = new Audio(url);
      newAudio.play();

      setAudio(newAudio);
      setPlayingId(id);
    } catch (err) {
      message.error("Cannot play music . Your budget run out! Please contact Admin");
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
    const track = musicList.find(t => t.id === selectedId);
    if (!track) {
      message.warning("Please select a song");
      return;
    }
    if (audio) audio.pause();
    console.log("track", track);

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
        const body = { urlVideo: videoSrc, caption, taskId: "", action: "video_post_facebook" };
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
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
          .join("\n - ");
        const body = {
          urlVideo: mergedUrl,
          caption: `Merge Selected Videos : ${promptTextsMerge}`,
          taskId: renderId, action: "merge_video",
        };
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
   const accountDetail = await getAccount(user?.id || "0").unwrap();

    accountDetail?.credits && accountDetail?.credits < 50 && message.error(t("video.not_enough_credits"));

    setLoading(true);
    if (!promptTexts[index] || !uploadedImageUrls[index]) {
      message.warning(`Please enter a description and photo for the Scene ${index + 1}`);
      setLoading(false);
      return;
    }

    let time = 5;
    if (videoDuration > 5) {
      time = 10;
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
      console.log(`data`, data);


      if (data?.videoUrl) {
        if (videoDuration <= 10) {
          setVideoSrc(data?.videoUrl);
        }
        setGeneratedVideos(prev => {
          const updated: any = [...prev.filter((v: any) => v.index !== index)];
          updated.push({ index, url: data.videoUrl, selected: false });
          return updated;
        });
        message.success(`Recreated video for Scene ${index + 1}`);
        const body = { urlVideo: data?.videoUrl, caption: promptTexts[index], taskId: data?.taskId, action: "generate_video" };
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
        setCaption(data.choices[0].message.content.trim().replace(/^"|"$/g, ""));


        if (videoSrc) {
          const body = {
            urlVideo: videoSrc,
            caption: `Generate caption : ${data.choices[0].message.content.trim().replace(/^"|"$/g, "")}`, action: "generate_video_caption",
          };
          await createCase(body).unwrap();
        }

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
      prev.map((item: any) => (item.index === index ? { ...item, selected: !item.selected } : item))
    );
  };

  useEffect(() => {
    setActiveScenes(durationSceneMap[videoDuration]);
  }, [videoDuration]);

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
    <>
      <FullscreenLoader
        spinning={loading || loadingCaption || loadingScript || creatingCase || loadingMusic}
      />
      <Layout className="image-layout">
        <Content style={{ padding: 24 }}>
          <h3 style={{ textAlign: "center", color: "#fff", marginBottom: 12 }}>
            {t("video.title")}
          </h3>
          <p style={{ color: "#94A3B8", fontSize: 14 }}>
            {t("video.subtitle")} {/* subtitle :Tạo hình ảnh và nội dung độc đáo chỉ trong vài giây. */}
          </p>
          <div className="image-page">
            <div className="image-column">
              {/* Cột trái: nhập mô tả và upload */}

              <div
                style={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: 12,
                  padding: 24,
                  marginTop: 12,
                  color: "#e2e8f0",
                }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
                      {t("video.create_script_title")}
                    </div>
                  </Col>

                  <Col xs={24} md={12}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <label style={{ whiteSpace: "nowrap", fontSize: 13 }}>
                        {t("video.scene_count_label")}:
                      </label>
                      <Select
                        value={sceneCount}
                        onChange={setSceneCount}
                        placeholder={t("video.scene_count_placeholder")}
                        style={{
                          width: 110,
                          height: 36,
                          fontSize: 13,
                          backgroundColor: "#1e293b",
                          color: "#e2e8f0",
                          border: "1px solid #334155",
                          borderRadius: 8,
                          outline: "none",
                        }}
                        dropdownStyle={{
                          backgroundColor: "#1e293b",
                          color: "#e2e8f0",
                          fontSize: 13,
                        }}
                        getPopupContainer={(trigger) => trigger.parentNode}
                        popupMatchSelectWidth={false}
                      >
                        <Option value="" disabled style={{ color: "#e2e8f0", backgroundColor: "#1e293b" }}>
                          {t("video.scene_count_placeholder")}
                        </Option>
                        {[5, 10, 20, 30, 40, 50, 60].map(num => (
                          <Option
                            key={num}
                            value={num}
                            style={{ color: "#e2e8f0", backgroundColor: "#1e293b" }}
                          >
                            {num} {t("video.scenes")}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Col>

                  <Col xs={24} md={12}>
                    <label style={{ display: "block", marginBottom: 4 }}>
                      {t("video.product_name_label")}
                    </label>
                    <Input
                      value={productName}
                      onChange={e => setProductName(e.target.value)}
                      placeholder={t("video.product_name_placeholder")}
                      style={inputStyle}
                    />
                  </Col>

                  <Col xs={24} md={12}>
                    <label style={{ display: "block", marginBottom: 4 }}>
                      {t("video.product_description_label")}
                    </label>
                    <Input
                      value={productDescription}
                      onChange={e => setProductDescription(e.target.value)}
                      placeholder={t("video.product_description_placeholder")}
                      style={inputStyle}
                    />
                  </Col>

                  <Col xs={24} md={12}>
                    <label style={{ display: "block", marginBottom: 4 }}>
                      {t("video.effects_label")}
                    </label>
                    <Input
                      value={specialEffects}
                      onChange={e => setSpecialEffects(e.target.value)}
                      placeholder={t("video.effects_placeholder")}
                      style={inputStyle}
                    />
                  </Col>

                  <Col xs={24} md={12}>
                    <label style={{ display: "block", marginBottom: 4 }}>
                      {t("video.surrounding_label")}
                    </label>
                    <Input
                      value={productSurrounding}
                      onChange={e => setProductSurrounding(e.target.value)}
                      placeholder={t("video.surrounding_placeholder")}
                      style={inputStyle}
                    />
                  </Col>

                  <Col span={24}>
                    <div style={{ textAlign: "center", marginTop: 24 }}>
                      <Button
                        icon={<span style={{ marginRight: 6 }}>✦</span>}
                        style={{
                          backgroundColor: "#0f172a",
                          border: "1px solid #3b82f6",
                          color: "#ffffff",
                          borderRadius: 8,
                          padding: "8px 24px",
                          fontSize: 16,
                          fontWeight: 600,
                          boxShadow: "0 0 6px rgba(59,130,246,0.6)",
                        }}
                        onClick={() => {
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
                        {t("video.create_script_button")}
                      </Button>
                    </div>
                  </Col>
                </Row>

              </div>


              <div style={{ marginBottom: 24, marginTop: 32 }}>
                <Row gutter={[12, 12]} justify="center" align="middle">
                  {/* Resolution */}
                  <Col>
                    <select
                      style={{
                        width: 110,
                        padding: "4px 8px",
                        fontSize: 13,
                        backgroundColor: "#1e293b",
                        color: "#e2e8f0",
                        border: "1px solid #334155",
                        borderRadius: 8,
                        outline: "none",
                      }}
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                    >
                      <option value="" disabled>
                        Resolution
                      </option>
                      <option value="720p">720p</option>
                      <option value="1080p">1080p</option>
                    </select>
                  </Col>

                  {/* Ratio */}
                  <Col>
                    <select
                      style={{
                        width: 110,
                        padding: "4px 8px",
                        fontSize: 13,
                        backgroundColor: "#1e293b",
                        color: "#e2e8f0",
                        border: "1px solid #334155",
                        borderRadius: 8,
                        outline: "none",
                      }}
                      value={ratio}
                      onChange={(e) => setRatio(e.target.value)}
                    >
                      <option value="" disabled>
                        Size
                      </option>
                      <option value="16:9">16:9</option>
                      <option value="9:16">9:16</option>
                      <option value="1:1">1:1</option>
                      <option value="4:3">4:3</option>
                      <option value="3:4">3:4</option>
                      <option value="21:9">21:9</option>
                    </select>
                  </Col>

                  {/* Duration – dùng Antd Select */}
                  <Col>
                    <Select
                      value={videoDuration}
                      onChange={(value) => {
                        setVideoDuration(value);
                        setPromptTexts(Array(durationSceneMap[value]).fill(""));
                        setUploadedImageUrls(Array(durationSceneMap[value]).fill(""));
                        setGeneratedVideos([]);
                      }}
                      style={{
                        width: 110,
                        padding: "4px 8px", // không thật sự dùng trong Antd nhưng cho consistency
                        fontSize: 13,
                        backgroundColor: "#1e293b",
                        color: "#e2e8f0",
                        border: "1px solid #334155",
                        borderRadius: 8,
                        outline: "none",
                      }}
                      dropdownStyle={{
                        backgroundColor: "#1e293b",
                        color: "#e2e8f0",
                        fontSize: 13,
                      }}
                      getPopupContainer={(trigger) => trigger.parentNode} // tránh lệch dropdown
                      popupMatchSelectWidth={false}
                    >
                      <Option value="" disabled style={{ color: "#e2e8f0", backgroundColor: "#1e293b" }}>
                        Duration
                      </Option>
                      {[5, 10, 20, 30, 40, 50, 60].map((val) => (
                        <Option key={val} value={val} style={{ color: "#e2e8f0", backgroundColor: "#1e293b" }}>
                          {t("video.seconds", { count: val })}
                        </Option>
                      ))}
                    </Select>
                  </Col>


                  {/* Button chọn nhạc */}
                  <Col>
                    <Button
                      style={{
                        backgroundColor: "#1e293b",
                        color: "#e2e8f0",
                        border: "1px solid #334155",
                        borderRadius: 8,
                        fontWeight: 500,
                        padding: "4px 16px",
                      }}
                      onClick={openMusicModal}
                    >
                      {selectedMusic
                        ? t("video.selected_music", { name: selectedMusic.name })
                        : t("video.choose_music")}
                    </Button>
                  </Col>
                </Row>
              </div>

              {Array.from({ length: activeScenes }).map((_, index) => (
                <div
                  style={{
                    backgroundColor: "#0f172a",
                    padding: "24px 16px",
                    borderRadius: 12,
                    width: "100%",
                  }}
                >
                  <Row gutter={16} justify="space-between" align="top">
                    {/* Khối giữa: Nhập mô tả + Nút */}
                    <Col xs={24} md={14}>
                      <TextArea
                        rows={5}
                        autoSize={false}
                        value={promptTexts[index] || ""}
                        placeholder={t("video.scene_description_placeholder")}
                        onChange={(e) => {
                          const newPrompts = [...promptTexts];
                          newPrompts[index] = e.target.value;
                          setPromptTexts(newPrompts);
                        }}
                        className="image-textarea"
                      />

                      <div style={{ marginTop: 10 }}>
                        <Button
                          onClick={() => generateSingleSceneVideo(index)}
                          className="image-button image-button-large"
                        >
                          {t("video.generate_video_button")}
                          <span style={{ marginLeft: 8 }}>
                            50 <span role="img" aria-label="diamond">💎</span>
                          </span>
                        </Button>
                      </div>
                    </Col>

                    <Col xs={24} md={10}>
                      {/* Khối Chọn Media (trên) */}
                      <div
                        style={{
                          height: 90,
                          borderRadius: 8,
                          fontSize: 13,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          marginBottom: 8,
                        }}
                      >
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

                        {!uploadedImageUrls[index] ? (
                          <div
                            onClick={() => uploadRefs.current[index]?.click()}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              color: "#94a3b8",
                              userSelect: "none",
                            }}
                          >
                            <img
                              src="https://img.icons8.com/ios/50/94a3b8/picture.png"
                              alt="upload"
                              style={{ width: 24, height: 24, marginBottom: 2 }}
                            />
                            <div style={{ fontSize: 13 }}>{t("video.upload_image_label")}</div>
                          </div>
                        ) : (
                          <div style={{ position: "relative", display: "inline-block" }}>
                            <img
                              src={uploadedImageUrls[index]}
                              alt={`Scene ${index + 1}`}
                              style={{
                                width: 100,
                                height: 60,
                                objectFit: "cover",
                                borderRadius: 6,
                                border: "1px solid #ccc",
                              }}
                            />
                            <CloseCircleOutlined
                              onClick={() => handleRemoveImage(index)}
                              style={{
                                position: "absolute",
                                top: -6,
                                right: -6,
                                fontSize: 14,
                                color: "red",
                                backgroundColor: "#fff",
                                borderRadius: "50%",
                                cursor: "pointer",
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Khối Kết quả (dưới) */}
                      <div
                        style={{
                          height: 90,
                          borderRadius: 8,
                          fontSize: 13,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                        }}
                      >
                        {generatedVideos.some((v) => v.index === index) ? (
                          <div style={{ position: "relative", display: "inline-block" }}>
                            <video
                              src={generatedVideos.find((v) => v.index === index)?.url}
                              style={{
                                width: 250,
                                height: 120,
                                objectFit: "cover",
                                borderRadius: 6,
                                border: "1px solid #ccc",
                              }}
                              controls
                              muted
                            />
                            <div
                              style={{
                                position: "absolute",
                                top: 2,
                                right: 2,
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                                alignItems: "flex-end",
                                zIndex: 2,
                              }}
                            >
                              <Checkbox
                                checked={generatedVideos.find((v) => v.index === index)?.selected}
                                onChange={() => handleCheckboxChange(index)}
                                style={{
                                  background: "#ffffff",
                                  padding: 2,
                                  borderRadius: 4,
                                  transform: "scale(0.8)",
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <img
                              src="https://img.icons8.com/ios/50/94a3b8/picture.png"
                              alt="result"
                              style={{ width: 24, marginBottom: 2 }}
                            />
                            <div>{t("video.result_label")}</div>
                          </>
                        )}
                      </div>
                    </Col>
                  </Row>
                </div>


              ))}

              <Row
                gutter={[16, 16]}
                justify="space-between"
                style={{ marginTop: 24 }}
              >
                {[  // Dàn hàng bằng map để code gọn hơn
                  {
                    key: "merge",
                    text: t("video.merge_selected"),
                    onClick: mergeSelectedVideos,
                  },
                  {
                    key: "music",
                    text: t("video.music_pairing"),
                    onClick: handleMergeMusic,
                  },
                  {
                    key: "generate",
                    text: t("video.generate_all"),
                    onClick: generateAllScenesVideos,
                    loading: loading,
                  },
                ].map(({ key, text, onClick, loading }) => (
                  <Col key={key} xs={24} sm={12} md={8}>
                    <Button
                      type="primary"
                      loading={loading}
                      style={{
                        width: "100%",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        backgroundColor: "#0f172a",
                        color: "#ffffff",
                        fontSize: 13,
                        fontWeight: 600,
                        padding: "10px 16px",
                        border: "1px solid #3b82f6",
                        borderRadius: 8,
                        boxShadow: "0 0 8px rgba(59,130,246,0.6)",
                        lineHeight: 1.4,
                        minHeight: 36,
                        textAlign: "center",
                      }}
                      onClick={onClick}
                    >
                      {text}
                    </Button>
                  </Col>
                ))}
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
                  style={{ width: "100%", marginBottom: 16 }}
                  value={selectedGenre}
                  onChange={value => {
                    setSelectedGenre(value);
                    fetchMusic(value);
                  }}
                  options={genres.map(g => ({ label: g, value: g.toLowerCase() }))}
                />

                {loadingMusic ? (
                  <Spin />
                ) : (
                  <Radio.Group
                    onChange={e => setSelectedId(e.target.value)}
                    value={selectedId}
                    style={{ display: "flex", flexDirection: "column", gap: 12 }}
                  >
                    {musicList.map(track => (
                      <Radio
                        key={track.id}
                        value={track.id}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <Button
                          shape="circle"
                          size="small"
                          style={{
                            backgroundColor: "#06b6d4",
                            color: "#0f172a",
                            border: "none",
                            fontWeight: 600,
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            playPreview(track.id);
                          }}
                        >
                          {playingId === track.id ? "⏸" : "▶"}
                        </Button>
                        <Text>{track.name || t("video.track", { id: track.id })}</Text>
                      </Radio>
                    ))}
                  </Radio.Group>
                )}
              </Modal>
            </div>

            {/* Cột phải: kết quả và caption */}

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
                  onChange={e => setDescription(e.target.value)}
                  placeholder={t("video.enter_description")}
                  className="image-textarea"
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                  <Button
                    loading={loadingCaption}
                    className="image-button image-button-large"
                    onClick={generateCaption}
                  >
                    {t("video.generate_caption")}
                  </Button>
                </div>
              </div>

              <TextArea
                rows={8}
                value={caption}
                onChange={handleCaptionChange}
                placeholder={t("video.caption_placeholder")}
                className="image-textarea"
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
                type="primary"
                block
                size="large"
                onClick={handlePostFacebook}
                loading={creatingCase}
                className="image-button image-button-large"
              >
                {t("video.post_facebook")}
              </Button>
            </div>
          </div>

          <br />
          <div style={{
            maxWidth: 1222,
            margin: "0 auto",
            width: "100%",
          }}>
            <Row gutter={[24, 0]}>
              <Col xs="24" xl={24}>
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
              </Col>
            </Row>

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
      </Layout>
    </>
  );
};

export default VideoGenerator;
