import { Response } from 'express';
import { DataStore } from '../services/dataStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getAdminOverviewStats(req: AuthenticatedRequest, res: Response) {
  try {
    const stats = await DataStore.getAdminStats();
    return res.status(200).json({ success: true, stats });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch admin stats.' });
  }
}

export async function getAllUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const { search, role, page = '1', limit = '10' } = req.query;
    const result = await DataStore.getAllUsers(
      search ? String(search) : undefined,
      role ? String(role) : undefined,
      parseInt(String(page), 10) || 1,
      parseInt(String(limit), 10) || 10
    );
    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch users.' });
  }
}

export async function updateUserRole(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['supporter', 'creator', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    const updated = await DataStore.updateUserRole(id, role);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({ success: true, message: `User role updated to ${role}.`, user: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update user role.' });
  }
}

export async function deleteUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const user = await DataStore.findUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent deleting self
    if (req.user && req.user.email.toLowerCase() === user.email.toLowerCase()) {
      return res.status(400).json({ success: false, message: 'Administrators cannot delete their own active account.' });
    }

    await DataStore.deleteUser(id);
    return res.status(200).json({ success: true, message: 'User account removed successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete user.' });
  }
}

export async function getPendingCampaigns(req: AuthenticatedRequest, res: Response) {
  try {
    const result = await DataStore.getCampaigns({ status: 'pending', limit: 50 });
    return res.status(200).json({ success: true, campaigns: result.campaigns });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch pending campaigns.' });
  }
}

export async function approveCampaign(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const campaign = await DataStore.getCampaignById(id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    const updated = await DataStore.updateCampaign(id, { status: 'approved' });

    // Notify creator
    await DataStore.createNotification({
      toEmail: campaign.creator_email,
      message: `Congratulations! Your campaign "${campaign.campaign_title}" has been approved by admin and is now live!`,
      actionRoute: `/campaigns/${campaign._id}`,
    });

    return res.status(200).json({ success: true, message: 'Campaign approved successfully.', campaign: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to approve campaign.' });
  }
}

export async function rejectCampaign(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const campaign = await DataStore.getCampaignById(id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    const updated = await DataStore.updateCampaign(id, { status: 'rejected' });

    // Notify creator
    await DataStore.createNotification({
      toEmail: campaign.creator_email,
      message: `Your campaign "${campaign.campaign_title}" was reviewed and not approved.${reason ? ` Reason: ${reason}` : ''}`,
      actionRoute: '/dashboard/my-campaigns',
    });

    return res.status(200).json({ success: true, message: 'Campaign rejected.', campaign: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to reject campaign.' });
  }
}

export async function suspendCampaign(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const campaign = await DataStore.getCampaignById(id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    const newStatus = campaign.status === 'suspended' ? 'approved' : 'suspended';
    const updated = await DataStore.updateCampaign(id, { status: newStatus });

    await DataStore.createNotification({
      toEmail: campaign.creator_email,
      message: `Campaign "${campaign.campaign_title}" status changed to: ${newStatus}.`,
      actionRoute: '/dashboard/my-campaigns',
    });

    return res.status(200).json({ success: true, message: `Campaign is now ${newStatus}.`, campaign: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update campaign state.' });
  }
}
