import { Router } from 'express';
import * as authCtrl from '../controllers/authController.js';
import * as campaignCtrl from '../controllers/campaignController.js';
import * as contribCtrl from '../controllers/contributionController.js';
import * as withdrawalCtrl from '../controllers/withdrawalController.js';
import * as paymentCtrl from '../controllers/paymentController.js';
import * as adminCtrl from '../controllers/adminController.js';
import * as notifCtrl from '../controllers/notificationController.js';
import * as reportCtrl from '../controllers/reportController.js';
import { uploadMiddleware, uploadImage } from '../controllers/uploadController.js';
import {
  requireAuth,
  requireSupporter,
  requireCreator,
  requireAdmin,
} from '../middleware/auth.js';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'FundBridge API', timestamp: new Date() });
});

// Authentication Routes
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.post('/auth/google', authCtrl.googleAuth);
router.get('/users/me', requireAuth, authCtrl.getMe);

// Platform Public Stats
router.get('/stats/platform', campaignCtrl.getPlatformImpact);

// Campaign Routes (Public & Protected)
router.get('/campaigns', campaignCtrl.getCampaigns);
router.get('/campaigns/top-funded', campaignCtrl.getTopFundedCampaigns);
router.get('/campaigns/creator/my', requireAuth, requireCreator, campaignCtrl.getCreatorCampaigns);
router.get('/campaigns/:id', campaignCtrl.getCampaignById);
router.post('/campaigns', requireAuth, requireCreator, campaignCtrl.createCampaign);
router.patch('/campaigns/:id', requireAuth, campaignCtrl.updateCampaign);
router.delete('/campaigns/:id', requireAuth, campaignCtrl.deleteCampaign);

// Contribution Routes
router.post('/contributions', requireAuth, requireSupporter, contribCtrl.createContribution);
router.get('/contributions/my', requireAuth, requireSupporter, contribCtrl.getMyContributions);
router.get('/contributions/pending', requireAuth, requireCreator, contribCtrl.getPendingContributions);
router.patch('/contributions/:id/approve', requireAuth, requireCreator, contribCtrl.approveContribution);
router.patch('/contributions/:id/reject', requireAuth, requireCreator, contribCtrl.rejectContribution);

// Withdrawal Routes
router.post('/withdrawals', requireAuth, requireCreator, withdrawalCtrl.createWithdrawal);
router.get('/withdrawals/my', requireAuth, requireCreator, withdrawalCtrl.getMyWithdrawals);
router.get('/withdrawals/pending', requireAuth, requireAdmin, withdrawalCtrl.getPendingWithdrawals);
router.patch('/withdrawals/:id/approve', requireAuth, requireAdmin, withdrawalCtrl.approveWithdrawal);

// Image Upload Route (imgBB backend forwarder)
router.post('/upload', uploadMiddleware.single('image'), uploadImage);

// Payment Routes (Stripe)
router.post('/payments/create-checkout-session', requireAuth, paymentCtrl.createCheckoutSession);
router.post('/payments/verify-session', requireAuth, paymentCtrl.verifySession);
router.post('/payments/webhook', paymentCtrl.handleStripeWebhook);
router.get('/payments/history', requireAuth, paymentCtrl.getPaymentHistory);
router.post('/payments/create', requireAuth, paymentCtrl.createPaymentSession);
router.post('/payments/confirm', requireAuth, paymentCtrl.confirmPayment);

// Admin Routes
router.get('/admin/stats', requireAuth, requireAdmin, adminCtrl.getAdminOverviewStats);
router.get('/admin/users', requireAuth, requireAdmin, adminCtrl.getAllUsers);
router.patch('/admin/users/:id/role', requireAuth, requireAdmin, adminCtrl.updateUserRole);
router.delete('/admin/users/:id', requireAuth, requireAdmin, adminCtrl.deleteUser);
router.get('/admin/campaigns/pending', requireAuth, requireAdmin, adminCtrl.getPendingCampaigns);
router.patch('/admin/campaigns/:id/approve', requireAuth, requireAdmin, adminCtrl.approveCampaign);
router.patch('/admin/campaigns/:id/reject', requireAuth, requireAdmin, adminCtrl.rejectCampaign);
router.patch('/admin/campaigns/:id/suspend', requireAuth, requireAdmin, adminCtrl.suspendCampaign);

// Report Routes
router.post('/reports', requireAuth, reportCtrl.createReport);
router.get('/reports', requireAuth, requireAdmin, reportCtrl.getReports);
router.patch('/reports/:id', requireAuth, requireAdmin, reportCtrl.updateReportStatus);

// Notification Routes
router.get('/notifications', requireAuth, notifCtrl.getMyNotifications);
router.patch('/notifications/read-all', requireAuth, notifCtrl.markAllAsRead);
router.patch('/notifications/:id/read', requireAuth, notifCtrl.markAsRead);

export default router;
