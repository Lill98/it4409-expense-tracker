const MIN_AMOUNT = 1;
const TITLE_MAX_LENGTH = 120;
const NOTE_MAX_LENGTH = 200;

/**
 * Validate phía client để phản hồi tức thì cho người dùng.
 *
 * Đây KHÔNG phải lớp bảo vệ — backend validate lại toàn bộ bằng Zod, vì
 * bất kỳ ai cũng có thể gọi API trực tiếp mà bỏ qua UI. Các luật ở đây
 * phản chiếu đúng luật ở backend/src/modules/expenses/expense.validation.js.
 */
export function validateExpenseForm(values) {
  const errors = {};

  const title = values.title.trim();
  if (!title) {
    errors.title = 'Vui lòng nhập tên khoản chi';
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `Tên tối đa ${TITLE_MAX_LENGTH} ký tự`;
  }

  // Input type="number" trả về string, chuỗi rỗng khi bỏ trống.
  if (values.amount === '') {
    errors.amount = 'Vui lòng nhập số tiền';
  } else {
    const amount = Number(values.amount);
    if (Number.isNaN(amount)) {
      errors.amount = 'Số tiền phải là số';
    } else if (!Number.isInteger(amount)) {
      errors.amount = 'Số tiền phải là số nguyên (VND)';
    } else if (amount < MIN_AMOUNT) {
      errors.amount = `Số tiền phải lớn hơn hoặc bằng ${MIN_AMOUNT}`;
    }
  }

  if (!values.category) {
    errors.category = 'Vui lòng chọn phân loại';
  }

  if (!values.date) {
    errors.date = 'Vui lòng chọn ngày';
  } else if (Number.isNaN(Date.parse(values.date))) {
    errors.date = 'Ngày không hợp lệ';
  } else {
    // So sánh theo cuối ngày hôm nay để hôm nay vẫn được coi là hợp lệ.
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    if (new Date(values.date) > endOfToday) {
      errors.date = 'Ngày không được ở tương lai';
    }
  }

  if (values.note.length > NOTE_MAX_LENGTH) {
    errors.note = `Ghi chú tối đa ${NOTE_MAX_LENGTH} ký tự`;
  }

  return errors;
}

/** Chuyển giá trị của form sang payload đúng kiểu cho API. */
export function toExpensePayload(values) {
  return {
    title: values.title.trim(),
    amount: Number(values.amount),
    category: values.category,
    paymentMethod: values.paymentMethod,
    date: values.date,
    note: values.note.trim(),
  };
}
