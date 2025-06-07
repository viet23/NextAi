import { UserGrowthReportGroupEnum } from "src/enums/user-growth-reports.enum";

type PeriodType = "week" | "month" | "cumulative";

export interface IPeriodValueType {
  statusGroup: UserGrowthReportGroupEnum;
  count: string;
}
export interface IUserGrowthReportRow {
  index?: string;
  week: number;
  month: number;
  cumulative: number;
  target: PeriodType[number];
  children?: IUserGrowthReportRow[] | {};
}
export interface IUserGrowthReport {
  [k: PeriodType[number]]: IPeriodValueType[];
}

export interface IUserGrowthReportFilter {
  where: {
    type?: string;
    dateFilterType: string;
    startDate: string;
    endDate: string;
  };
}
