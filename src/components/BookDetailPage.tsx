import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Book } from "../types/books.types";
import "../css/BookDetailPage.css"

const BookDetailPage = () => {
    const { id } = useParams();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const respone = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
                const data = await respone.json();

                setBook({
                    id: data.id,
                    title: data.volumeInfo.title,
                    authors: data.volumeInfo.authors || ["Okänd författare"],
                    publishedDate: data.volumeInfo.publishedDate || "Okänt",
                    description: data.volumeInfo.description || "Ingen beskrivning tillgänglig",
                    smallThumbnail: data.volumeInfo.imageLinks?.smallThumbnail || "",
                    thumbnail: data.volumeInfo.imageLinks?.thumbnail || "",
                });
            } catch (error) {
                console.error("Fel vid hämtning av bok:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookDetails();
    }, [id]);

    return (
        <div className="book-detail-page">
            <button className="btn back-btn" onClick={() => navigate(-1)}>Tillbaka</button>
            {loading ? (
                <h3 className="loading-message">Laddar bok...</h3>
            ) : book ? (
                <div className="book-detail-container">
                    {book.thumbnail ? (
                        <img src={book.thumbnail} alt={book.title} className="book-thumbnail" />
                    ) : (
                        <p className="no-image">Ingen bild tillgänglig</p>
                    )}
                    <div className="book-info">
                        <h1>{book.title}</h1>
                        <h3>Författare: {book.authors}</h3>
                        <p><strong>Publiceringsdatum:</strong> {book.publishedDate}</p>
                        <p><strong>Beskrivning:</strong> {book.description}</p>
                    </div>
                </div>
            ) : (
                <h3 className="error-message">Boken kunde inte hämtas.</h3>
            )}
        </div>
    );
};

export default BookDetailPage;