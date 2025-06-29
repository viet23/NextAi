import { EyeOutlined } from "@ant-design/icons";
import {
  Button, Card, Col, Drawer, Empty, Flex, Image, Pagination, Radio, RadioChangeEvent, Row, Table, Tooltip,
} from "antd";
import React, { useState } from "react";
import DetailTicket from "src/components/DetailTicket";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import { useGetCasesQuery } from "src/store/api/ticketApi";
import { ReactComponent as RefetchIcon } from "src/assets/images/icon/ic-refetch.svg";
import { useTranslation } from "react-i18next";

const MediaList: React.FC<any> = () => {
  const [detailId, setDetailId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSuspect, setIsSuspect] = useState(false);
  const [filter, setFilter] = useState<any>({ page: 1, pageSize: 10 });

  const { data, refetch } = useGetCasesQuery(filter);

  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  const currentFlag = i18n.language === 'vi'
    ? '/VN.png' // icon cờ Việt Nam
    : '/EN.png'; // icon cờ Anh

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
        const where = prev?.where
          ? { ...prev.where, isSuspect: 1 }
          : { isSuspect: 1 };
        return { ...prev, page: 1, pageSize: 20, where };
      });
    }
  };

  const handleOnClickDetail = (record: any) => {
    console.log(`record` ,record);
    
    setDetailId(record?.id);
    setIsOpen(true);
  };

  const handleOnCloseDrawer = () => {
    setDetailId(null);
    setIsOpen(false);
  };

  return (
    <PageTitleHOC title={t("media_ls.title")}>
      <div style={{ textAlign: "right", marginBottom: 12 }}>
        <Button
          onClick={toggleLanguage}
          shape="circle"
          style={{ width: 32, height: 32, padding: 0 }}
        >
          <img
            src={currentFlag}
            alt="flag"
            style={{ width: 20, height: 20, borderRadius: "50%" }}
          />
        </Button>
      </div>

      <div className="layout-content">
        <Row gutter={[24, 0]}>
          <Col xs="24" xl={24}>
            <Card
              bordered={false}
              className="criclebox tablespace mb-24"
              title={t("media_ls.card_title")}
              extra={
                <Radio.Group
                  onChange={handleOnChangeRadio}
                  defaultValue="all"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <Button
                    type="primary"
                    style={{
                      marginLeft: 8,
                      backgroundColor: "#1890ff",
                      borderColor: "#1890ff",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    icon={<RefetchIcon />}
                    onClick={handleReset}
                  />
                </Radio.Group>
              }
            >
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
                    render: (url) => {
                      if (!url) {
                        return <Image width={250} src="https://via.placeholder.com/60" alt="No media" />;
                      }

                      const isVideo = /\.(mp4|webm|ogg)(\?|$)/i.test(url); // kiểm tra đuôi video có hoặc không có query params

                      return isVideo ? (
                        <video width={250} height={200} controls>
                          <source src={url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <Image width={250} src={url} alt="media" />
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
                rowClassName={(record: any) =>
                  record?.isSuspect ? "suspect-row" : ""
                }
                dataSource={data?.data || []}
                pagination={false}
                locale={{
                  emptyText: <Empty description={t("media_ls.empty")} />,
                }}
                className="ant-border-space"
                scroll={{ x: "max-content" }}
              />
              <Flex vertical style={{ paddingTop: 20, paddingBottom: 20 }}>
                <Pagination
                  pageSize={filter.pageSize}
                  current={filter.page}
                  total={data?.total || 0}
                  onChange={onChangePagination}
                  showSizeChanger
                  pageSizeOptions={["10", "20", "50", "100"]}
                  onShowSizeChange={(current, size) =>
                    onChangePagination(current, size)
                  }
                />
              </Flex>
            </Card>
          </Col>
        </Row>

        <Drawer
          open={isOpen}
          onClose={handleOnCloseDrawer}
          width={"70%"}
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
    </PageTitleHOC>
  );
};

export default MediaList;
