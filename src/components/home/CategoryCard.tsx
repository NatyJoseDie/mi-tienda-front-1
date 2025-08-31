import type { IconType } from 'react-icons';

interface CategoryCardProps {
  icon: IconType;
  title: string;
  description: string;
  className?: string;
}

export default function CategoryCard({ icon: Icon, title, description, className }: CategoryCardProps) {
  return (
    <div className={`p-8 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer ${className}`}>
      <div className="mb-6 inline-block p-4 bg-white/30 rounded-xl shadow-sm">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-sm opacity-90 leading-relaxed">{description}</p>
    </div>
  );
}
