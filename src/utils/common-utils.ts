import {
  TIME_FILTER_TYPE_DAY,
  TIME_FILTER_TYPE_MONTH,
  TIME_FILTER_TYPE_VALUES,
  TIME_FILTER_TYPE_WEEK,
} from "src/constants/common.constants";

export const buildQueryString = (
  obj: any,
  page = 1,
  prefix: string = "filter",
  defaultPage: number = 1
): string => {
  const queryParts: string[] = [];
  const buildQueryParams = (prefix: string, obj: any): void => {
    if (obj === null || obj === undefined) {
      return;
    }
    if (Object.keys(obj).length === 0) {
      return;
    }
    // Xử lý trường hợp filter không có page, thêm page=1
    if (prefix === "filter" && !obj.hasOwnProperty("page")) {
      queryParts.push(`filter[page]=${page}`);
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const newPrefix =
          prefix === "filter" ? `${prefix}[${key}]` : `${prefix}[${key}]`;

        if (value === null || value === undefined) {
          continue;
        }

        if (typeof value === "object" && !Array.isArray(value)) {
          if (Object.keys(value).length > 0) {
            buildQueryParams(newPrefix, value);
          }
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            buildQueryParams(`${prefix}[${key}][${index}]`, item);
          });
        } else {
          queryParts.push(
            `${encodeURIComponent(newPrefix)}=${encodeURIComponent(value)}`
          );
        }
      }
    }
  };
  buildQueryParams(prefix, obj);
  return queryParts.join("&");
};

export const getDatePickerType = (
  type: (typeof TIME_FILTER_TYPE_VALUES)[number]
) => {
  switch (type) {
    case TIME_FILTER_TYPE_DAY:
    case TIME_FILTER_TYPE_WEEK:
      return "month";
    case TIME_FILTER_TYPE_MONTH:
      return "year";
    default:
      return "date";
  }
};

export const getDateFormat = (
  type: (typeof TIME_FILTER_TYPE_VALUES)[number]
) => {
  switch (type) {
    case TIME_FILTER_TYPE_DAY:
    case TIME_FILTER_TYPE_WEEK:
      return "MM/YYYY";
    case TIME_FILTER_TYPE_MONTH:
      return "YYYY";
    default:
      return "DD/MM/YYYY";
  }
};
