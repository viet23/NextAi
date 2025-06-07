export interface IAffiliatedBankReportFilter {
  where: {
    dateFilterType: string;
    startDate: string;
    endDate: string;
  };
}

export interface IAffiliatedBankReportPeriodInnerValue {
  bankName: string;
  count: string;
  gpBankCode: string;
  percentage: string;
}

export interface IAffiliatedBankReportPeriodValue {
  data: IAffiliatedBankReportPeriodInnerValue[];
  total: string;
  count: string;
}

export interface IAffiliatedBankReport {
  week: IAffiliatedBankReportPeriodValue;
  month: IAffiliatedBankReportPeriodValue;
  cumulative: IAffiliatedBankReportPeriodValue;
}

export interface IAffiliatedBankReportPeriodRowValue {
  count: string;
  percentage: string;
}

export interface IAffiliatedBankReportRow {
  index: string;
  target: string;
  week: IAffiliatedBankReportPeriodRowValue;
  month: IAffiliatedBankReportPeriodRowValue;
  cumulative: IAffiliatedBankReportPeriodRowValue;
  children?: IAffiliatedBankReportRow[];
}
