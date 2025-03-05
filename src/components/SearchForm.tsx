import {useState} from 'react'
import { useBooks } from '../context/BookContext';
import "../css/BookPage.css"

const SearchForm = () => {
    const [search, setSearch]  = useState("");
    const { fetchBooks } = useBooks();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim() !== "") {
            fetchBooks(search); // Skicka söktermen till API-anropet
        }
    };
    return (
        <form onSubmit={handleSubmit} className="search-form">
            <input 
                type="text" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Sök efter en bok..."
                className="search-input"
            />
            <button type="submit" className="search-button">🔍 Sök</button>
        </form>
    );
}

export default SearchForm