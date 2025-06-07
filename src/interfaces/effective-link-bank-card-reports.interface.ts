export interface IEffectiveBankCardReportFilter {
  where: {
    dateFilterType: string;
    startDate: string;
    endDate: string;
  };
}

export interface IEffectiveBankCardReport {}

export interface IEffectiveBankCardReportPeriodValue {
  quantity: string;
  percent: string;
}

export interface IEffectiveBankCardReportRow {
  target: string;
  week: IEffectiveBankCardReportPeriodValue;
  month: IEffectiveBankCardReportPeriodValue;
  cumulative: IEffectiveBankCardReportPeriodValue;
}
