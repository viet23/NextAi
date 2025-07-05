export const ticketStatusStyles = {
  T0: { backgroundColor: "whitesmoke", color: "black" },
  "T0.2": { backgroundColor: "lightgray", color: "black" },
  "T0.3": { backgroundColor: "silver", color: "black" },
  T1: { backgroundColor: "gainsboro", color: "black" },
  "T1.2": { backgroundColor: "powderblue", color: "black" },
  "T1.3": { backgroundColor: "lightslategray", color: "black" },
  T3: { backgroundColor: "lightsalmon", color: "black" },
  T5: { backgroundColor: "lightyellow", color: "black" },
  T6: { backgroundColor: "lemonchiffon", color: "black" },
  T7: { backgroundColor: "khaki", color: "black" },
  T8: { backgroundColor: "palegreen", color: "black" },
  T8A: { backgroundColor: "mediumaquamarine", color: "black" },
  T8B: { backgroundColor: "springgreen", color: "black" },
};

export const nameTicketMapping: { [key: string]: string } = {
  internalState: "Trạng thái",
  feature: "Tính năng",
  handler: "Nhân viên tiếp nhận",
  department: "Phòng ban",
  customerName: "Khách hàng",
  contactInfo: "SDT/Email",
  title: "Loại vấn đề",
  ticketId: "Mã ticket",
  receiveDate: "Ngày tiếp nhận xử lý",
  problemType: "Loại vấn đề",
  receiveChannel: "Kênh tiếp nhận",
  callContent: "Nội dung cuộc gọi",
  createdAt: "Ngày tiếp nhận ticket",
  processingPlan: "Phương án xử lý",
  closeDate: "Ngày đóng ticket",
  note: "Ghi chú",
  featureDetails: "Chi tiết tính năng",
  customerId: "ID khách hàng",
  assignById: "Nhân viên giao",
};

export const excludedTicketKeys = [
  "customers",
  "assignedBy",
  "updatedAt",
  "solution",
  "description",
  "updatedById",
  "status",
];

export const formatTicketDate = "DD/MM/YY";
export const formatHistoryTime = "DD/MM/YY HH:mm:ss";

export const keyTotal = "totalReports";
