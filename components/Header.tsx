import React from 'react';

interface CategoryCardProps {
  title: string;
  image: string;
  links: { id: string; name: string; icon: React.ComponentType<{ className?: string }> }[];
  onNavigate: (pageId: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, image, links, onNavigate }) => {
  return (
    <div className="bg-dark-card rounded-2xl p-4 flex flex-col">
      <div className="relative h-24 rounded-lg overflow-hidden mb-4">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <h3 className="text-white font-bold text-lg">{title}</h3>
        </div>
      </div>
      <div className="flex-1">
        <ul className="space-y-2">
            {links.map(link => (
                <li key={link.id}>
                    <button onClick={() => onNavigate(link.id)} className="flex items-center text-dark-text-secondary hover:text-dark-text transition-colors text-sm w-full text-left">
                        <link.icon className="w-4 h-4 mr-2.5" />
                        {link.name}
                    </button>
                </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryCard;
