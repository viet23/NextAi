import React, { useState } from "react";
import { Layout, Modal, Empty } from "antd";
import { Content } from "antd/es/layout/layout";
import Masonry from "react-masonry-css";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import { useGetCasesAllQuery } from "src/store/api/ticketApi";
import { useTranslation } from "react-i18next";
import "./styles.scss";
import dayjs from "dayjs";

const MediaTrending: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [filter, setFilter] = useState<any>({ page: 1, pageSize: 30 });

  const { t } = useTranslation();
  const { data } = useGetCasesAllQuery(filter);

  const mediaItems = data?.data || [];

  const handleOpenModal = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const breakpointColumnsObj = {
    default: 5,
    1600: 4,
    1200: 3,
    800: 2,
    500: 1,
  };

  return (
    <PageTitleHOC title={t("media_ls.title")}>
      <Layout className="image-layout">
        <Content style={{ padding: 24 }}>
          {mediaItems.length === 0 ? (
            <Empty description={t("media_ls.empty")} />
          ) : (
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="masonry-grid"
              columnClassName="masonry-column"
            >
              {mediaItems.map((item: any, index: number) => {
                const url = item.urlVideo;
                const isVideo = /\.(mp4|webm|ogg)(\?|$)/i.test(url);

                return (
                  <div
                    className="media-card"
                    key={index}
                    onClick={() => handleOpenModal(item)}
                  >
                    {isVideo ? (
                      <video
                        src={url}
                        className="media-thumb"
                        style={{ objectFit: "cover" }}
                        muted
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={url}
                        alt={item.caption || "media"}
                        className="media-thumb"
                      />
                    )}
                    {item.views && (
                      <div className="overlay">
                        {item.views.toLocaleString()} 👁️
                      </div>
                    )}
                    <div className="media-info">
                      <p className="title">
                        {(item.caption?.length > 35
                          ? item.caption.slice(0, 35) + "..."
                          : item.caption) || "(Không có mô tả)"}
                      </p>

                      <p className="meta">
                        {dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                      </p>
                      {/* <p className="creator">👤 {item.createdBy || "Không rõ"}</p> */}
                    </div>
                  </div>
                );
              })}
            </Masonry>
          )}




        </Content>
      </Layout>
      {/* Modal xem chi tiết */}
      <Modal
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        centered
        width={800}
        closable={false} // Tắt nút X mặc định để dùng custom
        maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
        modalRender={(node) => (
          <div
            style={{
              backgroundColor: "#1a1a1a",
              color: "#fff",
              borderRadius: 8,
              overflow: "hidden",
              position: "relative",
              paddingTop: 40,  // tạo khoảng cách với nút X
              paddingRight: 16, // tránh dính viền
              paddingLeft: 16,
              paddingBottom: 16,
            }}
          >
            {/* Nút X ở góc trên bên phải */}
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 10,
                cursor: "pointer",
                color: "#fff",
                fontSize: 20,
              }}
              onClick={handleCloseModal}
            >
              ✖
            </div>

            {/* Nội dung modal */}
            {selectedItem && (
              <>
                {/\.(mp4|webm|ogg)(\?|$)/i.test(selectedItem.urlVideo) ? (
                  <video
                    src={selectedItem.urlVideo}
                    controls
                    autoPlay
                    style={{ width: "100%", borderRadius: 8 }}
                  />
                ) : (
                  <img
                    src={selectedItem.urlVideo}
                    alt="media"
                    style={{ width: "100%", borderRadius: 8 }}
                  />
                )}
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontWeight: 600, fontSize: 16 }}>{selectedItem.caption}</p>
                  <p style={{ fontSize: 13, opacity: 0.7 }}>
                    {dayjs(selectedItem.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      />


    </PageTitleHOC>

  );
};

export default MediaTrending;
