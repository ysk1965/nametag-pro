'use client';

import { Upload, Edit, Download } from 'lucide-react';

const features = [
  {
    icon: Upload,
    title: 'Bulk Upload',
    description:
      'Import your Excel or CSV list. We support automatic column mapping for names and roles.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Edit,
    title: 'Interactive Editor',
    description:
      'Drag and drop the name position. Choose fonts, sizes, and colors that match your branding.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Download,
    title: 'Print-Ready PDF',
    description:
      'Download A4 PDFs with 2x2, 2x3, or 3x3 grids. High 300dpi resolution for crisp text.',
    color: 'bg-amber-100 text-amber-600',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need for event planning
          </h2>
          <p className="text-lg text-slate-500">
            Streamlined workflow designed for busy event organizers.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white p-8 rounded-2xl border hover:shadow-lg transition-shadow"
            >
              <div
                className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-6`}
              >
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
