import React, { useState, useEffect, useRef } from 'react';
import { Book } from '../types';

interface BookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (book: Omit<Book, 'id'> | Book) => void;
    bookToEdit?: Book | null;
}

const BookModal: React.FC<BookModalProps> = ({ isOpen, onClose, onSave, bookToEdit }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [status, setStatus] = useState<'To Read' | 'Reading' | 'Read'>('To Read');

    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
            if (bookToEdit) {
                setTitle(bookToEdit.title);
                setAuthor(bookToEdit.author);
                setCoverUrl(bookToEdit.coverUrl);
                setStatus(bookToEdit.status);
            } else {
                setTitle('');
                setAuthor('');
                setCoverUrl('');
                setStatus('To Read');
            }
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen, bookToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const bookData = {
            title,
            author,
            coverUrl,
            status,
        };

        if (bookToEdit) {
            onSave({ ...bookToEdit, ...bookData });
        } else {
            onSave(bookData);
        }
    };

    return (
        <dialog ref={dialogRef} onClose={onClose} onClick={(e) => e.target === dialogRef.current && onClose()} className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-md text-dark-text backdrop:bg-black/50">
            <h2 className="text-2xl font-bold mb-4">{bookToEdit ? 'Edit Book' : 'Add Book'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="book-title" className="text-sm text-dark-text-secondary">Title</label>
                    <input id="book-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" required />
                </div>
                <div>
                    <label htmlFor="book-author" className="text-sm text-dark-text-secondary">Author</label>
                    <input id="book-author" type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" required />
                </div>
                <div>
                    <label htmlFor="book-cover" className="text-sm text-dark-text-secondary">Cover Image URL</label>
                    <input id="book-cover" type="text" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" required />
                </div>
                <div>
                    <label htmlFor="book-status" className="text-sm text-dark-text-secondary">Status</label>
                    <select id="book-status" value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-dark-accent p-2 rounded-lg mt-1">
                        <option>To Read</option>
                        <option>Reading</option>
                        <option>Read</option>
                    </select>
                </div>
                 <div className="flex gap-4 mt-6">
                    <button type="button" onClick={onClose} className="w-full py-2 bg-dark-accent text-white font-semibold rounded-lg">Cancel</button>
                    <button type="submit" className="w-full py-2 bg-dark-purple text-white font-semibold rounded-lg">Save Book</button>
                </div>
            </form>
        </dialog>
    );
};

export default BookModal;
