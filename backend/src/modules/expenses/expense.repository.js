import mongoose from 'mongoose';

import { Expense } from './expense.model.js';

/**
 * Tầng truy cập dữ liệu cho `expenses`.
 *
 * Bất biến của cả file: MỌI hàm đều nhận `userId` và đưa nó vào filter.
 * Không có hàm nào cho phép đọc/ghi một khoản chi mà không kèm chủ sở hữu —
 * đó là cách chặn IDOR ngay tại tầng thấp nhất, không phụ thuộc vào việc
 * tầng trên có nhớ kiểm tra hay không.
 */

function toObjectId(id) {
  return new mongoose.Types.ObjectId(id);
}

/** Dựng filter Mongo từ các tham số lọc đã được validate. */
function buildFilter(userId, { category, from, to, search } = {}) {
  const filter = { userId: toObjectId(userId) };

  if (category) {
    filter.category = category;
  }

  if (from || to) {
    filter.date = {};
    if (from) {
      filter.date.$gte = new Date(from);
    }
    if (to) {
      filter.date.$lte = new Date(to);
    }
  }

  if (search) {
    // Escape trước khi đưa vào regex: nếu không, người dùng gõ "(" sẽ làm
    // regex vỡ, và pattern độc hại có thể gây ReDoS.
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.title = { $regex: escaped, $options: 'i' };
  }

  return filter;
}

export async function findManyByUser(userId, options) {
  const { page, limit, sort } = options;
  const filter = buildFilter(userId, options);
  const skip = (page - 1) * limit;

  // Chạy song song: đếm tổng và lấy trang hiện tại không phụ thuộc nhau.
  const [items, total] = await Promise.all([
    Expense.find(filter).sort(sort).skip(skip).limit(limit),
    Expense.countDocuments(filter),
  ]);

  return { items, total };
}

/** Tìm theo id NHƯNG luôn kèm userId — id của người khác sẽ trả null. */
export function findOneByUser(id, userId) {
  return Expense.findOne({ _id: id, userId: toObjectId(userId) });
}

export function createForUser(userId, payload) {
  return Expense.create({ ...payload, userId: toObjectId(userId) });
}

export function replaceOneByUser(id, userId, payload) {
  return Expense.findOneAndUpdate(
    { _id: id, userId: toObjectId(userId) },
    payload,
    // `runValidators` để rule của schema vẫn áp dụng khi update, không chỉ khi create.
    { new: true, runValidators: true },
  );
}

export function deleteOneByUser(id, userId) {
  return Expense.findOneAndDelete({ _id: id, userId: toObjectId(userId) });
}

/**
 * Tổng hợp chi tiêu theo category trong một khoảng thời gian.
 * `$match` đặt đầu pipeline để tận dụng index { userId, date }.
 */
export function aggregateByCategory(userId, { from, to }) {
  return Expense.aggregate([
    { $match: { userId: toObjectId(userId), date: { $gte: from, $lte: to } } },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $project: { _id: 0, category: '$_id', total: 1, count: 1 } },
    { $sort: { total: -1 } },
  ]);
}
