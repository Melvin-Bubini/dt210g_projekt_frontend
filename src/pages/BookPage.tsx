import { useBooks } from "../context/BookContext";
import SearchForm from "../components/SearchForm";

const BookPage = () => {
    const { books, loading } = useBooks();

    return (
        <div className="book-page">
            <h1 className="title">Sök efter böcker</h1>
            <SearchForm /> {/* Sökformulär */}

            {loading ? (
                <h3 className="loading-message">Laddar böcker...</h3>
            ) : !books.length ? (
                <h3 className="error-message">Inga böcker hittades.</h3>
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
                                <tr key={book.id} className="book-row">
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
