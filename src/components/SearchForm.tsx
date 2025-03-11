import { useState, useEffect } from 'react';
import { useBooks } from '../context/BookContext';
import "../css/BookPage.css";

const SearchForm = () => {
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const { fetchBooks } = useBooks();

    // Ladda senaste sökningar från localStorage vid uppstart
    useEffect(() => {
        const savedSearches = localStorage.getItem('recentBookSearches');
        if (savedSearches) {
            try {
                const parsedSearches = JSON.parse(savedSearches);
                if (Array.isArray(parsedSearches)) {
                    setRecentSearches(parsedSearches.slice(0, 5));
                }
            } catch (err) {
                console.error("Kunde inte läsa sökhistorik:", err);
            }
        }
    }, []);

    // Spara sökhistorik i localStorage när den uppdateras
    useEffect(() => {
        localStorage.setItem('recentBookSearches', JSON.stringify(recentSearches));
    }, [recentSearches]);

    // Validera söktermen
    const validateSearch = (searchTerm: string): boolean => {
        // Rensa tidigare fel
        setError(null);

        // Kontrollera om söktermen är tom
        if (searchTerm.trim() === "") {
            setError("Sökfältet får inte vara tomt");
            return false;
        }

        // Kontrollera om söktermen är för kort
        if (searchTerm.trim().length < 2) {
            setError("Söktermen måste vara minst 2 tecken");
            return false;
        }

        // Kontrollera om söktermen är för lång
        if (searchTerm.trim().length > 50) {
            setError("Söktermen får inte vara längre än 50 tecken");
            return false;
        }

        // Kontrollera om söktermen innehåller specialtecken som kan orsaka problem
        const specialCharsRegex = /[<>{}[\]\\^~]/;
        if (specialCharsRegex.test(searchTerm)) {
            setError("Söktermen innehåller ogiltiga tecken");
            return false;
        }

        return true;
    };

    // Uppdatera sökhistoriken
    const updateRecentSearches = (searchTerm: string) => {
        const trimmedTerm = searchTerm.trim();

        // Kontrollera om söktermen redan finns i listan
        if (recentSearches.includes(trimmedTerm)) {
            // Om söktermen redan finns, ta bort den och lägg till den på nytt överst
            setRecentSearches([
                trimmedTerm,
                ...recentSearches.filter(term => term !== trimmedTerm)
            ].slice(0, 5));
        } else {
            // Om söktermen är ny, lägg till den överst och behåll max 5 sökningar
            setRecentSearches([trimmedTerm, ...recentSearches].slice(0, 5));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validera söktermen innan sökning
        if (!validateSearch(search)) {
            return;
        }

        try {
            setIsLoading(true);

            // Uppdatera sökhistoriken
            updateRecentSearches(search);

            await fetchBooks(search);
        } catch (err) {
            setError("Kunde inte slutföra sökningen. Försök igen senare.");
            console.error("Search error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Hantera ändringar i sökfältet med realtidsvalidering
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        // Realtidsvalidering när användaren skriver
        if (value.trim().length > 50) {
            setError("Söktermen får inte vara längre än 50 tecken");
        } else if (value.trim().length > 0 && value.trim().length < 2) {
            setError("Söktermen måste vara minst 2 tecken");
        } else {
            setError(null);
        }
    };

    // Välj en tidigare sökning
    const selectRecentSearch = (term: string) => {
        setSearch(term);
        setError(null);
    };

    // Rensa sökfältet
    const clearSearch = () => {
        setSearch("");
        setError(null);
    };

    // Radera en specifik sökterm från historiken
    const removeSearchTerm = (term: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Förhindra att den även väljer söktermen
        setRecentSearches(recentSearches.filter(item => item !== term));
    };

    // Rensa hela sökhistoriken
    const clearSearchHistory = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentBookSearches');
    };

    return (
        <div className="search-container">
            <form onSubmit={handleSubmit} className="search-form">
                {error && (
                    <div id="search-error" className="error-message" role="alert">
                        {error}
                    </div>
                )}
                <div className="search-input-container">
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Sök efter en bok..."
                        className={`search-input ${error ? 'search-input-error' : ''}`}
                        disabled={isLoading}
                        aria-invalid={error ? "true" : "false"}
                        aria-describedby={error ? "search-error" : undefined}
                    />
                    {search && (
                        <button
                            type="button"
                            className="clear-button"
                            onClick={clearSearch}
                            aria-label="Rensa sökning"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <button
                    type="submit"
                    className="search-button"
                    disabled={isLoading || !!error || search.trim() === ""}>
                    {isLoading ? "Söker..." : "🔍 Sök"}
                </button>
            </form>

            {recentSearches.length > 0 && (
                <div className="recent-searches">
                    <div className="recent-searches-header">
                        <h3>Senaste sökningar:</h3>
                        <button
                            type="button"
                            className="clear-history-button"
                            onClick={clearSearchHistory}
                            aria-label="Rensa sökhistorik">
                            Rensa alla <i className="bi bi-x" ></i>
                        </button>
                    </div>
                    <ul className="recent-searches-list">
                        {recentSearches.map((term, index) => (
                            <li key={index} className="recent-search-item">
                                <button
                                    type="button"
                                    onClick={() => selectRecentSearch(term)}
                                    className="recent-search-button"
                                >
                                    {term}
                                    <span
                                        className="remove-search"
                                        onClick={(e) => removeSearchTerm(term, e)}
                                        aria-label={`Ta bort sökning: ${term}`}
                                    >
                                        ✕
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="search-tips">
                <p>Söktips: Du kan söka på titel, författare eller ISBN-nummer.</p>
            </div>
        </div>
    );
};

export default SearchForm;