/**
 * Một dạng response duy nhất cho toàn bộ API, để frontend chỉ phải
 * xử lý một hình dạng dữ liệu (`success` + `data` hoặc `success` + `message`).
 */
export function sendSuccess(res, statusCode, data, meta = undefined) {
  const body = { success: true, data };
  if (meta) {
    body.meta = meta;
  }
  return res.status(statusCode).json(body);
}
