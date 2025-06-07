import {
  FinancialTransactionReportSuccessGroupEnum,
  FinancialTransactionReportTotalGroupEnum,
} from "src/enums/financial-transaction-reports.enum";

export interface IFinancialTransactionReportPeriodTotalValue {
  transactionQuantity: string;
  transactionValue: string;
  numOfUser: string;
}

export interface IFinancialTransactionReportFilter {
  where: {
    type: string;
    dateFilterType: string;
    startDate: string;
    endDate: string;
  };
}

export interface IPeriodTotalValue {
  totalUserCount: string;
  totalCount: string;
  totalAmount: string;
  userCountSuccess: string;
  totalCountSuccess: string;
  totalAmountSuccess: string;
  userCountFailed: string;
  totalCountFailed: string;
  totalAmountFailed: string;
  percentageTotalCountSuccess: string;
  percentageTotalAmountSuccess: string;
  percentageUserCountSuccess: string;
  percentageTotalCountFailed: string;
  percentageTotalAmountFailed: string;
  percentageUserCountFailed: string;
}

export interface IFinancialTransactionReportTotalRow {
  week: IFinancialTransactionReportPeriodTotalValue;
  month: IFinancialTransactionReportPeriodTotalValue;
  cumulative: IFinancialTransactionReportPeriodTotalValue;
  target: FinancialTransactionReportTotalGroupEnum;
}

export interface IFinancialTransactionReportTotal {
  week: IPeriodTotalValue;
  month: IPeriodTotalValue;
  cumulative: IPeriodTotalValue;
}

export interface IPeriodSuccessValueInner {
  totalAmount: string;
  totalAmountSuccess: string;
  totalCount: string;
  totalCountSuccess: string;
  totalUserCount: string;
  userCountSuccess: string;
  percentageUserCountSuccess: string;
  percentageTotalAmountSuccess: string;
  percentageTotalCountSuccess: string;
}

export interface IPeriodSuccessType {
  [FinancialTransactionReportSuccessGroupEnum.TOTAL]: IPeriodSuccessValueInner;
  [FinancialTransactionReportSuccessGroupEnum.BILLING]: IPeriodSuccessValueInner;
  [FinancialTransactionReportSuccessGroupEnum.CASHOUT]: IPeriodSuccessValueInner;
  [FinancialTransactionReportSuccessGroupEnum.DEPOSIT]: IPeriodSuccessValueInner;
  [FinancialTransactionReportSuccessGroupEnum.PAY]: IPeriodSuccessValueInner;
  [FinancialTransactionReportSuccessGroupEnum.SALARY_PAYMENT]: IPeriodSuccessValueInner;
  [FinancialTransactionReportSuccessGroupEnum.TOP_UP]: IPeriodSuccessValueInner;
  [FinancialTransactionReportSuccessGroupEnum.WALLET_TRANSFER]: IPeriodSuccessValueInner;
}

export interface IFinancialTransactionReportSuccess {
  week: IPeriodSuccessType;
  month: IPeriodSuccessType;
  cumulative: IPeriodSuccessType;
}

export interface IFinancialTransactionReportPeriodSuccessCol {
  transactionQuantity: { quantity: string; percent: string };
  transactionValue: { quantity: string; percent: string };
  numOfUser: { quantity: string; percent: string };
}

export interface IFinancialTransactionReportSuccessRow {
  index: string;
  week: IFinancialTransactionReportPeriodSuccessCol;
  month: IFinancialTransactionReportPeriodSuccessCol;
  cumulative: IFinancialTransactionReportPeriodSuccessCol;
  target: FinancialTransactionReportSuccessGroupEnum;
  children?: IFinancialTransactionReportSuccessRow[];
}

export interface IFinancialTransactionReportSuccessChart {
  totalUser: string;
  totalUserTransactions: string;
  totalUserPay: string;
  totalUserCashOut: string;
  percentageCashOut: string;
  percentagePay: string;
  percentageUser: string;
}

export interface IPeriodFailedValue {
  orderErrorMess: string;
  count: string;
  percentage: string;
}

export interface IPeriodFailedRowValue {
  count: string;
  percentage: string;
}

export interface IFinancialTransactionReportFailed {
  week: IPeriodFailedValue[];
  month: IPeriodFailedValue[];
  cumulative: IPeriodFailedValue[];
}

export interface IFinancialTransactionReportFailedRow {
  index: string;
  target: string;
  week?: IPeriodFailedRowValue;
  month?: IPeriodFailedRowValue;
  cumulative?: IPeriodFailedRowValue;
  children?: IFinancialTransactionReportFailedRow[];
}
