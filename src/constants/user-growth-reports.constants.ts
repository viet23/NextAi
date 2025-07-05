export const REPORT_TYPE_BY_CREATED_DATE = "CREATE";
export const REPORT_TYPE_BY_UPDATED_DATE = "UPDATE";
export const REPORT_TYPES = [
  {
    label: "Báo cáo flow",
    value: REPORT_TYPE_BY_CREATED_DATE,
  },
  {
    label: "Báo cáo cut off",
    value: REPORT_TYPE_BY_UPDATED_DATE,
  },
];
export const REPORT_TYPE_VALUES = REPORT_TYPES.map(x => x.value);

export const EXPORT_FILE_NAME = "Báo cáo hoạt động ví.xlsx";
