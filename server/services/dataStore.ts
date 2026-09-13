import bcrypt from 'bcryptjs';
import { isConnectedToMongo } from '../config/db.js';
import { UserModel, IUser } from '../models/User.js';
import { CampaignModel, ICampaign } from '../models/Campaign.js';
import { ContributionModel, IContribution } from '../models/Contribution.js';
import { WithdrawalModel, IWithdrawal } from '../models/Withdrawal.js';
import { PaymentModel, IPayment } from '../models/Payment.js';
import { NotificationModel, INotification } from '../models/Notification.js';
import { ReportModel, IReport } from '../models/Report.js';

// Pre-seeded In-Memory Store
let memoryUsers: any[] = [];
let memoryCampaigns: any[] = [];
let memoryContributions: any[] = [];
let memoryWithdrawals: any[] = [];
let memoryPayments: any[] = [];
let memoryNotifications: any[] = [];
let memoryReports: any[] = [];

let isSeeded = false;

export async function initSeedData() {
  if (isSeeded) return;

  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('Admin@123456', salt);
  const creatorHash = await bcrypt.hash('Creator@123456', salt);
  const supporterHash = await bcrypt.hash('Supporter@123456', salt);

  const defaultUsers = [
    {
      _id: 'usr_admin_001',
      name: 'System Administrator',
      email: 'admin@fundbridge.com',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      passwordHash: adminHash,
      role: 'admin',
      credits: 1000,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    },
    {
      _id: 'usr_creator_001',
      name: 'Elena Rostova',
      email: 'creator@fundbridge.com',
      photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      passwordHash: creatorHash,
      role: 'creator',
      credits: 420,
      createdAt: new Date('2026-01-05'),
      updatedAt: new Date('2026-01-05'),
    },
    {
      _id: 'usr_supporter_001',
      name: 'Marcus Vance',
      email: 'supporter@fundbridge.com',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      passwordHash: supporterHash,
      role: 'supporter',
      credits: 220,
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-10'),
    },
  ];

  const now = new Date();
  const futureDays = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const defaultCampaigns = [
    {
      _id: 'cmp_001',
      campaign_title: 'BioSift: Microplastic Ocean Filter Drone',
      campaign_story: 'BioSift is an autonomous solar-powered marine drone designed to vacuum microplastics from coastal waters without disrupting marine flora and fauna. By deploying biomimetic filtering meshes, our prototype captures particulates down to 10 microns.',
      category: 'Environment',
      funding_goal: 3000,
      minimum_contribution: 20,
      deadline: futureDays(35),
      reward_info: 'Tier 1 ($20): Digital field updates and name on drone hull. Tier 2 ($100): 3D-printed miniature drone replica made of recycled ocean plastics.',
      campaign_image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      creator_email: 'creator@fundbridge.com',
      creator_name: 'Elena Rostova',
      amount_raised: 2150,
      status: 'approved',
      createdAt: new Date('2026-02-01'),
      updatedAt: new Date('2026-02-01'),
    },
    {
      _id: 'cmp_002',
      campaign_title: 'NeuroGlyph: Haptic Braille Reader for E-Books',
      campaign_story: 'Transforming digital literature for the visually impaired. NeuroGlyph is an ultralight pocket-sized dynamic refreshable tactile cell display that syncs with standard EPUB files via Bluetooth, operating for 40 hours per charge.',
      category: 'Technology',
      funding_goal: 4500,
      minimum_contribution: 25,
      deadline: futureDays(45),
      reward_info: 'Backers receive early beta firmware access and guaranteed priority batch allocation upon mass production.',
      campaign_image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
      creator_email: 'creator@fundbridge.com',
      creator_name: 'Elena Rostova',
      amount_raised: 3800,
      status: 'approved',
      createdAt: new Date('2026-02-05'),
      updatedAt: new Date('2026-02-05'),
    },
    {
      _id: 'cmp_003',
      campaign_title: 'SolarHarvest: Modular Clean Irrigation for Smallholders',
      campaign_story: 'SolarHarvest provides affordable solar drip kits engineered specifically for smallholder farmers vulnerable to severe drought cycles. Conserves up to 65% water compared to furrow irrigation.',
      category: 'Community',
      funding_goal: 2000,
      minimum_contribution: 15,
      deadline: futureDays(22),
      reward_info: 'Includes farm impact telemetry dashboard access and co-sponsored farmer kit dedication plaque.',
      campaign_image_url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
      creator_email: 'creator@fundbridge.com',
      creator_name: 'Elena Rostova',
      amount_raised: 1840,
      status: 'approved',
      createdAt: new Date('2026-02-10'),
      updatedAt: new Date('2026-02-10'),
    },
    {
      _id: 'cmp_004',
      campaign_title: 'AuraPulse: Affordable Maternal Vitals Sensor',
      campaign_story: 'A non-invasive continuous maternal pulse and blood pressure patch designed for rural triage clinics where ultrasound and cardiac monitors are inaccessible.',
      category: 'Health',
      funding_goal: 5000,
      minimum_contribution: 30,
      deadline: futureDays(60),
      reward_info: 'Clinical research whitepaper attribution and invitation to annual medical innovation webinar.',
      campaign_image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
      creator_email: 'creator@fundbridge.com',
      creator_name: 'Elena Rostova',
      amount_raised: 3200,
      status: 'approved',
      createdAt: new Date('2026-02-12'),
      updatedAt: new Date('2026-02-12'),
    },
    {
      _id: 'cmp_005',
      campaign_title: 'OpenStem: Hands-on Robotics Lab in a Box for Schools',
      campaign_story: 'Democratizing robotics education with low-cost open source micro-controller kits and step-by-step curriculum designed for underserved primary schools.',
      category: 'Education',
      funding_goal: 2500,
      minimum_contribution: 10,
      deadline: futureDays(18),
      reward_info: 'Sponsor a student kit with your personalized encouragement message enclosed inside the box.',
      campaign_image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
      creator_email: 'creator@fundbridge.com',
      creator_name: 'Elena Rostova',
      amount_raised: 2450,
      status: 'approved',
      createdAt: new Date('2026-02-14'),
      updatedAt: new Date('2026-02-14'),
    },
    {
      _id: 'cmp_006',
      campaign_title: 'PrismSculpt: Kinetic Public Light Installations',
      campaign_story: 'Interactive public sculptures that react to pedestrians and natural wind patterns, reflecting kaleidoscopic ambient spectra across city plaza centers.',
      category: 'Art',
      funding_goal: 1800,
      minimum_contribution: 15,
      deadline: futureDays(28),
      reward_info: 'Signed architectural conceptual prints and private exhibition vernissage pass.',
      campaign_image_url: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&auto=format&fit=crop&q=80',
      creator_email: 'creator@fundbridge.com',
      creator_name: 'Elena Rostova',
      amount_raised: 1200,
      status: 'approved',
      createdAt: new Date('2026-02-15'),
      updatedAt: new Date('2026-02-15'),
    },
    {
      _id: 'cmp_007',
      campaign_title: 'AeroGrid: Portable Micro-Wind Generators',
      campaign_story: 'Compact, collapsible micro-turbines providing sustainable off-grid electricity for emergency rescue teams and remote research outposts.',
      category: 'Technology',
      funding_goal: 3500,
      minimum_contribution: 20,
      deadline: futureDays(40),
      reward_info: 'Early backer special engineering build with commemorative serial badge.',
      campaign_image_url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=80',
      creator_email: 'creator@fundbridge.com',
      creator_name: 'Elena Rostova',
      amount_raised: 0,
      status: 'pending',
      createdAt: new Date('2026-03-01'),
      updatedAt: new Date('2026-03-01'),
    }
  ];

  const defaultContributions = [
    {
      _id: 'cnt_001',
      campaign_id: 'cmp_001',
      campaign_title: 'BioSift: Microplastic Ocean Filter Drone',
      contribution_amount: 100,
      supporter_email: 'supporter@fundbridge.com',
      supporter_name: 'Marcus Vance',
      creator_name: 'Elena Rostova',
      creator_email: 'creator@fundbridge.com',
      current_date: new Date('2026-02-18'),
      status: 'approved',
      message: 'Great environmental initiative! Excited to see the field trials.',
      createdAt: new Date('2026-02-18'),
      updatedAt: new Date('2026-02-18'),
    },
    {
      _id: 'cnt_002',
      campaign_id: 'cmp_002',
      campaign_title: 'NeuroGlyph: Haptic Braille Reader for E-Books',
      contribution_amount: 50,
      supporter_email: 'supporter@fundbridge.com',
      supporter_name: 'Marcus Vance',
      creator_name: 'Elena Rostova',
      creator_email: 'creator@fundbridge.com',
      current_date: new Date('2026-02-25'),
      status: 'pending',
      message: 'Accessibility technology needs more visionaries like you.',
      createdAt: new Date('2026-02-25'),
      updatedAt: new Date('2026-02-25'),
    },
  ];

  const defaultNotifications = [
    {
      _id: 'notif_001',
      message: 'Welcome to FundBridge! You have received 50 free credits upon onboarding.',
      toEmail: 'supporter@fundbridge.com',
      actionRoute: '/dashboard/explore',
      time: new Date('2026-02-10'),
      read: true,
      createdAt: new Date('2026-02-10'),
    },
    {
      _id: 'notif_002',
      message: 'Your contribution of 100 credits to BioSift was approved by creator Elena Rostova!',
      toEmail: 'supporter@fundbridge.com',
      actionRoute: '/dashboard/my-contributions',
      time: new Date('2026-02-19'),
      read: false,
      createdAt: new Date('2026-02-19'),
    },
    {
      _id: 'notif_003',
      message: 'New pending contribution of 50 credits received from Marcus Vance on NeuroGlyph.',
      toEmail: 'creator@fundbridge.com',
      actionRoute: '/dashboard/my-campaigns',
      time: new Date('2026-02-25'),
      read: false,
      createdAt: new Date('2026-02-25'),
    },
    {
      _id: 'notif_004',
      message: 'New campaign submitted: "AeroGrid: Portable Micro-Wind Generators" awaits admin review.',
      toEmail: 'admin@fundbridge.com',
      actionRoute: '/dashboard/manage-campaigns',
      time: new Date('2026-03-01'),
      read: false,
      createdAt: new Date('2026-03-01'),
    }
  ];

  const defaultPayments = [
    {
      _id: 'pay_001',
      user_email: 'supporter@fundbridge.com',
      package_name: 'Supporter Booster (300 Credits)',
      credits: 300,
      amount: 25,
      transaction_id: 'txn_fb_demo_98241',
      payment_method: 'Stripe',
      status: 'completed',
      createdAt: new Date('2026-02-15'),
      updatedAt: new Date('2026-02-15'),
    }
  ];

  const defaultWithdrawals = [
    {
      _id: 'wth_001',
      creator_email: 'creator@fundbridge.com',
      creator_name: 'Elena Rostova',
      withdrawal_credit: 200,
      withdrawal_amount: 10,
      payment_system: 'Stripe',
      account_number: 'acct_stripe_creator_99',
      withdraw_date: new Date('2026-02-20'),
      status: 'pending',
      createdAt: new Date('2026-02-20'),
      updatedAt: new Date('2026-02-20'),
    }
  ];

  const defaultReports = [
    {
      _id: 'rep_001',
      campaign_id: 'cmp_006',
      campaign_title: 'PrismSculpt: Kinetic Public Light Installations',
      reporter_name: 'Community Observer',
      reporter_email: 'observer@fundbridge.com',
      reason: 'Requesting clarification on city zoning permits before public installation starts.',
      date: new Date('2026-02-27'),
      status: 'pending',
      createdAt: new Date('2026-02-27'),
      updatedAt: new Date('2026-02-27'),
    }
  ];

  memoryUsers = defaultUsers;
  memoryCampaigns = defaultCampaigns;
  memoryContributions = defaultContributions;
  memoryNotifications = defaultNotifications;
  memoryPayments = defaultPayments;
  memoryWithdrawals = defaultWithdrawals;
  memoryReports = defaultReports;

  // If MongoDB is connected, seed into Mongo collections if empty
  if (isConnectedToMongo) {
    try {
      const userCount = await (UserModel as any).countDocuments();
      if (userCount === 0) {
        await (UserModel as any).insertMany(defaultUsers);
        await (CampaignModel as any).insertMany(defaultCampaigns);
        await (ContributionModel as any).insertMany(defaultContributions);
        await (NotificationModel as any).insertMany(defaultNotifications);
        await (PaymentModel as any).insertMany(defaultPayments);
        await (WithdrawalModel as any).insertMany(defaultWithdrawals);
        await (ReportModel as any).insertMany(defaultReports);
        console.log('[Database] Seeded initial data into MongoDB Atlas.');
      }
    } catch (err) {
      console.warn('[Database] Error while checking/seeding Mongo collection:', err);
    }
  }

  isSeeded = true;
}

// Accessor methods for data store
export const DataStore = {
  // Users
  async findUserByEmail(email: string) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (UserModel as any).findOne({ email: email.toLowerCase() });
    }
    return memoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id: string) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (UserModel as any).findById(id);
    }
    return memoryUsers.find((u) => u._id.toString() === id.toString()) || null;
  },

  async createUser(userData: any) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (UserModel as any).create(userData);
    }
    const newUser = {
      _id: 'usr_' + Math.random().toString(36).substr(2, 9),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryUsers.push(newUser);
    return newUser;
  },

  async updateUserCredits(email: string, delta: number) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (UserModel as any).findOneAndUpdate(
        { email: email.toLowerCase() },
        { $inc: { credits: delta } },
        { new: true }
      );
    }
    const user = memoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      user.credits = (user.credits || 0) + delta;
      user.updatedAt = new Date();
      return user;
    }
    return null;
  },

  async getAllUsers(search?: string, role?: string, page = 1, limit = 10) {
    await initSeedData();
    if (isConnectedToMongo) {
      const query: any = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }
      if (role && role !== 'all') {
        query.role = role;
      }
      const total = await UserModel.countDocuments(query);
      const users = await UserModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      return { users, total, page, totalPages: Math.ceil(total / limit) };
    }

    let filtered = [...memoryUsers];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (role && role !== 'all') {
      filtered = filtered.filter((u) => u.role === role);
    }
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);
    return { users: paginated, total, page, totalPages: Math.ceil(total / limit) };
  },

  async updateUserRole(id: string, newRole: string) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (UserModel as any).findByIdAndUpdate(id, { role: newRole }, { new: true });
    }
    const user = memoryUsers.find((u) => u._id.toString() === id.toString());
    if (user) {
      user.role = newRole;
      user.updatedAt = new Date();
      return user;
    }
    return null;
  },

  async deleteUser(id: string) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (UserModel as any).findByIdAndDelete(id);
    }
    const index = memoryUsers.findIndex((u) => u._id.toString() === id.toString());
    if (index !== -1) {
      const removed = memoryUsers.splice(index, 1)[0];
      return removed;
    }
    return null;
  },

  // Campaigns
  async getCampaigns(options: {
    status?: string;
    category?: string;
    search?: string;
    creator_email?: string;
    sort?: string;
    onlyActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    await initSeedData();
    const {
      status,
      category,
      search,
      creator_email,
      sort = 'newest',
      onlyActive = false,
      page = 1,
      limit = 12,
    } = options;

    if (isConnectedToMongo) {
      const query: any = {};
      if (status && status !== 'all') query.status = status;
      if (category && category !== 'all') query.category = category;
      if (creator_email) query.creator_email = creator_email.toLowerCase();
      if (onlyActive) {
        query.deadline = { $gte: new Date() };
        query.status = 'approved';
      }
      if (search) {
        query.$or = [
          { campaign_title: { $regex: search, $options: 'i' } },
          { creator_name: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ];
      }

      let sortObj: any = { createdAt: -1 };
      if (sort === 'top-funded') sortObj = { amount_raised: -1 };
      if (sort === 'deadline') sortObj = { deadline: 1 };
      if (sort === 'goal') sortObj = { funding_goal: -1 };

      const total = await CampaignModel.countDocuments(query);
      const campaigns = await CampaignModel.find(query)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit);
      return { campaigns, total, page, totalPages: Math.ceil(total / limit) };
    }

    let filtered = [...memoryCampaigns];
    if (status && status !== 'all') {
      filtered = filtered.filter((c) => c.status === status);
    }
    if (category && category !== 'all') {
      filtered = filtered.filter((c) => c.category.toLowerCase() === category.toLowerCase());
    }
    if (creator_email) {
      filtered = filtered.filter((c) => c.creator_email.toLowerCase() === creator_email.toLowerCase());
    }
    if (onlyActive) {
      const now = new Date().getTime();
      filtered = filtered.filter((c) => c.status === 'approved' && new Date(c.deadline).getTime() >= now);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.campaign_title.toLowerCase().includes(q) ||
          c.creator_name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    if (sort === 'top-funded') {
      filtered.sort((a, b) => b.amount_raised - a.amount_raised);
    } else if (sort === 'deadline') {
      filtered.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    } else if (sort === 'goal') {
      filtered.sort((a, b) => b.funding_goal - a.funding_goal);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);
    return { campaigns: paginated, total, page, totalPages: Math.ceil(total / limit) };
  },

  async getTopFundedCampaigns(limit = 6) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (CampaignModel as any).find({ status: 'approved' })
        .sort({ amount_raised: -1 })
        .limit(limit);
    }
    return [...memoryCampaigns]
      .filter((c) => c.status === 'approved')
      .sort((a, b) => b.amount_raised - a.amount_raised)
      .slice(0, limit);
  },

  async getCampaignById(id: string) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (CampaignModel as any).findById(id);
    }
    return memoryCampaigns.find((c) => c._id.toString() === id.toString()) || null;
  },

  async createCampaign(data: any) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (CampaignModel as any).create(data);
    }
    const newCamp = {
      _id: 'cmp_' + Math.random().toString(36).substr(2, 9),
      ...data,
      amount_raised: 0,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryCampaigns.push(newCamp);
    return newCamp;
  },

  async updateCampaign(id: string, updateData: any) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (CampaignModel as any).findByIdAndUpdate(id, updateData, { new: true });
    }
    const camp = memoryCampaigns.find((c) => c._id.toString() === id.toString());
    if (camp) {
      Object.assign(camp, updateData, { updatedAt: new Date() });
      return camp;
    }
    return null;
  },

  async deleteCampaign(id: string) {
    await initSeedData();
    // Also refund any approved or pending contributions for this campaign
    const contributions = await this.getContributionsByCampaignId(id);
    for (const cnt of contributions) {
      if (cnt.status === 'approved' || cnt.status === 'pending') {
        // Refund credits to supporter
        await this.updateUserCredits(cnt.supporter_email, cnt.contribution_amount);
        // Create notification
        await this.createNotification({
          toEmail: cnt.supporter_email,
          message: `Campaign "${cnt.campaign_title}" was closed/deleted. Your contribution of ${cnt.contribution_amount} credits has been refunded to your account.`,
          actionRoute: '/dashboard/my-contributions',
        });
      }
    }

    if (isConnectedToMongo) {
      await (ContributionModel as any).deleteMany({ campaign_id: id });
      return await (CampaignModel as any).findByIdAndDelete(id);
    }
    memoryContributions = memoryContributions.filter((c) => c.campaign_id !== id);
    const idx = memoryCampaigns.findIndex((c) => c._id.toString() === id.toString());
    if (idx !== -1) {
      return memoryCampaigns.splice(idx, 1)[0];
    }
    return null;
  },

  // Contributions
  async createContribution(data: any) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await ContributionModel.create(data);
    }
    const newCnt = {
      _id: 'cnt_' + Math.random().toString(36).substr(2, 9),
      ...data,
      current_date: new Date(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryContributions.push(newCnt);
    return newCnt;
  },

  async getContributionsByCampaignId(campaignId: string) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (ContributionModel as any).find({ campaign_id: campaignId });
    }
    return memoryContributions.filter((c) => c.campaign_id === campaignId);
  },

  async getContributionsBySupporter(email: string, page = 1, limit = 10) {
    await initSeedData();
    if (isConnectedToMongo) {
      const total = await (ContributionModel as any).countDocuments({ supporter_email: email.toLowerCase() });
      const contributions = await (ContributionModel as any).find({ supporter_email: email.toLowerCase() })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      return { contributions, total, page, totalPages: Math.ceil(total / limit) };
    }
    const filtered = memoryContributions
      .filter((c) => c.supporter_email.toLowerCase() === email.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const total = filtered.length;
    return {
      contributions: filtered.slice((page - 1) * limit, page * limit),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getPendingContributionsForCreator(email: string) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (ContributionModel as any).find({
        creator_email: email.toLowerCase(),
        status: 'pending',
      }).sort({ createdAt: -1 });
    }
    return memoryContributions
      .filter((c) => c.creator_email.toLowerCase() === email.toLowerCase() && c.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getContributionById(id: string) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (ContributionModel as any).findById(id);
    }
    return memoryContributions.find((c) => c._id.toString() === id.toString()) || null;
  },

  async approveContribution(id: string) {
    await initSeedData();
    const cnt = await this.getContributionById(id);
    if (!cnt) throw new Error('Contribution not found');
    if (cnt.status !== 'pending') throw new Error('Contribution already processed');

    if (isConnectedToMongo) {
      cnt.status = 'approved';
      await cnt.save();
      await (CampaignModel as any).findByIdAndUpdate(cnt.campaign_id, {
        $inc: { amount_raised: cnt.contribution_amount },
      });
    } else {
      cnt.status = 'approved';
      cnt.updatedAt = new Date();
      const camp = memoryCampaigns.find((c) => c._id.toString() === cnt.campaign_id.toString());
      if (camp) {
        camp.amount_raised = (camp.amount_raised || 0) + cnt.contribution_amount;
      }
    }

    // Notify supporter
    await this.createNotification({
      toEmail: cnt.supporter_email,
      message: `Your contribution of ${cnt.contribution_amount} credits to "${cnt.campaign_title}" has been approved!`,
      actionRoute: '/dashboard/my-contributions',
    });

    return cnt;
  },

  async rejectContribution(id: string) {
    await initSeedData();
    const cnt = await this.getContributionById(id);
    if (!cnt) throw new Error('Contribution not found');
    if (cnt.status !== 'pending') throw new Error('Contribution already processed');

    if (isConnectedToMongo) {
      cnt.status = 'rejected';
      await cnt.save();
    } else {
      cnt.status = 'rejected';
      cnt.updatedAt = new Date();
    }

    // Refund credits to supporter
    await this.updateUserCredits(cnt.supporter_email, cnt.contribution_amount);

    // Notify supporter
    await this.createNotification({
      toEmail: cnt.supporter_email,
      message: `Your contribution of ${cnt.contribution_amount} credits to "${cnt.campaign_title}" was rejected. The credits have been refunded to your balance.`,
      actionRoute: '/dashboard/my-contributions',
    });

    return cnt;
  },

  // Withdrawals
  async createWithdrawal(data: any) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await WithdrawalModel.create(data);
    }
    const newWth = {
      _id: 'wth_' + Math.random().toString(36).substr(2, 9),
      ...data,
      status: 'pending',
      withdraw_date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryWithdrawals.push(newWth);
    return newWth;
  },

  async getWithdrawalsByCreator(email: string) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (WithdrawalModel as any).find({ creator_email: email.toLowerCase() }).sort({ createdAt: -1 });
    }
    return memoryWithdrawals
      .filter((w) => w.creator_email.toLowerCase() === email.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getPendingWithdrawals() {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (WithdrawalModel as any).find({ status: 'pending' }).sort({ createdAt: -1 });
    }
    return memoryWithdrawals
      .filter((w) => w.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async approveWithdrawal(id: string) {
    await initSeedData();
    let withdrawal: any = null;
    if (isConnectedToMongo) {
      withdrawal = await (WithdrawalModel as any).findById(id);
    } else {
      withdrawal = memoryWithdrawals.find((w) => w._id.toString() === id.toString());
    }

    if (!withdrawal) throw new Error('Withdrawal request not found');
    if (withdrawal.status !== 'pending') throw new Error('Withdrawal is already processed');

    // Deduct credits from creator
    const creator = await this.findUserByEmail(withdrawal.creator_email);
    if (!creator || creator.credits < withdrawal.withdrawal_credit) {
      throw new Error('Creator has insufficient credits to complete this withdrawal');
    }

    await this.updateUserCredits(withdrawal.creator_email, -withdrawal.withdrawal_credit);

    if (isConnectedToMongo) {
      withdrawal.status = 'approved';
      await withdrawal.save();
    } else {
      withdrawal.status = 'approved';
      withdrawal.updatedAt = new Date();
    }

    // Notify creator
    await this.createNotification({
      toEmail: withdrawal.creator_email,
      message: `Your withdrawal of ${withdrawal.withdrawal_credit} credits ($${withdrawal.withdrawal_amount}) via ${withdrawal.payment_system} has been approved and disbursed!`,
      actionRoute: '/dashboard/withdrawals',
    });

    return withdrawal;
  },

  // Payments
  async createPayment(data: any) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (PaymentModel as any).create(data);
    }
    const newPay = {
      _id: 'pay_' + Math.random().toString(36).substr(2, 9),
      ...data,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryPayments.push(newPay);
    return newPay;
  },

  async getPaymentsByUser(email: string) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (PaymentModel as any).find({ user_email: email.toLowerCase() }).sort({ createdAt: -1 });
    }
    return memoryPayments
      .filter((p) => p.user_email.toLowerCase() === email.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getPaymentByTransactionId(transactionId: string) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (PaymentModel as any).findOne({ transaction_id: transactionId });
    }
    return memoryPayments.find((p) => p.transaction_id === transactionId) || null;
  },

  async getAllPayments() {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (PaymentModel as any).find().sort({ createdAt: -1 });
    }
    return [...memoryPayments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Notifications
  async createNotification(data: { message: string; toEmail: string; actionRoute?: string }) {
    await initSeedData();
    const payload = {
      ...data,
      actionRoute: data.actionRoute || '/dashboard',
      time: new Date(),
      read: false,
    };
    if (isConnectedToMongo) {
      return await (NotificationModel as any).create(payload);
    }
    const newNotif = {
      _id: 'notif_' + Math.random().toString(36).substr(2, 9),
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryNotifications.unshift(newNotif);
    return newNotif;
  },

  async getNotificationsByUser(email: string) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (NotificationModel as any).find({ toEmail: email.toLowerCase() }).sort({ time: -1 });
    }
    return memoryNotifications
      .filter((n) => n.toEmail.toLowerCase() === email.toLowerCase())
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  },

  async markNotificationAsRead(id: string) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (NotificationModel as any).findByIdAndUpdate(id, { read: true }, { new: true });
    }
    const notif = memoryNotifications.find((n) => n._id.toString() === id.toString());
    if (notif) {
      notif.read = true;
      return notif;
    }
    return null;
  },

  async markAllNotificationsAsRead(email: string) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (NotificationModel as any).updateMany({ toEmail: email.toLowerCase() }, { read: true });
    }
    memoryNotifications.forEach((n) => {
      if (n.toEmail.toLowerCase() === email.toLowerCase()) {
        n.read = true;
      }
    });
    return true;
  },

  // Reports
  async createReport(data: any) {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (ReportModel as any).create(data);
    }
    const newRep = {
      _id: 'rep_' + Math.random().toString(36).substr(2, 9),
      ...data,
      date: new Date(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryReports.push(newRep);
    return newRep;
  },

  async getReports(page = 1, limit = 10) {
    await initSeedData();
    if (isConnectedToMongo) {
      const total = await (ReportModel as any).countDocuments();
      const reports = await (ReportModel as any).find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      return { reports, total, page, totalPages: Math.ceil(total / limit) };
    }
    const total = memoryReports.length;
    const sorted = [...memoryReports].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return {
      reports: sorted.slice((page - 1) * limit, page * limit),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async updateReportStatus(id: string, status: 'pending' | 'reviewed' | 'resolved') {
    await initSeedData();
    if (isConnectedToMongo) {
      return await (ReportModel as any).findByIdAndUpdate(id, { status }, { new: true });
    }
    const rep = memoryReports.find((r) => r._id.toString() === id.toString());
    if (rep) {
      rep.status = status;
      rep.updatedAt = new Date();
      return rep;
    }
    return null;
  },

  // Platform Impact Statistics
  async getPlatformStats() {
    await initSeedData();
    let totalCampaigns = 0;
    let totalSupporters = 0;
    let totalCreditsRaised = 0;
    let successfulCampaigns = 0;

    if (isConnectedToMongo) {
      totalCampaigns = await CampaignModel.countDocuments({ status: 'approved' });
      totalSupporters = await UserModel.countDocuments({ role: 'supporter' });
      const raisedAgg = await CampaignModel.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$amount_raised' } } },
      ]);
      totalCreditsRaised = raisedAgg[0]?.total || 0;
      successfulCampaigns = await CampaignModel.countDocuments({
        status: 'approved',
        $expr: { $gte: ['$amount_raised', '$funding_goal'] },
      });
    } else {
      const approved = memoryCampaigns.filter((c) => c.status === 'approved');
      totalCampaigns = approved.length;
      totalSupporters = memoryUsers.filter((u) => u.role === 'supporter').length;
      totalCreditsRaised = approved.reduce((acc, c) => acc + (c.amount_raised || 0), 0);
      successfulCampaigns = approved.filter((c) => (c.amount_raised || 0) >= c.funding_goal).length;
    }

    return {
      totalCampaigns,
      totalSupporters,
      totalCreditsRaised,
      successfulCampaigns,
    };
  },

  // Admin Dashboard Overview Stats
  async getAdminStats() {
    await initSeedData();
    let totalSupporters = 0;
    let totalCreators = 0;
    let totalAvailableCredits = 0;
    let totalPaymentsProcessed = 0;

    if (isConnectedToMongo) {
      totalSupporters = await UserModel.countDocuments({ role: 'supporter' });
      totalCreators = await UserModel.countDocuments({ role: 'creator' });
      const credAgg = await UserModel.aggregate([{ $group: { _id: null, total: { $sum: '$credits' } } }]);
      totalAvailableCredits = credAgg[0]?.total || 0;
      const payAgg = await PaymentModel.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
      totalPaymentsProcessed = payAgg[0]?.total || 0;
    } else {
      totalSupporters = memoryUsers.filter((u) => u.role === 'supporter').length;
      totalCreators = memoryUsers.filter((u) => u.role === 'creator').length;
      totalAvailableCredits = memoryUsers.reduce((sum, u) => sum + (u.credits || 0), 0);
      totalPaymentsProcessed = memoryPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    }

    return {
      totalSupporters,
      totalCreators,
      totalAvailableCredits,
      totalPaymentsProcessed,
    };
  },
};
