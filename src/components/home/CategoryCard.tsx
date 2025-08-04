import type { IconType } from 'react-icons';

interface CategoryCardProps {
  icon: IconType;
  title: string;
  description: string;
  className?: string;
}

export default function CategoryCard({ icon: Icon, title, description, className }: CategoryCardProps) {
  return (
    <div className={`p-8 rounded-2xl shadow-lg transition-transform hover:-translate-y-1 ${className}`}>
      <div className="mb-4 inline-block p-4 bg-white/20 rounded-xl">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  );
}
