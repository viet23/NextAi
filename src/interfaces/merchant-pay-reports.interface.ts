export interface IMerchantPayReportFilter {
  where: {
    dateFilterType: string;
    startDate: string;
    endDate: string;
  };
}

export interface IMerchantPayReport {}

export interface IMerchantPayReportRow {
  target: string;
  week: string;
  month: string;
  cumulative: string;
}
