/**
 * Bọc một async route handler để mọi Promise bị reject đều đi vào `next(err)`.
 * Nhờ vậy controller không cần try/catch rải rác — toàn bộ lỗi dồn về
 * errorHandler duy nhất (yêu cầu "xử lý lỗi tập trung" của đề bài).
 */
export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
