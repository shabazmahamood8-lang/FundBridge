import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import {
  ArrowRight,
  Sparkles,
  Compass,
  HeartHandshake,
  TrendingUp,
  Cpu,
  HeartPulse,
  GraduationCap,
  Users,
  Leaf,
  Palette,
  Star,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import api from '../services/api.js';
import { Campaign, PlatformStats } from '../types/index.js';
import CampaignCard from '../components/common/CampaignCard.js';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

export default function Home() {
  const [topCampaigns, setTopCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    totalCampaigns: 6,
    totalSupporters: 120,
    totalCreditsRaised: 14640,
    successfulCampaigns: 4,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [campRes, statsRes] = await Promise.all([
          api.get('/campaigns/top-funded'),
          api.get('/stats/platform'),
        ]);
        if (campRes.data.success) {
          setTopCampaigns(campRes.data.campaigns || []);
        }
        if (statsRes.data.success && statsRes.data.stats) {
          setStats(statsRes.data.stats);
        }
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const heroSlides = [
    {
      id: 1,
      badge: 'Back the Next Big Breakthrough',
      heading: 'Fund Innovative Ideas That Shape Tomorrow',
      description:
        'Connect directly with pioneer engineers, sustainable designers, and hardware makers building the future of humanity.',
      ctaText: 'Explore Groundbreaking Projects',
      ctaLink: '/campaigns',
      secondaryText: 'Start a Campaign',
      secondaryLink: '/register',
      image:
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1400&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      badge: 'Transparent Grassroots Backing',
      heading: 'Support Meaningful Causes & Local Communities',
      description:
        'Empower clean water initiatives, solar agriculture, and educational robotics with verifiable milestone-based credit backing.',
      ctaText: 'Discover Impact Campaigns',
      ctaLink: '/campaigns?category=Community',
      secondaryText: 'See How It Works',
      secondaryLink: '#how-it-works',
      image:
        'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1400&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      badge: 'From Concept to Production',
      heading: 'Turn Bold Creative Visions into Living Reality',
      description:
        'FundBridge pairs creators with thousands of passionate backers. Retain 100% intellectual property while funding without predatory middlemen.',
      ctaText: 'Join as a Creator',
      ctaLink: '/register',
      secondaryText: 'View Top Campaigns',
      secondaryLink: '#top-campaigns',
      image:
        'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1400&auto=format&fit=crop&q=80',
    },
  ];

  const categories = [
    { name: 'Technology', icon: Cpu, count: '48 Projects', color: 'text-blue-600 bg-blue-50 border-blue-100 hover:border-blue-300' },
    { name: 'Health', icon: HeartPulse, count: '32 Projects', color: 'text-rose-600 bg-rose-50 border-rose-100 hover:border-rose-300' },
    { name: 'Education', icon: GraduationCap, count: '29 Projects', color: 'text-amber-600 bg-amber-50 border-amber-100 hover:border-amber-300' },
    { name: 'Community', icon: Users, count: '54 Projects', color: 'text-teal-600 bg-teal-50 border-teal-100 hover:border-teal-300' },
    { name: 'Environment', icon: Leaf, count: '41 Projects', color: 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:border-emerald-300' },
    { name: 'Art', icon: Palette, count: '23 Projects', color: 'text-purple-600 bg-purple-50 border-purple-100 hover:border-purple-300' },
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Dr. Aris Thorne',
      role: 'Biotech Founder & Creator',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      testimonial:
        'FundBridge gave us the exact momentum needed to fabricate our first clinical trials. The milestone approval system protected our backers while giving our engineering team reliable disbursement.',
      rating: 5,
    },
    {
      id: 2,
      name: 'Samantha Li',
      role: 'Early Backer & Patron',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      testimonial:
        'Purchasing credits is effortless, and seeing real-time transparency for ocean drone sensors makes me proud to contribute every month. Best crowdfunding experience by a mile.',
      rating: 5,
    },
    {
      id: 3,
      name: 'Tariq Al-Mansoor',
      role: 'Clean Energy Architect',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      testimonial:
        'The withdrawal system with instant local wallet integration (Bkash/Stripe) allowed our desert micro-grid project to buy solar cells the same day our contribution targets were approved.',
      rating: 5,
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION (SWIPER) */}
      <section className="relative w-full overflow-hidden bg-slate-950">
        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          effect="fade"
          speed={900}
          autoplay={{ delay: 6500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          className="w-full min-h-[560px] sm:min-h-[640px] text-white"
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative w-full h-[560px] sm:h-[640px] flex items-center">
                {/* Background Image with Gradient Overlay */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={slide.image}
                    alt={slide.heading}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center brightness-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
                  <div className="max-w-2xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold tracking-wide backdrop-blur-md">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{slide.badge}</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
                      {slide.heading}
                    </h1>

                    <p className="text-sm sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                      {slide.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <Link
                        to={slide.ctaLink}
                        className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-400/40 cursor-pointer"
                      >
                        <span>{slide.ctaText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      <Link
                        to={slide.secondaryLink}
                        className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm backdrop-blur-xs transition-colors"
                      >
                        {slide.secondaryText}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* 2. TOP FUNDED CAMPAIGNS */}
      <section id="top-campaigns" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-teal-600 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4" />
              <span>Highest Backed Initiatives</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Top Funded Campaigns
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Vetted campaigns demonstrating the highest community enthusiasm and verified backing.
            </p>
          </div>

          <Link
            to="/campaigns"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1.5 self-start sm:self-auto group"
          >
            <span>View All Campaigns</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse">
                <div className="w-full aspect-video bg-slate-200 rounded-xl" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : topCampaigns.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No campaigns launched yet</h3>
            <p className="text-xs text-slate-500 mt-1">Be the first innovator to launch a verified project on FundBridge.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCampaigns.map((camp) => (
              <CampaignCard key={camp._id} campaign={camp} />
            ))}
          </div>
        )}
      </section>

      {/* 4. EXTRA SECTION #1: HOW FUNDBRIDGE WORKS */}
      <section id="how-it-works" className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-teal-400 text-xs font-bold uppercase tracking-wider">
              Transparent & Verified Lifecycle
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              How FundBridge Works
            </h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              We eliminated the black-box risk of traditional crowdfunding with verified milestone escrow and direct creator validation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-8 space-y-4 hover:border-teal-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center font-extrabold text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-teal-400" />
                <span>Discover</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Browse rigorously moderated campaigns across technology, clean environment, community empowerment, and biomedical health.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-8 space-y-4 hover:border-teal-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center font-extrabold text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-teal-400" />
                <span>Contribute</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pledge credits securely. Credits remain in protected escrow until the creator accepts the contribution and logs project deliverables.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-8 space-y-4 hover:border-teal-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center font-extrabold text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-400" />
                <span>Track Impact</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive direct notification updates from the creator, track hardware prototyping, and unlock exclusive backer tier rewards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EXTRA SECTION #2: EXPLORE BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-teal-600 text-xs font-bold uppercase tracking-wider">
            Curated Sectors
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Explore by Category
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Find the causes and innovations that resonate with your passions.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/campaigns?category=${encodeURIComponent(cat.name)}`}
                className={`p-5 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-3 group shadow-2xs hover:shadow-md ${cat.color}`}
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{cat.count}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. EXTRA SECTION #3: PLATFORM IMPACT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 rounded-3xl p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            <div className="space-y-2 pt-4 sm:pt-0">
              <p className="text-3xl sm:text-5xl font-black text-teal-400">
                {stats.totalCampaigns}
              </p>
              <p className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                Total Campaigns
              </p>
            </div>

            <div className="space-y-2 pt-4 sm:pt-0">
              <p className="text-3xl sm:text-5xl font-black text-emerald-400">
                {stats.totalSupporters}
              </p>
              <p className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                Active Supporters
              </p>
            </div>

            <div className="space-y-2 pt-4 sm:pt-0">
              <p className="text-3xl sm:text-5xl font-black text-amber-400">
                {stats.totalCreditsRaised.toLocaleString()}
              </p>
              <p className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                Total Credits Raised
              </p>
            </div>

            <div className="space-y-2 pt-4 sm:pt-0">
              <p className="text-3xl sm:text-5xl font-black text-teal-300">
                {stats.successfulCampaigns}
              </p>
              <p className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                Fully Funded Goals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TESTIMONIALS (SWIPER) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-teal-600 text-xs font-bold uppercase tracking-wider">
            Verified Community Voices
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Voices from Backers & Creators
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Hear from innovators who launched on FundBridge and supporters who helped make it happen.
          </p>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          autoplay={{ delay: 5000 }}
          pagination={{ clickable: true }}
          className="pb-12"
        >
          {testimonials.map((t) => (
            <SwiperSlide key={t.id}>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between h-full shadow-xs hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                    "{t.testimonial}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-6 mt-4 border-t border-slate-100">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/20"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                    <p className="text-[11px] text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-teal-50 border border-teal-200 rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold text-teal-950">
              Ready to fund or launch your next idea?
            </h3>
            <p className="text-xs sm:text-sm text-teal-800 max-w-lg">
              Sign up today and receive complimentary onboarding credits to start backing breakthrough campaigns immediately.
            </p>
          </div>
          <Link
            to="/register"
            className="px-6 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
}
