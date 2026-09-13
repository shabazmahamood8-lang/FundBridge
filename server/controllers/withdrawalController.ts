import { Response } from 'express';
import { DataStore } from '../services/dataStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function createWithdrawal(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { creditsToWithdraw, payment_system, account_number } = req.body;
    const credits = Number(creditsToWithdraw);

    if (!credits || isNaN(credits) || credits < 200) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal is 200 credits ($10 value).',
      });
    }

    if (!payment_system || !['Stripe', 'Bkash', 'Rocket', 'Nagad'].includes(payment_system)) {
      return res.status(400).json({ success: false, message: 'Valid payment system is required.' });
    }

    if (!account_number || account_number.trim() === '') {
      return res.status(400).json({ success: false, message: 'Account number is required.' });
    }

    const user = await DataStore.findUserByEmail(req.user.email);
    if (!user || user.credits < credits) {
      return res.status(400).json({
        success: false,
        message: `Insufficient credit. You currently have ${user?.credits || 0} credits available.`,
      });
    }

    // Business rule: 20 credits = $1
    const withdrawalAmount = Number((credits / 20).toFixed(2));

    const withdrawal = await DataStore.createWithdrawal({
      creator_email: req.user.email,
      creator_name: req.user.name,
      withdrawal_credit: credits,
      withdrawal_amount: withdrawalAmount,
      payment_system,
      account_number: account_number.trim(),
    });

    // Notify admins
    await DataStore.createNotification({
      toEmail: 'admin@fundbridge.com',
      message: `Withdrawal request of $${withdrawalAmount} (${credits} credits) received from creator ${req.user.name} via ${payment_system}.`,
      actionRoute: '/dashboard/withdrawal-requests',
    });

    return res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully. Pending administrative disbursement.',
      withdrawal,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to submit withdrawal request.' });
  }
}

export async function getMyWithdrawals(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const withdrawals = await DataStore.getWithdrawalsByCreator(req.user.email);
    return res.status(200).json({ success: true, withdrawals });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch withdrawals.' });
  }
}

export async function getPendingWithdrawals(req: AuthenticatedRequest, res: Response) {
  try {
    const withdrawals = await DataStore.getPendingWithdrawals();
    return res.status(200).json({ success: true, withdrawals });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch pending withdrawals.' });
  }
}

export async function approveWithdrawal(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const withdrawal = await DataStore.approveWithdrawal(id);
    return res.status(200).json({
      success: true,
      message: 'Withdrawal approved and credits successfully disbursed.',
      withdrawal,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to approve withdrawal.' });
  }
}
