import { Tag } from '~/components/tag';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ProfileSection({
  title,
  children,
  className,
}: ProfileSectionProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

interface TagGridProps {
  tags: string[];
  variant?: 'default' | 'primary' | 'secondary';
}

export function TagGrid({ tags, variant = 'default' }: TagGridProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {tags.map((tag, index) => (
        <Tag key={index} variant={variant}>
          {tag}
        </Tag>
      ))}
    </div>
  );
}
