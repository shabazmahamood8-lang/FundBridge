import { Response } from 'express';
import { DataStore } from '../services/dataStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function createContribution(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { campaign_id, contribution_amount, message } = req.body;
    const amount = Number(contribution_amount);

    if (!campaign_id || !amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid contribution amount or campaign ID.' });
    }

    const campaign = await DataStore.getCampaignById(campaign_id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign does not exist.' });
    }

    if (campaign.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Only approved campaigns can accept contributions.' });
    }

    if (new Date(campaign.deadline).getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'This campaign deadline has already passed.' });
    }

    if (amount < campaign.minimum_contribution) {
      return res.status(400).json({
        success: false,
        message: `Minimum contribution for this campaign is ${campaign.minimum_contribution} credits.`,
      });
    }

    // Refresh user credits from DB
    const freshUser = await DataStore.findUserByEmail(req.user.email);
    if (!freshUser || freshUser.credits < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient credits. You have ${freshUser?.credits || 0} credits available. Please purchase credits first.`,
      });
    }

    // Deduct credits from supporter into escrow
    await DataStore.updateUserCredits(req.user.email, -amount);

    // Create pending contribution
    const contribution = await DataStore.createContribution({
      campaign_id: campaign._id.toString(),
      campaign_title: campaign.campaign_title,
      contribution_amount: amount,
      supporter_email: req.user.email,
      supporter_name: req.user.name,
      creator_name: campaign.creator_name,
      creator_email: campaign.creator_email,
      message: message ? message.trim() : '',
      status: 'pending',
    });

    // Notify creator
    await DataStore.createNotification({
      toEmail: campaign.creator_email,
      message: `New pending contribution of ${amount} credits received from ${req.user.name} for "${campaign.campaign_title}".`,
      actionRoute: '/dashboard',
    });

    return res.status(201).json({
      success: true,
      message: 'Contribution submitted successfully. Awaiting creator confirmation.',
      contribution,
      remainingCredits: (freshUser.credits - amount),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to submit contribution.' });
  }
}

export async function getMyContributions(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { page = '1', limit = '10' } = req.query;
    const result = await DataStore.getContributionsBySupporter(
      req.user.email,
      parseInt(String(page), 10) || 1,
      parseInt(String(limit), 10) || 10
    );

    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve contributions.' });
  }
}

export async function getPendingContributions(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const pending = await DataStore.getPendingContributionsForCreator(req.user.email);
    return res.status(200).json({ success: true, contributions: pending });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve pending contributions.' });
  }
}

export async function approveContribution(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { id } = req.params;
    const contribution = await DataStore.getContributionById(id);
    if (!contribution) {
      return res.status(404).json({ success: false, message: 'Contribution not found.' });
    }

    if (contribution.creator_email !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to approve this contribution.' });
    }

    const approved = await DataStore.approveContribution(id);

    return res.status(200).json({
      success: true,
      message: 'Contribution approved successfully. Campaign funding updated.',
      contribution: approved,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to approve contribution.' });
  }
}

export async function rejectContribution(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { id } = req.params;
    const contribution = await DataStore.getContributionById(id);
    if (!contribution) {
      return res.status(404).json({ success: false, message: 'Contribution not found.' });
    }

    if (contribution.creator_email !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to reject this contribution.' });
    }

    const rejected = await DataStore.rejectContribution(id);

    return res.status(200).json({
      success: true,
      message: 'Contribution rejected and credits refunded back to supporter.',
      contribution: rejected,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to reject contribution.' });
  }
}
