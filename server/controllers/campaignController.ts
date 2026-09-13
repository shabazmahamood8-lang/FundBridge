import { Request, Response } from 'express';
import { DataStore } from '../services/dataStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getCampaigns(req: Request, res: Response) {
  try {
    const {
      status = 'approved',
      category,
      search,
      sort,
      onlyActive = 'true',
      page = '1',
      limit = '9',
    } = req.query;

    const result = await DataStore.getCampaigns({
      status: String(status),
      category: category ? String(category) : undefined,
      search: search ? String(search) : undefined,
      sort: sort ? String(sort) : 'newest',
      onlyActive: onlyActive === 'true',
      page: parseInt(String(page), 10) || 1,
      limit: parseInt(String(limit), 10) || 9,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch campaigns.' });
  }
}

export async function getTopFundedCampaigns(req: Request, res: Response) {
  try {
    const campaigns = await DataStore.getTopFundedCampaigns(6);
    return res.status(200).json({ success: true, campaigns });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch top funded campaigns.' });
  }
}

export async function getCampaignById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const campaign = await DataStore.getCampaignById(id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }
    return res.status(200).json({ success: true, campaign });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error fetching campaign.' });
  }
}

export async function createCampaign(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const {
      campaign_title,
      campaign_story,
      category,
      funding_goal,
      minimum_contribution,
      deadline,
      reward_info,
      campaign_image_url,
    } = req.body;

    if (!campaign_title || !campaign_story || !funding_goal || !deadline || !campaign_image_url) {
      return res.status(400).json({ success: false, message: 'Please fill in all required campaign fields.' });
    }

    const goalNum = Number(funding_goal);
    const minContributionNum = Number(minimum_contribution) || 5;

    if (goalNum <= 0) {
      return res.status(400).json({ success: false, message: 'Funding goal must be greater than zero.' });
    }

    const deadlineDate = new Date(deadline);
    if (deadlineDate.getTime() <= Date.now()) {
      return res.status(400).json({ success: false, message: 'Deadline must be a future date.' });
    }

    // New campaigns start with status = pending
    const campaign = await DataStore.createCampaign({
      campaign_title: campaign_title.trim(),
      campaign_story: campaign_story.trim(),
      category: category || 'Technology',
      funding_goal: goalNum,
      minimum_contribution: minContributionNum,
      deadline: deadlineDate,
      reward_info: reward_info || '',
      campaign_image_url,
      creator_email: req.user.email,
      creator_name: req.user.name,
      amount_raised: 0,
      status: 'pending',
    });

    // Notify administrators of new pending campaign submission
    await DataStore.createNotification({
      toEmail: 'admin@fundbridge.com',
      message: `New campaign submitted: "${campaign.campaign_title}" by ${req.user.name} awaits approval.`,
      actionRoute: '/dashboard/manage-campaigns',
    });

    // Notify creator
    await DataStore.createNotification({
      toEmail: req.user.email,
      message: `Your campaign "${campaign.campaign_title}" was submitted for review. It will be public once approved.`,
      actionRoute: '/dashboard/my-campaigns',
    });

    return res.status(201).json({
      success: true,
      message: 'Campaign submitted successfully. Awaiting administrator review.',
      campaign,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create campaign.' });
  }
}

export async function getCreatorCampaigns(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const result = await DataStore.getCampaigns({
      creator_email: req.user.email,
      sort: 'deadline', // sorted by deadline as requested
      limit: 50,
      status: 'all',
    });

    return res.status(200).json({ success: true, campaigns: result.campaigns });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch creator campaigns.' });
  }
}

export async function updateCampaign(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { id } = req.params;
    const campaign = await DataStore.getCampaignById(id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    // Only owner creator or admin can edit
    if (campaign.creator_email !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this campaign.' });
    }

    const { campaign_title, campaign_story, reward_info } = req.body;
    const updatePayload: any = {};
    if (campaign_title) updatePayload.campaign_title = campaign_title;
    if (campaign_story) updatePayload.campaign_story = campaign_story;
    if (reward_info !== undefined) updatePayload.reward_info = reward_info;

    const updated = await DataStore.updateCampaign(id, updatePayload);

    return res.status(200).json({ success: true, message: 'Campaign updated successfully.', campaign: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update campaign.' });
  }
}

export async function deleteCampaign(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { id } = req.params;
    const campaign = await DataStore.getCampaignById(id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    if (campaign.creator_email !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this campaign.' });
    }

    await DataStore.deleteCampaign(id);

    return res.status(200).json({
      success: true,
      message: 'Campaign deleted and all active contributions were safely refunded.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete campaign.' });
  }
}

export async function getPlatformImpact(req: Request, res: Response) {
  try {
    const stats = await DataStore.getPlatformStats();
    return res.status(200).json({ success: true, stats });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to calculate platform impact.' });
  }
}
