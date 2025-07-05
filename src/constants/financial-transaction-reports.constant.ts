export const REPORT_TYPE_TOTAL = "TOTAL";
export const REPORT_TYPE_SUCCESS = "SUCCESS";
export const REPORT_TYPE_FAILED = "FAILED";
export const REPORT_TYPES = [
  {
    label: "BC tổng",
    value: REPORT_TYPE_TOTAL,
  },
  {
    label: "BC giao dịch thành công",
    value: REPORT_TYPE_SUCCESS,
  },
  {
    label: "BC giao dịch thất bại",
    value: REPORT_TYPE_FAILED,
  },
];
export const REPORT_TYPE_VALUES = REPORT_TYPES.map(x => x.value);

export const CHART_FILTER_WEEK = "week";
export const CHART_FILTER_MONTH = "month";
export const CHART_FILTER_CUMULATIVE = "cumulative";
export const CHART_FILTERS = [
  {
    label: "Biến động trong kỳ",
    value: CHART_FILTER_WEEK,
  },
  {
    label: "Luỹ kế tháng",
    value: CHART_FILTER_MONTH,
  },
  {
    label: "Luỹ kế tổng",
    value: CHART_FILTER_CUMULATIVE,
  },
] as const;
export const CHART_FILTER_VALUES = [...CHART_FILTERS.map(x => x.value)] as const;

export const EXPORT_FILE_NAME = "Báo cáo giao dịch tài chính.xlsx";
export const EXPORT_FILE_NAME_STATE = "Báo cáo ngân hàng nhà nước.xlsx";
export const EXPORT_FILE_NAME_TICKET = "Ticket.xlsx";
export const EXPORT_FILE_NAME_REPORT_TICKET = "Báo cáo lỗi ticket.xlsx";
export const FINANCIAL_TRANSACTION_FAILED_POPULAR_ERRORS = "Các lỗi phổ biến";
export const FINANCIAL_TRANSACTION_FAILED_ANOTHER_ERRORS = "Khác";
