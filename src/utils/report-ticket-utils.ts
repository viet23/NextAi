import { keyTotal } from "src/constants/ticket.constants";

interface TicketData {
  title: string;
  titleTotal: number;
  features: FeatureData[];
  [key: `titleTotal${number}`]: any;
}

interface FeatureData {
  feature: string;
  featureTotal: number;
  featureDetails: FeatureDetail[];
  [key: `featureTotal${number}`]: any;
}

interface FeatureDetail {
  featureDetails: string;
  totalReports: number;
  [key: `totalReports${number}`]: any;
}

interface TableData {
  key: string;
  title?: string;
  feature?: string;
  featureDetails?: string;
  totalReports?: number;
  children?: TableData[];
  [key: `totalReports${number}`]: any;
}
export const processDataTicket = (
  apiData: TicketData[],
  grandTotal: number,
  totalColumns: number
): TableData[] => {
  const processedList: TableData[] = [];

  // Tạo dòng tổng cộng tất cả
  const grandTotalRow: TableData = {
    key: "grandTotal",
    title: "Tổng tất cả",
    totalReports: grandTotal,
  };

  // Thêm tổng số báo cáo theo tháng (1-12)
  for (let month = 1; month <= totalColumns; month++) {
    grandTotalRow[`${keyTotal}${month}`] =
      apiData.reduce((sum, item) => sum + (item[`titleTotal${month}`] || 0), 0) || "-";
  }

  processedList.push(grandTotalRow);

  apiData.forEach((item, titleIndex) => {
    const featureChildren = item.features.map((feature, featureIndex) => {
      const children = feature.featureDetails.map((detail, detailIndex) => ({
        key: `detail-${titleIndex}-${featureIndex}-${detailIndex}`,
        featureDetails: detail.featureDetails,
        totalReports: detail.totalReports,
        ...Object.fromEntries(
          Array.from({ length: totalColumns }, (_, month) => [
            `totalReports${month + 1}`,
            detail[`totalReports${month + 1}`] || "-",
          ])
        ),
      }));

      return {
        key: `feature-${titleIndex}-${featureIndex}`,
        feature: feature.feature,
        totalReports: feature.featureTotal,
        children,
        ...Object.fromEntries(
          Array.from({ length: totalColumns }, (_, month) => [
            `totalReports${month + 1}`,
            feature[`featureTotal${month + 1}`] || "-",
          ])
        ),
      };
    });

    processedList.push({
      key: `title-${titleIndex}`,
      title: item.title,
      totalReports: item.titleTotal,
      children: featureChildren,
      ...Object.fromEntries(
        Array.from({ length: totalColumns }, (_, month) => [
          `totalReports${month + 1}`,
          item[`titleTotal${month + 1}`] || "-",
        ])
      ),
    });
  });

  return processedList;
};
