const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appErrors');

/**
 * Create a notification (used by other controllers).
 * @param {string} userId - Recipient user id
 * @param {object} opts - { type, title, message, link, relatedId, relatedModel }
 */
exports.createNotification = async (userId, opts) => {
  if (!userId || !opts?.type || !opts?.title) return null;
  const doc = await Notification.create({
    user: userId,
    type: opts.type,
    title: opts.title,
    message: opts.message || '',
    link: opts.link || '',
    relatedId: opts.relatedId,
    relatedModel: opts.relatedModel,
  });
  return doc;
};

// Get notifications for the current user (paginated)
exports.getMyNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
  const readFilter = req.query.read; // 'true' | 'false' | undefined (all)

  const query = { user: userId };
  if (readFilter === 'true') query.read = true;
  if (readFilter === 'false') query.read = false;

  const total = await Notification.countDocuments(query);
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const unreadCount = await Notification.countDocuments({ user: userId, read: false });

  res.status(200).json({
    status: 'success',
    data: {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

// Mark one notification as read
exports.markAsRead = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: userId },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { notification },
  });
});

// Mark all notifications as read for the current user
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  await Notification.updateMany({ user: userId, read: false }, { read: true });

  res.status(200).json({
    status: 'success',
    data: { message: 'All notifications marked as read' },
  });
});

// Get unread count only (lightweight for navbar)
exports.getUnreadCount = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const count = await Notification.countDocuments({ user: userId, read: false });

  res.status(200).json({
    status: 'success',
    data: { unreadCount: count },
  });
});
