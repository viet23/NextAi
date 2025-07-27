// export const buildScriptPrompt = ({
//   scriptPrompt,
//   sceneCount,
//   durationSceneMap,
// }: {
//   scriptPrompt: string;
//   sceneCount: number;
//   durationSceneMap: Record<number, number>;
// }): string => {
//   return `${scriptPrompt}

// . Mỗi cảnh dài khoảng 10 giây, mô tả chi tiết cảnh quay với nhiều hoạt động và chuyển động sống động trong khung hình. Kết quả trả về dưới dạng JSON mảng các chuỗi, mỗi chuỗi là một cảnh.

// Yêu cầu:
// - Quảng cáo chỉ tạo cảnh bao quanh sản phẩm thôi.
// - KHÔNG mô tả bất kỳ con người nào (không khách hàng, không nhân viên, không bàn tay...).
// - Mỗi cảnh dài khoảng 10 giây, nhưng phải có **nhiều hoạt động và hiệu ứng liên tục, lồng ghép hoặc chuyển tiếp mượt mà**.
// - Mỗi cảnh cần có ít nhất **5 hoạt động hoặc hiệu ứng**, ví dụ:
//   + Nguyên liệu rơi, xoay, lăn, va đập
//   + Hiệu ứng nước sôi, khói, tia sáng, tia ớt cay bắn ra
//   + Chuyển động camera (zoom cận topping → xoay quanh nồi → cắt cảnh nhanh)
//   + Kỹ thuật dựng hình ảnh: slow-motion, fast cut, lặp nhịp
// - Cảnh phải sinh động, mạnh mẽ, đầy năng lượng — giúp truyền tải cảm giác hấp dẫn của món ăn và kích thích người xem muốn đặt mua hoặc đến trải nghiệm ngay lập tức.
// - Trả về đúng ${durationSceneMap[sceneCount]} cảnh, dạng JSON, mỗi cảnh là 1 chuỗi mô tả sinh động. Không được thêm hoặc bớt cảnh.

// Ví dụ định dạng kết quả:
// [
//   "Cảnh 1: ...",
//   "Cảnh 2: ...",
//   "Cảnh 3: ..."
// ]`;
// };

export const buildScriptPrompt = ({
  scriptPrompt,
  sceneCount,
  durationSceneMap,
}: {
  scriptPrompt: string;
  sceneCount: number;
  durationSceneMap: Record<number, number>;
}): string => {
  return `${scriptPrompt}

. Mỗi cảnh dài khoảng 10 giây, mô tả chi tiết cảnh quay với nhiều hoạt động và chuyển động sống động trong khung hình. Kết quả trả về dưới dạng JSON mảng các chuỗi, mỗi chuỗi là một cảnh.

Yêu cầu:
- Quảng cáo chỉ tạo cảnh bao quanh sản phẩm thôi.
- Mỗi cảnh dài khoảng 10 giây, nhưng phải có **nhiều hoạt động và hiệu ứng liên tục, lồng ghép hoặc chuyển tiếp mượt mà**.
- Mỗi cảnh cần có ít nhất **5 hoạt động hoặc hiệu ứng**, ví dụ:
  + Nguyên liệu rơi, xoay, lăn, va đập
  + Hiệu ứng nước sôi, khói, tia sáng, tia ớt cay bắn ra
  + Chuyển động camera (zoom cận topping → xoay quanh nồi → cắt cảnh nhanh)
  + Kỹ thuật dựng hình ảnh: slow-motion, fast cut, lặp nhịp
- Cảnh phải sinh động, mạnh mẽ, đầy năng lượng — giúp truyền tải cảm giác hấp dẫn của món ăn và kích thích người xem muốn đặt mua hoặc đến trải nghiệm ngay lập tức.
- Trả về đúng ${durationSceneMap[sceneCount]} cảnh, dạng JSON, mỗi cảnh là 1 chuỗi mô tả sinh động. Không được thêm hoặc bớt cảnh.

Ví dụ định dạng kết quả:
[
  "Cảnh 1: ...",
  "Cảnh 2: ...",
  "Cảnh 3: ..."
]`;
};

