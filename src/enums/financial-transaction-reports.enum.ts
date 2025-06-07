export enum FinancialTransactionReportTotalGroupEnum {
  TOTAL_TRANSACTION = "Tổng số giao dịch",
  SUCCESS_TRANSACTION = "Tổng số giao dịch thành công",
  PERCENT_SUCCESS_TRANSACTION = "% Giao dịch thành công",
  FAILED_TRANSACTION = "Tổng số giao dịch thất bại",
  PERCENT_FAILED_TRANSACTION = "% Giao dịch thất bại",
}

export enum FinancialTransactionReportSuccessGroupEnum {
  TOTAL = "total",
  SALARY_PAYMENT = "salaryPayment", // Nhận chi lương
  DEPOSIT = "deposit", // Nạp tiền
  WALLET_TRANSFER = "walletTransfer", // Chuyển khoản ví - ví
  CASHOUT = "cashOut", // Rút tiền
  PAY = "pay", // Thanh toán
  TOP_UP = "topUp",
  BILLING = "billing",
}

export enum FinancialTransactionReportFailedReasonGroupEnum {
  APP = "Lỗi do APP",
  CONNECT = "Lỗi do kết nối",
  TECHNICAL = "Lỗi do Kỹ thuật",
  NCC = "Lỗi do Vận hành",
  SYSTEM = "Lỗi do Bank/NCC",
  OTP = "Lỗi OTP",
  CLASSIFY = "Phân loại lý do thất bại",
  USER = "Lý do từ người dùng",
  SYSTEM_ALL = "Lý do từ hệ thống",
}
