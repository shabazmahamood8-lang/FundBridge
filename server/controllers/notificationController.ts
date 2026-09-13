import { Response } from 'express';
import { DataStore } from '../services/dataStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getMyNotifications(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const notifications = await DataStore.getNotificationsByUser(req.user.email);
    return res.status(200).json({ success: true, notifications });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch notifications.' });
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const updated = await DataStore.markNotificationAsRead(id);
    return res.status(200).json({ success: true, notification: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to mark notification.' });
  }
}

export async function markAllAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    await DataStore.markAllNotificationsAsRead(req.user.email);
    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to mark all as read.' });
  }
}
