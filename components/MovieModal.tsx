import React, { useState, useEffect, useRef } from 'react';
import { Movie } from '../types';

interface MovieModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (movie: Omit<Movie, 'id'> | Movie) => void;
    movieToEdit?: Movie | null;
}

const MovieModal: React.FC<MovieModalProps> = ({ isOpen, onClose, onSave, movieToEdit }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<'Movie' | 'Series'>('Movie');
    const [posterUrl, setPosterUrl] = useState('');
    const [status, setStatus] = useState<'Watchlist' | 'Watching' | 'Watched'>('Watchlist');

    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
            if (movieToEdit) {
                setTitle(movieToEdit.title);
                setType(movieToEdit.type);
                setPosterUrl(movieToEdit.posterUrl);
                setStatus(movieToEdit.status);
            } else {
                // Reset form for new item
                setTitle('');
                setType('Movie');
                setPosterUrl('');
                setStatus('Watchlist');
            }
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen, movieToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const movieData = {
            title,
            type,
            posterUrl,
            status,
        };

        if (movieToEdit) {
            onSave({ ...movieToEdit, ...movieData });
        } else {
            onSave(movieData);
        }
    };

    return (
        <dialog ref={dialogRef} onClose={onClose} onClick={(e) => e.target === dialogRef.current && onClose()} className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-md text-dark-text backdrop:bg-black/50">
            <h2 className="text-2xl font-bold mb-4">{movieToEdit ? 'Edit Item' : 'Add Item'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="movie-title" className="text-sm text-dark-text-secondary">Title</label>
                    <input id="movie-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" required />
                </div>
                <div>
                    <label htmlFor="movie-poster" className="text-sm text-dark-text-secondary">Poster Image URL</label>
                    <input id="movie-poster" type="text" value={posterUrl} onChange={e => setPosterUrl(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="movie-type" className="text-sm text-dark-text-secondary">Type</label>
                        <select id="movie-type" value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-dark-accent p-2 rounded-lg mt-1">
                            <option>Movie</option>
                            <option>Series</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="movie-status" className="text-sm text-dark-text-secondary">Status</label>
                        <select id="movie-status" value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-dark-accent p-2 rounded-lg mt-1">
                            <option>Watchlist</option>
                            <option>Watching</option>
                            <option>Watched</option>
                        </select>
                    </div>
                </div>
                 <div className="flex gap-4 mt-6">
                    <button type="button" onClick={onClose} className="w-full py-2 bg-dark-accent text-white font-semibold rounded-lg">Cancel</button>
                    <button type="submit" className="w-full py-2 bg-dark-purple text-white font-semibold rounded-lg">Save Item</button>
                </div>
            </form>
        </dialog>
    );
};

export default MovieModal;
