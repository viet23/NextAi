export enum UserGrowthReportGroupEnum {
  ALL = "allUser", //tổng user
  ONLINE = "online", //Đang hoạt động
  OFFLINE = "offline", //Chưa hoạt động
  AUTHEN_FAILED = "authenFailed", // Xác thực thất bại
  LOCK = "lock", //Khóa vĩnh viễn
  VERIFIED = "verified", //Đã xác thực
  CREATE_NEW = "createNew", //Tạo mới
  UNKNOWN = "unknown", // Không xác định
}
