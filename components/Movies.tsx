import React, { useState } from 'react';
import { Movie } from '../types';
import ViewWrapper from './ViewWrapper';
import { PlusIcon } from './icons';
import MovieModal from './MovieModal';
import { useData } from '../contexts/DataContext';

const Movies: React.FC = () => {
  const { movies, saveMovie } = useData();
  const [activeTab, setActiveTab] = useState<'Watchlist' | 'Watching' | 'Watched'>('Watchlist');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Movie | null>(null);

  const filteredItems = movies.filter(i => i.status === activeTab);

  const handleOpenNewModal = () => {
      setItemToEdit(null);
      setIsModalOpen(true);
  };
  
  const handleSaveItem = (itemData: Omit<Movie, 'id'> | Movie) => {
    saveMovie(itemData);
    setIsModalOpen(false);
  };

  return (
    <>
      <MovieModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        movieToEdit={itemToEdit}
      />
      <ViewWrapper title="Movies & Series" onBack={() => {}}>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2 bg-dark-accent p-1 rounded-lg">
                  {(['Watchlist', 'Watching', 'Watched'] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1 text-sm rounded-md transition-colors ${activeTab === tab ? 'bg-dark-card text-dark-text' : 'text-dark-text-secondary'}`}>
                      {tab}
                      </button>
                  ))}
              </div>
              <button onClick={handleOpenNewModal} className="flex items-center px-4 py-2 bg-dark-purple text-white font-semibold rounded-lg">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Item
              </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {filteredItems.map(item => (
                  <div key={item.id} className="group">
                      <img src={item.posterUrl} alt={item.title} className="w-full aspect-[2/3] rounded-lg object-cover shadow-lg group-hover:scale-105 transition-transform" />
                      <h4 className="mt-2 font-bold truncate">{item.title}</h4>
                      <p className="text-sm text-dark-text-secondary">{item.type}</p>
                  </div>
              ))}
          </div>
        </div>
      </ViewWrapper>
    </>
  );
};

export default Movies;
