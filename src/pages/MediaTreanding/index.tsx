import React, { useState } from "react";
import { Layout, Modal, Empty } from "antd";
import { Content } from "antd/es/layout/layout";
import Masonry from "react-masonry-css";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import { useGetCasesQuery } from "src/store/api/ticketApi";
import { useTranslation } from "react-i18next";
import "./styles.scss";
import dayjs from "dayjs";

const MediaTrending: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [filter, setFilter] = useState<any>({ page: 1, pageSize: 30 });

  const { t } = useTranslation();
  const { data } = useGetCasesQuery(filter);

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
                        {(item.caption?.length > 50
                          ? item.caption.slice(0, 50) + "..."
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

          {/* Modal xem chi tiết */}
          <Modal
            open={isModalOpen}
            onCancel={handleCloseModal}
            footer={null}
            centered
            width={800}
            bodyStyle={{ background: "#000", padding: 0 }}
          >
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
                <div style={{ padding: "12px 16px", color: "#fff" }}>
                  <p style={{ fontWeight: 600, fontSize: 16 }}>{selectedItem.caption}</p>
                  <p style={{ fontSize: 13, opacity: 0.7 }}>

                    {dayjs(selectedItem.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                  </p>
                  {/* <p style={{ fontSize: 13, opacity: 0.5 }}>
                    👤 {selectedItem.createdBy || "Không rõ"}
                  </p> */}
                </div>
              </>
            )}
          </Modal>
        </Content>
      </Layout>
    </PageTitleHOC>
  );
};

export default MediaTrending;
