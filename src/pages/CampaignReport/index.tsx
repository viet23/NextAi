import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import CampaignReport from "src/components/CampaignReport";

const CampaignReportss = () => {
  const { t } = useTranslation();

  useEffect(() => {
    // Bạn có thể thêm logic khi mount nếu cần
  }, []);

  return (
    <PageTitleHOC title={`${t("menu.ads_report")}`}>
      <CampaignReport />
    </PageTitleHOC>
  );
};

export default CampaignReportss;
