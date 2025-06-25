import React, { useEffect, useState } from "react";
import {
  Typography,
  Select,
  Input,
  Button,
  Row,
  Col,
  Slider,
  Switch,
  DatePicker,
  InputNumber,
  message,
  Card,
  Image,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useLazyDetailCaseQuery } from "src/store/api/ticketApi";
import { useCreateAdsMutation } from "src/store/api/facebookApi";
import LocationPicker from "./location";
const { Option, OptGroup } = Select;

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const usdToVndRate = 25000;

const DETAILED_TARGETING_OPTIONS = [
  {
    category: 'Nhân khẩu học',
    values: ['Học vấn', 'Công việc', 'Mối quan hệ', 'Phụ huynh', 'Sự kiện trong đời'],
  },
  {
    category: 'Sở thích',
    values: ['Thời trang', 'Công nghệ', 'Ẩm thực', 'Thể thao', 'Sức khỏe', 'Du lịch'],
  },
  {
    category: 'Hành vi',
    values: ['Mua hàng online', 'Dùng thiết bị iOS', 'Người hay di chuyển'],
  },
];


interface AdsFormProps {
  id: string | null;
  detailMedia: string | null;
  detailCaption: string | null;
  onRefetch: () => void;
}

const DetailAds: React.FC<AdsFormProps> = ({ id, detailMedia, detailCaption , onRefetch}) => {
  // Form state
  const [goal, setGoal] = useState("message");
  const [caption, setCaption] = useState("");
  const [aiTargeting, setAiTargeting] = useState(true);
  const [gender, setGender] = useState("all");
  const [age, setAge] = useState<[number, number]>([18, 65]);
  const [interests, setInterests] = useState(['Sức khỏe']);
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs(),
    dayjs().add(5, "day"),
  ]);
  const [location, setLocation] = useState({ lat: 21.023556274318445, lng: 105.55110069580077 });
  const [radius, setRadius] = useState(16000); // 16km


  const [budget, setBudget] = useState(2);
  const [campaignName, setCampaignName] = useState("Generated Campaign");
  const [createAds, { isLoading: creatingCase }] = useCreateAdsMutation();

  const handlePublish = async () => {
    try {
      const body: any = {
        goal,
        campaignName,
        caption,
        aiTargeting: Boolean(aiTargeting),
        startTime: range[0].toISOString(),
        endTime: range[1].toISOString(),
        dailyBudget: Math.round(Number(budget) * usdToVndRate),
        postId: id?.toString(),
      };

      if (aiTargeting) {
        body.gender = gender;
        body.ageRange = [age[0], age[1]];
        body.location = location;
        body.radius = radius;
        body.detailedTargeting = interests;
      }

      const res = await createAds(body).unwrap();
      message.success("Ad created successfully!");
      console.log("Ad Created:", res.data);
      window.location.reload();
    } catch (err: any) {
      // ✅ Nếu có message cụ thể từ backend thì hiện ra
      const errorMessage =
        err?.data?.message || err?.message || "Failed to create ad.";
      message.error(errorMessage);
      console.error("🛑 Create Ads Error:", err);
    }
  };



  return (
    <Card style={{ backgroundColor: "#f9f9f9", borderRadius: 12 }}>
      <Row gutter={32}>
        <Col xs={24} md={14}>
          <Title level={4}>Create Ads</Title>
          <div style={{ marginBottom: 12 }}>
            <label>📛 Campaign Name</label>
            <Input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Enter campaign name"
            />
          </div>


          <div style={{ marginBottom: 12 }}>
            <label>🎯 Ads Goal</label>
            <Select value={goal} onChange={setGoal} style={{ width: "100%" }}>
              <Select.Option value="message">Get more message</Select.Option>
              <Select.Option value="engagement">Get more engagement</Select.Option>
              <Select.Option value="leads">Get more leads</Select.Option>
              <Select.Option value="traffic">Get more website visitor</Select.Option>
            </Select>
          </div>


          {/* <div style={{ marginBottom: 12 }}>
            <label>📝 Ads Text</label>
            <Input.TextArea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div> */}

          <div style={{ marginBottom: 12 }}>
            <label>👥 Audience</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>AI targeting</span>
              <Switch checked={aiTargeting} onChange={setAiTargeting} />
            </div>
          </div>

          {aiTargeting && (
            <>
              <Row gutter={12} style={{ marginBottom: 12 }}>
                <Col span={12}>
                  <label>Gender</label>
                  <Select value={gender} onChange={setGender} style={{ width: "100%" }}>
                    <Select.Option value="all">All</Select.Option>
                    <Select.Option value="male">Men</Select.Option>
                    <Select.Option value="female">Women</Select.Option>
                  </Select>
                </Col>
                <Col span={12}>
                  <label>Age</label>
                  <Slider
                    range
                    value={age}
                    onChange={(val) => setAge(val as [number, number])}
                    min={13}
                    max={65}
                  />
                </Col>
              </Row>

              <div style={{ marginBottom: 12 }}>
                <LocationPicker
                  location={location}
                  setLocation={setLocation}
                  radius={radius}
                  setRadius={setRadius}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label>🎯 Detailed Targeting</label>
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder="Chọn nhóm mục tiêu"
                  value={interests}
                  onChange={setInterests}
                  optionLabelProp="label"
                >
                  {DETAILED_TARGETING_OPTIONS.map((group) => (
                    <OptGroup key={group.category} label={group.category}>
                      {group.values.map((value) => (
                        <Option key={value} value={value} label={value}>
                          {value}
                        </Option>
                      ))}
                    </OptGroup>
                  ))}
                </Select>
              </div>
            </>
          )}

          <Row gutter={12} style={{ marginBottom: 12 }}>
            <Col span={12}>
              <label>📆 Duration</label>
              <RangePicker
                value={range}
                onChange={(val) => setRange(val as [dayjs.Dayjs, dayjs.Dayjs])}
                style={{ width: "100%" }}
              />
            </Col>
            <Col span={12}>
              <label>💰 Daily Budget ($)</label>
              <InputNumber
                value={budget}
                onChange={(val) => setBudget(val!)}
                min={1}
                formatter={(value) => `$ ${value}`}
                style={{ width: "100%" }}
              />
            </Col>
          </Row>

          <Button type="primary" block onClick={handlePublish}>
            Publish
          </Button>
        </Col>

        <Col xs={24} md={10}>
          <Card title="Preview" bordered>
            <div style={{ border: "1px solid #eee", padding: 10 }}>
              <div style={{ fontWeight: "bold" }}>{detailCaption}</div>
              {/* Media Preview (ảnh lớn, có fallback nếu lỗi hoặc không có ảnh) */}
              {detailMedia ? (
                <Image
                  width="100%"
                  src={detailMedia}
                  alt="media"
                  style={{ borderRadius: 8 }}
                  fallback="https://via.placeholder.com/600x400?text=No+Image"
                />
              ) : (
                <Image
                  width="100%"
                  src="https://via.placeholder.com/600x400?text=No+Image"
                  alt="no image"
                  style={{ borderRadius: 8 }}
                />
              )}

              <Button block style={{ marginTop: 10 }}>
                Send Message
              </Button>
            </div>
          </Card>
        </Col>

      </Row>
    </Card>
  );
};

export default DetailAds;
