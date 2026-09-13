import { Response } from 'express';
import { DataStore } from '../services/dataStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function createReport(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { campaign_id, campaign_title, reason } = req.body;
    if (!campaign_id || !reason) {
      return res.status(400).json({ success: false, message: 'Campaign ID and reason are required.' });
    }

    const report = await DataStore.createReport({
      campaign_id,
      campaign_title: campaign_title || 'Untitled Campaign',
      reporter_name: req.user.name,
      reporter_email: req.user.email,
      reason: reason.trim(),
    });

    // Notify admin
    await DataStore.createNotification({
      toEmail: 'admin@fundbridge.com',
      message: `Suspicious campaign report filed for "${campaign_title}" by ${req.user.name}.`,
      actionRoute: '/dashboard/reports',
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted. Our moderation team will investigate promptly.',
      report,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to submit report.' });
  }
}

export async function getReports(req: AuthenticatedRequest, res: Response) {
  try {
    const { page = '1', limit = '10' } = req.query;
    const result = await DataStore.getReports(parseInt(String(page), 10) || 1, parseInt(String(limit), 10) || 10);
    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch reports.' });
  }
}

export async function updateReportStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid report status.' });
    }

    const updated = await DataStore.updateReportStatus(id, status);
    return res.status(200).json({ success: true, message: `Report marked as ${status}.`, report: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update report.' });
  }
}
