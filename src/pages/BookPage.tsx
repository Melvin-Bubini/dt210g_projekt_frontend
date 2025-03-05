import { useBooks } from "../context/BookContext";
import SearchForm from "../components/SearchForm";
import { useNavigate } from "react-router-dom";


const BookPage = () => {
    const { books, loading } = useBooks();
    const navigate = useNavigate();

    return (
        <div className="book-page">
            <h1 className="title text-center text-3xl mt-10">Sök efter böcker</h1>
            <h2 className="title text-center text-2xl mb-10">Skriv in vilken bok du letar efter</h2>
            <SearchForm /> {/* Sökformulär */}

            {loading ? (
                <h3 className="loading-message text-center">Laddar böcker...</h3>
            ) : !books.length ? (
                <h3 className="error-message text-center">Inga böcker hittades.</h3>
            ) : (
                <div className="table-container">
                    <table className="book-table">
                        <thead>
                            <tr>
                                <th>Bild</th>
                                <th>Titel</th>
                                <th>Författare</th>
                                <th>Utgivningsdatum</th>
                                <th>Beskrivning</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map((book) => (
                                <tr key={book.id} className="book-row" onClick={() => navigate(`/book/${book.id}`)}>
                                    <td>
                                        {book.thumbnail ? (
                                            <img src={book.thumbnail} alt={book.title} className="book-thumbnail" />
                                        ): (
                                            <p className="no-image">Ingen bild tillgänglig</p>
                                        )}
                                    </td>
                                    <td>{book.title}</td>
                                    <td>{book.authors}</td>
                                    <td>{book.publishedDate}</td>
                                    <td>{book.description ? book.description.slice(0, 100) + "..." : "Ingen beskrivning"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BookPage;
