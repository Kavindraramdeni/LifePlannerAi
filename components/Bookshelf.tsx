import React, { useState } from 'react';
import { Book } from '../types';
import ViewWrapper from './ViewWrapper';
import { PlusIcon, PencilIcon, TrashIcon, MoreVerticalIcon } from './icons';
import BookModal from './BookModal';
import { useData } from '../contexts/DataContext';

const Bookshelf: React.FC = () => {
  const { books, saveBook, deleteBook } = useData();
  const [activeTab, setActiveTab] = useState<'To Read' | 'Reading' | 'Read'>('Reading');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  const filteredBooks = books.filter(b => b.status === activeTab);

  const handleOpenNewModal = () => {
    setBookToEdit(null);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (book: Book) => {
    setBookToEdit(book);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
        deleteBook(id);
    }
    setActiveMenuId(null);
  };

  const handleSave = (bookData: Omit<Book, 'id'> | Book) => {
      saveBook(bookData);
      setIsModalOpen(false);
  };

  return (
    <>
      <BookModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        bookToEdit={bookToEdit}
      />
      <ViewWrapper title="Bookshelf" onBack={() => {}}>
        <div className="p-4 sm:p-6 lg:p-8" onClick={() => setActiveMenuId(null)}>
          <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2 bg-dark-accent p-1 rounded-lg">
                  {(['To Read', 'Reading', 'Read'] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1 text-sm rounded-md transition-colors ${activeTab === tab ? 'bg-dark-card text-dark-text' : 'text-dark-text-secondary'}`}>
                      {tab}
                      </button>
                  ))}
              </div>
              <button onClick={handleOpenNewModal} className="flex items-center px-4 py-2 bg-dark-purple text-white font-semibold rounded-lg">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Book
              </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {filteredBooks.map(book => (
                  <div key={book.id} className="relative">
                      <img src={book.coverUrl} alt={book.title} className="w-full aspect-[2/3] rounded-lg object-cover shadow-lg transition-all" />
                      <div className="absolute top-2 right-2">
                          <button 
                              onClick={(e) => { e.stopPropagation(); setActiveMenuId(book.id === activeMenuId ? null : book.id); }} 
                              className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                          >
                              <MoreVerticalIcon className="w-4 h-4" />
                          </button>
                          {activeMenuId === book.id && (
                              <div className="absolute right-0 mt-2 w-36 bg-dark-accent border border-dark-border rounded-md shadow-lg z-10 py-1">
                                  <button onClick={() => handleOpenEditModal(book)} className="w-full flex items-center px-3 py-2 text-sm text-dark-text hover:bg-dark-card">
                                      <PencilIcon className="w-4 h-4 mr-2" /> Edit
                                  </button>
                                  <button onClick={() => handleDelete(book.id)} className="w-full flex items-center px-3 py-2 text-sm text-project-red-from hover:bg-dark-card">
                                      <TrashIcon className="w-4 h-4 mr-2" /> Delete
                                  </button>
                              </div>
                          )}
                      </div>
                      <h4 className="mt-2 font-bold truncate">{book.title}</h4>
                      <p className="text-sm text-dark-text-secondary truncate">{book.author}</p>
                  </div>
              ))}
          </div>
        </div>
      </ViewWrapper>
    </>
  );
};

export default Bookshelf;
