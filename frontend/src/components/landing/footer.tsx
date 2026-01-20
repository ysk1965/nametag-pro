'use client';

import { CheckCircle2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="bg-slate-800 text-white p-1 rounded">
            <CheckCircle2 size={20} />
          </div>
          <span className="font-bold">NameTag Pro</span>
        </div>
        <div className="text-slate-400 text-sm">
          © 2026 NameTag Pro. All rights reserved. Professional tools for event
          organizers.
        </div>
        <div className="flex gap-6 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-blue-600">
            Privacy
          </a>
          <a href="#" className="hover:text-blue-600">
            Terms
          </a>
          <a href="#" className="hover:text-blue-600">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
