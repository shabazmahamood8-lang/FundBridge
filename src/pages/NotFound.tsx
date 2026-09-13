import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-teal-600">
          Error 404
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          The requested route does not exist or may have been relocated.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
