import { Header } from '@/components/layout/Header';

export default function DashboardPage() {
  return (
    <div>
      <Header title="Dashboard" description="Welcome to MJ Digital Admin" />
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Blogs', value: '—' },
            { label: 'Published', value: '—' },
            { label: 'Drafts', value: '—' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-6">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}