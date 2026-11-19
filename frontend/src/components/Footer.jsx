import React, { memo } from 'react';
import { Headphones, Globe, Mail, Github, ExternalLink, Heart, Sparkles } from 'lucide-react';

function Footer() {
  return (
    <footer className="mt-12 bg-white border-t border-slate-200/90 text-slate-600">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Column 1: Brand & Mission */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-sm">
                <Headphones className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                Shadowing<span className="text-[#2563EB]">Khmer</span>
              </span>
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100 khmer-text">
                អង់គ្លេស-ខ្មែរ
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md khmer-text">
              វេទិកាហាត់និយាយភាសាអង់គ្លេសតាមវីដេអូ YouTube ជាមួយការបកប្រែភាសាខ្មែរ វាក្យសព្ទ និងវេយ្យាករណ៍សម្រាប់សិស្សានុសិស្សកម្ពុជា។
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                <Sparkles className="w-3 h-3 text-[#2563EB]" /> 4-Min Video Support
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                📱 Mobile • Tablet • Desktop
              </span>
            </div>
          </div>

          {/* Column 2: Quick Features */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Practice Modes
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
              <li className="hover:text-[#2563EB] transition-colors">
                1. Video Shadowing & Khmer Translation
              </li>
              <li className="hover:text-[#2563EB] transition-colors">
                2. Interactive Sentence Loop & Speed Control
              </li>
              <li className="hover:text-[#2563EB] transition-colors">
                3. Vocabulary Deck & 3D Flashcards
              </li>
              <li className="hover:text-[#2563EB] transition-colors">
                4. Bilingual English-Khmer Grammar
              </li>
            </ul>
          </div>

          {/* Column 3: Author & Contact Information */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Author & Contact Information
            </h3>
            <p className="text-xs text-slate-500">
              Designed & Developed by <strong className="text-slate-800">Yorn Pheareak</strong>
            </p>

            <div className="space-y-2 pt-1">
              {/* Website Link */}
              <a
                href="https://www.ypheareak.site/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-blue-50/60 hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-[11px] font-semibold text-slate-400 leading-none">
                      Official Website
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#2563EB] truncate mt-0.5">
                      www.ypheareak.site
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2563EB] shrink-0" />
              </a>

              {/* GitHub Link */}
              <a
                href="https://github.com/PheaRak77"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center shrink-0">
                    <Github className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-[11px] font-semibold text-slate-400 leading-none">
                      GitHub Profile
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-slate-950 truncate mt-0.5">
                      github.com/PheaRak77
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 shrink-0" />
              </a>

              {/* Email Link */}
              <a
                href="mailto:yornpheareak168@gmail.com"
                className="group flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-rose-50/60 hover:border-rose-200 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-[11px] font-semibold text-slate-400 leading-none">
                      Email Contact
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-rose-600 truncate mt-0.5">
                      yornpheareak168@gmail.com
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} ShadowingKhmer. Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>by</span>
            <a
              href="https://www.ypheareak.site/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-slate-700 hover:text-[#2563EB]"
            >
              Yorn Pheareak (PheaRak77)
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/PheaRak77"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 font-medium"
            >
              GitHub
            </a>
            <span>•</span>
            <a
              href="https://www.ypheareak.site/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 font-medium"
            >
              Portfolio
            </a>
            <span>•</span>
            <a
              href="mailto:yornpheareak168@gmail.com"
              className="hover:text-slate-700 font-medium"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);

