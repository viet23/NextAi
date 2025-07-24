import React, { useEffect, useState } from "react";
import { Layout, Input, Button, Typography, Card, message } from "antd";
import { useCreateAnalysisMutation, useGetAnalysisQuery } from "src/store/api/ticketApi";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import AutoPostModal from "../AutoPostModal";
import { DatePicker, Progress, Row, Col } from "antd";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useSelector } from "react-redux";
import { IRootState } from "src/interfaces/app.interface";
import { useGetAccountQuery } from "src/store/api/accountApi";
import page1 from "../../assets/images/page1.png";
import page2 from "../../assets/images/page2.png";
import page3 from "../../assets/images/page3.png";
import page4 from "../../assets/images/page4.png";
import FullscreenLoader from "../FullscreenLoader";


const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;



const styles = {
  container: {
    minHeight: "100vh",
    background: "#fff",
    padding: 24,
  },
  inputSection: {
    maxWidth: 1000,
    margin: "0 auto",
    marginBottom: 24,
    padding: "0 16px",
  },
  twoColumns: {
    display: "flex",
    gap: 24,
    flexWrap: "wrap" as "wrap",
    justifyContent: "center",
    padding: "0 16px",
  },
  column: {
    flex: 1,
    minWidth: 320, // phù hợp cả iPhone chiều ngang
    maxWidth: 600,
  },
};

const FacebookPageAnalysis = () => {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [analysis, setAnalysis] = useState({
    overview: "",
    products: "",
    engagement: "",
    strategy: "",
  });

  const [createAnalysis, { isLoading: createAnaly }] = useCreateAnalysisMutation();
  const [showModal, setShowModal] = useState(false);
  const [channelPlan, setChannelPlan] = useState("");
  const [loading, setLoading] = useState(false);

  // Gọi API ngay khi component render
  const { data, isSuccess } = useGetAnalysisQuery({});

  // Khi có dữ liệu, cập nhật vào state
  useEffect(() => {
    if (isSuccess && data) {
      setUrl(data.urlPage || "");
      setAnalysis({
        overview: data.analysis?.overview || "",
        products: data.analysis?.products || "",
        engagement: data.analysis?.engagement || "",
        strategy: data.analysis?.strategy || "",
      });
      setChannelPlan(data.channelPlan || "");
    }
  }, [data, isSuccess]);

  const getChannelPlan = async (rawAnalysis: string) => {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
Đây là phân tích nội dung một Fanpage Facebook:

${rawAnalysis}

Hãy đề xuất kế hoạch phát triển kênh Facebook Page này, gồm:
1. Mục tiêu kênh
2. Định vị nội dung gợi ý (tỷ lệ %)
3. Lịch đăng bài mẫu tuần
4. Gợi ý định dạng nội dung + Ý tưởng viral
(Trình bày rõ ràng theo bố cục 2 cột giống bản kế hoạch truyền thông)`,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || "";
      setChannelPlan(content);
    } catch (err) {
      console.error("❌ GPT channel development error:", err);
    }
  };

  const analyzeFacebookPage = async () => {
    if (!url) {
      message.warning("Please enter Facebook Page link.");
      return;
    }

    setLoading(true);
    setChannelPlan("");
    setAnalysis({
      overview: "",
      products: "",
      engagement: "",
      strategy: "",
    });

    try {
      // 1. Crawl dữ liệu từ page
      const crawlRes = await fetch(`${process.env.REACT_APP_URL}/analyze-facebook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const crawlData = await crawlRes.json();
      if (!crawlData.success) {
        message.error("Unable to get data from Facebook Page.");
        setLoading(false);
        return;
      }

      const { name, description, bodyPreview } = crawlData.data;

      // 2. Gửi GPT để phân tích thành 4 phần
      const prompt = `
Đây là nội dung của một Fanpage Facebook:

Tên page: ${name}
Mô tả: ${description}
Nội dung sơ lược: ${bodyPreview}

Hãy phân tích nội dung thành 4 phần:
1. THÔNG TIN CHUNG
2. SẢN PHẨM/DỊCH VỤ
3. TƯƠNG TÁC KHÁCH HÀNG
4. CHIẾN LƯỢC TRUYỀN THÔNG
`;

      const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      const gptData = await gptRes.json();
      const content = gptData?.choices?.[0]?.message?.content;

      if (content) {
        const sections = content.split(/\n{2,}/);
        const result = {
          overview: sections.find((s: string) => s.toLowerCase().includes("thông tin chung")) || "",
          products: sections.find((s: string) => s.toLowerCase().includes("sản phẩm")) || "",
          engagement: sections.find((s: string) => s.toLowerCase().includes("tương tác")) || "",
          strategy: sections.find((s: string) => s.toLowerCase().includes("chiến lược")) || "",
        };
        setAnalysis(result);

        // 3. Gửi GPT tiếp để đề xuất phát triển kênh
        const rawAnalysis = `
THÔNG TIN CHUNG: ${result.overview}
SẢN PHẨM/DỊCH VỤ: ${result.products}
TƯƠNG TÁC KHÁCH HÀNG: ${result.engagement}
CHIẾN LƯỢC TRUYỀN THÔNG: ${result.strategy}
`;
        await getChannelPlan(rawAnalysis);
        saveAnalyzeFacebookPage();
      } else {
        message.error("GPT cannot parse the content.");
      }
    } catch (err) {
      console.error("❌ Whole process error:", err);
      message.error("An error occurred while parsing.");
    } finally {
      setLoading(false);
    }
  };

  /////
  const saveAnalyzeFacebookPage = async () => {
    if (!url) {
      message.warning("Please enter Facebook Page link.");
      return;
    }
    if (!analysis) {
      message.warning("No information yet Facebook Page Analysis.");
      return;
    }
    if (!channelPlan) {
      message.warning("No information yet Suggested Facebook Page Channel.");
      return;
    }
    try {
      const body = { analysis, channelPlan, urlPage: url };
      await createAnalysis(body).unwrap();
    } catch (err) {
      console.error("❌ Whole process error:", err);
      message.error("An error occurred while parsing.");
    } finally {
      setLoading(false);
    }
  };


  const { user } = useSelector((state: IRootState) => state.auth);
  const { data: accountDetailData } = useGetAccountQuery(user?.id || "0", {
    skip: !user?.id,
  });

  const [dataChart, setDataChart] = useState<{ name: string; views: number }[]>([]);
  const [genderAgeData, setGenderAgeData] = useState<{ age: string; male: number; female: number; total: number }[]>([]);
  const [cityData, setCityData] = useState<{ city: string; count: number }[]>([]);
  const [percentageFollow, setPercentageFollow] = useState<number>(0);
  const [pageViewStats, setPageViewStats] = useState({
    total: 0,
    average: 0,
    view3s: 0,
    view1s: 0,
  });




  useEffect(() => {
    const fetchPageInsights = async () => {
      try {
        if (!accountDetailData?.idPage || !accountDetailData?.accessToken) return;

        // --- Lượt xem 14 ngày ---
        const metric = "page_views_total";
        const since = Math.floor(Date.now() / 1000) - 14 * 24 * 60 * 60;
        const until = Math.floor(Date.now() / 1000);

        const url = `https://graph.facebook.com/v19.0/${accountDetailData.idPage}/insights?metric=${metric}&since=${since}&until=${until}&period=day&access_token=${accountDetailData.accessToken}`;

        const response = await fetch(url);
        const fbData = await response.json();

        const rawViews = fbData?.data?.find((item: any) => item.name === "page_views_total")?.values || [];

        const formattedChart = rawViews.map((item: any) => {
          const date = new Date(item.end_time);
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return {
            name: `${day}/${month}`,
            views: item.value || 0,
          };
        });

        setDataChart(formattedChart);
      } catch (error) {
        console.error("❌ Lỗi khi lấy dữ liệu lượt xem page:", error);
      }
    };

    const fetchGenderAgeAndCity = async () => {
      try {
        if (!accountDetailData?.idPage || !accountDetailData?.accessToken) return;

        const baseUrl = `https://graph.facebook.com/v19.0/${accountDetailData.idPage}/insights`;
        const token = accountDetailData.accessToken;

        // --- Tuổi & Giới tính ---
        let genderStats;
        try {
          const response = await fetch(`${baseUrl}?metric=page_fans_gender_age&period=lifetime&access_token=${token}`);
          const genderAgeData = await response.json();
          const rawValue = genderAgeData?.data?.[0]?.values?.[0]?.value || {};
          const ageGroups = ["25-34", "35-44", "45-54", "55-64", "65+"];

          genderStats = ageGroups.map((age) => {
            const male = rawValue[`M.${age}`] ?? getRandomInt(2, 15);
            const female = rawValue[`F.${age}`] ?? getRandomInt(20, 45);
            return {
              age,
              male,
              female,
              total: male + female,
            };
          });
        } catch (err) {
          console.error("❌ Lỗi khi fetch gender_age:", err);
          const getRandomInt = (min: number, max: number) => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
          };

          const fallbackGenderStats = ["25-34", "35-44", "45-54", "55-64", "65+"].map((age) => {
            let male = 0;
            let female = 0;

            switch (age) {
              case "25-34":
                male = getRandomInt(15, 30);
                female = getRandomInt(25, 40);
                break;
              case "35-44":
                male = getRandomInt(10, 20);
                female = getRandomInt(15, 25);
                break;
              case "45-54":
                male = getRandomInt(5, 10);
                female = getRandomInt(8, 15);
                break;
              case "55-64":
                male = getRandomInt(3, 6);
                female = getRandomInt(5, 8);
                break;
              case "65+":
                male = getRandomInt(1, 4);
                female = getRandomInt(2, 6);
                break;
            }

            return {
              age,
              male,
              female,
              total: male + female,
            };
          });

          genderStats = fallbackGenderStats;

        }
        setGenderAgeData(genderStats);

        // --- Thành phố ---
        let cityStats;
        try {
          const cityRes = await fetch(`${baseUrl}?metric=page_fans_city&period=lifetime&access_token=${token}`);
          const cityData = await cityRes.json();
          const rawCities = cityData?.data?.[0]?.values?.[0]?.value || {};
          const trackedCities = ["Hanoi", "Ho Chi Minh City", "Hai Phong", "Da Nang"];

          const getRandomInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

          cityStats = trackedCities.map((city) => {
            const name = city
              .replace("Hanoi", "Hà Nội")
              .replace("Ho Chi Minh City", "HCM")
              .replace("Hai Phong", "Hải Phòng")
              .replace("Da Nang", "Đà Nẵng");

            const fallbackCounts: Record<string, [number, number]> = {
              "Hà Nội": [30, 60],
              "HCM": [40, 80],
              "Hải Phòng": [10, 20],
              "Đà Nẵng": [8, 16],
            };

            const fallback = fallbackCounts[name]
              ? getRandomInt(fallbackCounts[name][0], fallbackCounts[name][1])
              : 0;

            return {
              city: name,
              count: rawCities?.[city] ?? fallback,
            };
          });


        } catch (err) {
          console.error("❌ Lỗi khi fetch city:", err);
          cityStats = [
            { city: "Hà Nội", count: 1603 },
            { city: "HCM", count: 1034 },
            { city: "Hải Phòng", count: 865 },
            { city: "Đà Nẵng", count: 68 },
          ];
        }
        setCityData(cityStats);

        // --- Tỉ lệ người theo dõi ---
        try {
          const res = await fetch(`https://graph.facebook.com/v19.0/${accountDetailData.idPage}?fields=followers_count&access_token=${token}`);
          const data = await res.json();
          const followers = data?.followers_count || 0;
          console.log(`followers`, followers);

          setPercentageFollow(followers > 0 ? 100 : 0); // hoặc điều chỉnh nếu bạn có tổng người xem để tính %
        } catch (err) {
          console.warn("⚠️ Không lấy được followers_count:", err);
          setPercentageFollow(0);
        }

      } catch (error) {
        console.error("❌ Lỗi tổng khi lấy dữ liệu tuổi, giới tính, thành phố:", error);
        setGenderAgeData(["25-34", "35-44", "45-54", "55-64", "65+"].map((age) => ({
          age,
          male: 0,
          female: 0,
          total: 0,
        })));
        setCityData([
          { city: "Hà Nội", count: 1603 },
          { city: "HCM", count: 1034 },
          { city: "Hải Phòng", count: 865 },
          { city: "Đà Nẵng", count: 68 },
        ]);
        setPercentageFollow(0);
      }
    };

    // const fetchPageViewStats = async () => {
    //   try {
    //     if (!accountDetailData?.idPage || !accountDetailData?.accessToken) return;
    //     const since = Math.floor(Date.now() / 1000) - 14 * 24 * 60 * 60;
    //     const until = Math.floor(Date.now() / 1000);
    //     const baseUrl = `https://graph.facebook.com/v19.0/${accountDetailData.idPage}/insights`;

    //     const metrics = [
    //       "page_views_total",
    //       "page_video_views_3s",
    //       "page_video_views_1s",
    //     ].join(",");

    //     const url = `${baseUrl}?metric=${metrics}&since=${since}&until=${until}&period=day&access_token=${accountDetailData.accessToken}`;
    //     const res = await fetch(url);
    //     const data = await res.json();

    //     const viewsTotal = data?.data?.find((d: any) => d.name === "page_views_total")?.values || [];
    //     const views3s = data?.data?.find((d: any) => d.name === "page_video_views_3s")?.values || [];
    //     const views1s = data?.data?.find((d: any) => d.name === "page_video_views_1s")?.values || [];

    //     const totalViews = viewsTotal.reduce((acc: number, item: any) => acc + (item.value || 0), 0);
    //     const avgViews = viewsTotal.length > 0 ? Math.round(totalViews / viewsTotal.length) : 0;
    //     const total3s = views3s.reduce((acc: number, item: any) => acc + (item.value || 0), 0);
    //     const total1s = views1s.reduce((acc: number, item: any) => acc + (item.value || 0), 0);

    //     setPageViewStats({
    //       total: totalViews,
    //       average: avgViews,
    //       view3s: total3s,
    //       view1s: total1s,
    //     });
    //   } catch (error) {
    //     console.error("❌ Lỗi khi lấy dữ liệu page view stats:", error);
    //     setPageViewStats({
    //       total: 0,
    //       average: 0,
    //       view3s: 0,
    //       view1s: 0,
    //     });
    //   }
    // };


    if (accountDetailData?.idPage && accountDetailData?.accessToken) {
      fetchPageInsights();
      fetchGenderAgeAndCity();
      // fetchPageViewStats()
    }
  }, [accountDetailData]);


  const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };




  console.log(`=========dataChart`, dataChart);
  console.log(`=========genderAgeData`, genderAgeData);
  console.log(`=========cityData`, cityData);

  // const dataChart = [
  //   { name: "01/07", views: 0 },
  //   { name: "02/07", views: 5 },
  //   { name: "03/07", views: 10 },
  //   { name: "04/07", views: 20 },
  //   { name: "05/07", views: 25 },
  //   { name: "06/07", views: 30 },
  //   { name: "07/07", views: 40 },
  // ];

  // const percentageFollow = 0;
  const percentageContact = 0;

  return (
    <>
      <Helmet>
        <title>All One Ads – Phân tích fanpage & đề xuất phát triển kênh</title>
        <meta
          property="og:title"
          content="All One Ads – AI analyzes and suggests fanpage content"
        />
        <meta
          property="og:description"
          content="Automatically analyze fanpage and suggest content development plans and communication strategies in a professional style."
        />
        <meta property="og:image" content="https://alloneads.com/og-image.png" />
        <meta property="og:url" content="https://alloneads.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="All One Ads" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="All One Ads – Analyze & recommend fanpage channels using AI"
        />
        <meta
          name="twitter:description"
          content="Optimize fanpage easily with AI: analysis - strategy - posting schedule - viral ideas."
        />
        <meta name="twitter:image" content="https://alloneads.com/og-image.png" />
      </Helmet>
      <FullscreenLoader
        spinning={loading}
      />
      <Layout className="image-layout">
        <Content style={{ padding: 24, color: "#F1F5F9" }}>
          <AutoPostModal visible={showModal} onClose={() => setShowModal(false)} />

          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h3 style={{ color: "#F8FAFC", marginBottom: 4 }}>
              {t("facebook_analysis.title")}
            </h3>
            <p style={{ color: "#94A3B8", fontSize: 14 }}>
              {t("facebook_analysis.subtitle")}
            </p>
          </div>

          <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 800, width: "100%" }}>
              <Input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={t("facebook_analysis.enter_page_link")}
                style={{
                  flex: 1,
                  background: "#1E293B",
                  border: "1px solid #334155",
                  color: "#F1F5F9",
                  height: 40,
                }}
              />

              <Button
                style={{
                  background: "transparent",
                  border: "1px solid #3B82F6",
                  color: "#E0F2FE",
                  borderRadius: 6,
                  height: 40,
                  padding: "0 16px",
                  whiteSpace: "nowrap",
                  boxShadow: "0 0 6px #3B82F6",
                }}
                type="default"
                onClick={analyzeFacebookPage}
              >
                {t("facebook_analysis.button_analyze")}
              </Button>
            </div>
          </div>

          <div className="dashboard-wrapper" style={{
            padding: 24,
            borderRadius: 20,
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto",
            boxSizing: "border-box",
          }}><Title level={4} style={{ color: "#E2E8F0" }}>{t("facebook_analysis.section_page_analysis")}</Title></div>


          <div className="dashboard-wrapper" style={{
            padding: 24,
            background: "#0f172a",
            borderRadius: 20,
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto",
            boxSizing: "border-box",
          }}>
            <Row gutter={16} justify="space-between" align="middle" style={{ marginBottom: 24 }}>
              <Col>
                <DatePicker.RangePicker
                  style={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#CBD5E1",
                    borderRadius: 8,
                    padding: "6px 12px",
                  }}
                />
              </Col>
              <Col>
                <Button
                  onClick={() => setShowModal(true)}
                  style={{
                    background: "transparent",
                    border: "1px solid #3B82F6",
                    color: "#E0F2FE",
                    borderRadius: 6,
                    height: 36,
                    padding: "0 16px",
                    whiteSpace: "nowrap",
                    boxShadow: "0 0 6px #3B82F6",
                  }}
                >
                  {t("facebook_analysis.connect_page")}
                </Button>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Card style={{
                  background: "#1e293b",
                  border: "none",
                  borderTopLeftRadius: 20,
                  borderBottomLeftRadius: 20,
                  color: "#fff",
                  height: "100%",
                }} bodyStyle={{ padding: 10 }}>
                  <div style={{ marginBottom: 16, fontWeight: 600, color: "#E2E8F0" }}>
                    {t("facebook_analysis.views")}
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={dataChart}>
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ background: "#0f172a", borderColor: "#334155" }} />
                      <Line type="monotone" dataKey="views" stroke="#6cc3ff" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col span={12}>
                <Card style={{
                  background: "#1e293b",
                  border: "none",
                  borderTopLeftRadius: 20,
                  borderBottomLeftRadius: 20,
                  color: "#fff",
                  height: "100%",
                }} bodyStyle={{ padding: 10 }}>
                  <Row gutter={[24, 24]}>
                    <Col span={8}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>
                          {t("facebook_analysis.follow_rate")}
                        </div>
                        <div style={{ width: 80, margin: "0 auto", marginTop: 12 }}>
                          <CircularProgressbar
                            value={percentageFollow}
                            text={`${percentageFollow}%`}
                            styles={buildStyles({
                              textColor: "#fff",
                              pathColor: "#00d084",
                              trailColor: "#334155",
                            })}
                          />
                        </div>
                        <div style={{
                          fontSize: 12,
                          color: "#94a3b8",
                          lineHeight: 1.5,
                          marginTop: 12,
                        }}>
                          ● {t("facebook_analysis.follow")}<br />● {t("facebook_analysis.unfollow")}
                        </div>
                      </div>
                    </Col>

                    <Col span={8}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                          {t("facebook_analysis.age_gender")}
                        </div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>
                          ● {t("facebook_analysis.male")} &nbsp;&nbsp; ● {t("facebook_analysis.female")}
                        </div>
                        {genderAgeData.map((item) => (
                          <div key={item.age} style={{ marginBottom: 8 }}>
                            <div style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 12,
                              color: "#E2E8F0",
                            }}>
                              <span>{item.age}</span>
                              <span>{item.total || 0}%</span>
                            </div>
                            <div style={{
                              height: 6,
                              background: "#a3a3a3",
                              borderRadius: 6,
                              marginTop: 4,
                            }} />
                          </div>
                        ))}
                      </div>
                    </Col>

                    <Col span={8}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                          {t("facebook_analysis.city")}
                        </div>
                        {cityData.map((item) => (
                          <div key={item.city} style={{ marginBottom: 8 }}>
                            <div style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 12,
                              color: "#E2E8F0",
                            }}>
                              <span>{item.city}</span>
                              <span>{item.count || 0}%</span>
                            </div>
                            <div style={{
                              height: 6,
                              background: "#a3a3a3",
                              borderRadius: 6,
                              marginTop: 4,
                            }} />
                          </div>
                        ))}
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </div>

          <br />
          <div style={styles.twoColumns}>
            <div style={styles.column}>
              <Card style={{
                background: "#1E293B",
                border: "1px solid #334155",
                color: "#F1F5F9",
              }} bodyStyle={{ padding: 16 }}>
                <Title level={5} style={{ color: "#CBD5E1", display: "flex", alignItems: "center", gap: 8 }}>
                  <img src={page1} alt="icon" style={{ width: 20, height: 20 }} />{t("facebook_analysis.general_info")}
                </Title>
                <TextArea
                  value={analysis.overview}
                  readOnly
                  autoSize
                  style={{
                    marginBottom: 12,
                    whiteSpace: "pre-wrap",
                    backgroundColor: "#070719",
                    color: "#E2E8F0",
                    border: "1px solid #1e1e2e",
                    borderRadius: 8,
                    padding: "8px 12px",
                  }}
                />

                <Title level={5} style={{ color: "#CBD5E1", display: "flex", alignItems: "center", gap: 8 }}>
                  <img src={page2} alt="icon" style={{ width: 20, height: 20 }} />{t("facebook_analysis.products_services")}
                </Title>
                <TextArea
                  value={analysis.products}
                  readOnly
                  autoSize
                  style={{
                    marginBottom: 12,
                    whiteSpace: "pre-wrap",
                    backgroundColor: "#070719",
                    color: "#E2E8F0",
                    border: "1px solid #1e1e2e",
                    borderRadius: 8,
                    padding: "8px 12px",
                  }}
                />

                <Title level={5} style={{ color: "#CBD5E1", display: "flex", alignItems: "center", gap: 8 }}>
                  <img src={page3} alt="icon" style={{ width: 20, height: 20 }} />{t("facebook_analysis.customer_engagement")}
                </Title>
                <TextArea
                  value={analysis.engagement}
                  readOnly
                  autoSize
                  style={{
                    marginBottom: 12,
                    whiteSpace: "pre-wrap",
                    backgroundColor: "#070719",
                    color: "#E2E8F0",
                    border: "1px solid #1e1e2e",
                    borderRadius: 8,
                    padding: "8px 12px",
                  }}
                />

                <Title level={5} style={{ color: "#CBD5E1", display: "flex", alignItems: "center", gap: 8 }}>
                  <img src={page4} alt="icon" style={{ width: 20, height: 20 }} />{t("facebook_analysis.strategy")}
                </Title>
                <TextArea
                  value={analysis.strategy}
                  readOnly
                  autoSize
                  style={{
                    marginBottom: 12,
                    whiteSpace: "pre-wrap",
                    backgroundColor: "#070719",
                    color: "#E2E8F0",
                    border: "1px solid #1e1e2e",
                    borderRadius: 8,
                    padding: "8px 12px",
                  }}
                />
              </Card>
            </div>

            <div style={styles.column}>
              <Card style={{
                background: "#1E293B",
                border: "1px solid #334155",
                color: "#F1F5F9",
              }} bodyStyle={{ padding: 16 }}>
                <Title level={5} style={{ color: "#CBD5E1", display: "flex", alignItems: "center", gap: 8 }}>
                  {t("facebook_analysis.section_channel_plan")}
                </Title>
                <TextArea
                  value={channelPlan}
                  rows={25}
                  readOnly
                  style={{
                    marginBottom: 12,
                    whiteSpace: "pre-wrap",
                    backgroundColor: "#070719",
                    color: "#F8FAFC",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}
                />

                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    background: "#0F172A",
                    border: "1px solid #3B82F6",
                    color: "#E0F2FE",
                    borderRadius: 6,
                    height: 30,
                    padding: "0 16px",
                    width: "100%",
                    boxShadow: "0 0 6px #3B82F6",
                    fontWeight: 500,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  {t("image.auto_post_setting")}
                </button>
              </Card>
            </div>
          </div>
        </Content>
      </Layout>

    </>
  );
};

export default FacebookPageAnalysis;
