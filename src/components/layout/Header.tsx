interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <div className="border-b border-slate-200 bg-white px-6 py-4">
      <h1 className="text-lg font-bold text-slate-900">{title}</h1>
      {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
    </div>
  );
}