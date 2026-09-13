export type UserRole = 'supporter' | 'creator' | 'admin';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  photoUrl?: string;
  role: UserRole;
  credits: number;
  createdAt?: string;
}

export interface Campaign {
  _id: string;
  id?: string;
  campaign_title: string;
  campaign_story: string;
  category: string;
  funding_goal: number;
  minimum_contribution: number;
  deadline: string;
  reward_info: string;
  campaign_image_url: string;
  creator_email: string;
  creator_name: string;
  amount_raised: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  createdAt: string;
  updatedAt?: string;
}

export interface Contribution {
  _id: string;
  campaign_id: string;
  campaign_title: string;
  contribution_amount: number;
  supporter_email: string;
  supporter_name: string;
  creator_name: string;
  creator_email: string;
  current_date: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  createdAt: string;
}

export interface Withdrawal {
  _id: string;
  creator_email: string;
  creator_name: string;
  withdrawal_credit: number;
  withdrawal_amount: number;
  payment_system: 'Stripe' | 'Bkash' | 'Rocket' | 'Nagad';
  account_number: string;
  withdraw_date: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Payment {
  _id: string;
  user_email: string;
  package_name: string;
  credits: number;
  amount: number;
  transaction_id: string;
  payment_method: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  message: string;
  toEmail: string;
  actionRoute: string;
  time: string;
  read: boolean;
  createdAt: string;
}

export interface ReportItem {
  _id: string;
  campaign_id: string;
  campaign_title: string;
  reporter_name: string;
  reporter_email: string;
  reason: string;
  date: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export interface PlatformStats {
  totalCampaigns: number;
  totalSupporters: number;
  totalCreditsRaised: number;
  successfulCampaigns: number;
}
