export const DEFAULT_PAGE_SIZE = 20;
export const FULL_DATE_FORMAT = "DD/MM/YYYY";
export const MONTH_YEAR_FORMAT = "MM/YYYY";
export const FULL_DATE_FORMAT_PARAM = "YYYY-MM-DD";
export const TIME_FILTER_TYPE_DEFAULT = 0;
export const TIME_FILTER_TYPE_DAY = 1;
export const TIME_FILTER_TYPE_WEEK = 2;
export const TIME_FILTER_TYPE_MONTH = 3;
export const TIME_FILTER_TYPES = [
  { label: "Tuỳ chọn", value: TIME_FILTER_TYPE_DEFAULT },
  { label: "Ngày", value: TIME_FILTER_TYPE_DAY },
  { label: "Tuần", value: TIME_FILTER_TYPE_WEEK },
  { label: "Tháng", value: TIME_FILTER_TYPE_MONTH },
];
export const TIME_FILTER_TYPE_VALUES = TIME_FILTER_TYPES.map((x) => x.value);

export const ZERO_VALUES = ["0", "0.00"];
