import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github, Linkedin, Facebook, Heart, ShieldCheck, Mail, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Logo & Description */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Fund<span className="text-teal-400">Bridge</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              FundBridge is an impact-driven crowdfunding ecosystem where visionary creators connect with passionate backers to transform breakthroughs in technology, environment, health, and community life into reality.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Verified Creator Governance & Escrow Protection</span>
            </div>
          </div>

          {/* Explore Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/campaigns" className="hover:text-teal-400 transition-colors">
                  Explore Campaigns
                </Link>
              </li>
              <li>
                <Link to="/campaigns?category=Technology" className="hover:text-teal-400 transition-colors">
                  Technology & AI
                </Link>
              </li>
              <li>
                <Link to="/campaigns?category=Environment" className="hover:text-teal-400 transition-colors">
                  Clean Energy & Eco
                </Link>
              </li>
              <li>
                <Link to="/campaigns?category=Health" className="hover:text-teal-400 transition-colors">
                  Health Innovations
                </Link>
              </li>
              <li>
                <Link to="/campaigns?category=Community" className="hover:text-teal-400 transition-colors">
                  Community Impact
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#how-it-works" className="hover:text-teal-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <Link to="/register" className="hover:text-teal-400 transition-colors">
                  Launch a Campaign
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/fundbridge/fundbridge-client"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 transition-colors"
                >
                  Developer API
                </a>
              </li>
              <li>
                <span className="hover:text-teal-400 cursor-pointer transition-colors">
                  Trust & Security
                </span>
              </li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Connect</h4>
            <p className="text-xs text-slate-400">
              Reach our support team or follow our development updates:
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://github.com/fundbridge"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-teal-600 hover:text-white flex items-center justify-center text-slate-300 transition-colors"
                aria-label="GitHub repository"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/company/fundbridge"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-teal-600 hover:text-white flex items-center justify-center text-slate-300 transition-colors"
                aria-label="LinkedIn profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/fundbridge"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-teal-600 hover:text-white flex items-center justify-center text-slate-300 transition-colors"
                aria-label="Facebook page"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 pt-1">
              <Mail className="w-3.5 h-3.5 text-teal-400" />
              <span>support@fundbridge.com</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FundBridge Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted for creators and supporters worldwide</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
