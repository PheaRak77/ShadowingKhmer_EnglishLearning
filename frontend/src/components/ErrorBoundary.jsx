import React from 'react';
import { Headphones, RotateCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('ShadowingKhmer UI ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-xl p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Headphones className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-extrabold text-slate-900">
                Shadowing<span className="text-[#2563EB]">Khmer</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Something paused unexpectedly. Tap below to refresh smoothly.
              </p>
              <p className="text-xs text-slate-500 khmer-text">
                មានបញ្ហាបច្ចេកទេសបន្តិចបន្តួច សូមចុចផ្ទុកទំព័រឡើងវិញ។
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>Reload ShadowingKhmer</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
