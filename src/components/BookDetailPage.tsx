import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Book } from "../types/books.types";
import "../css/BookDetailPage.css"

const BookDetailPage = () => {
    const { id } = useParams();
    const [book, setBook] = useState<Book | null>(null);
    const [googleReviews, setGoogleReviews] = useState<{ rating: number; count: number } | null>(null);
    const [userReview, setUserReview] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const googleResponse = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
                
                // Kontrollera om svaret är OK
                if (!googleResponse.ok) {
                    throw new Error(`Fel från Google API: ${googleResponse.statusText}`);
                }
    
                const googleText = await googleResponse.text();   
                if (!googleText) {
                    throw new Error("Tomt svar från Google API");
                }
    
                const data = JSON.parse(googleText); // Parse JSON efter textkontrollen
                if (!data || !data.volumeInfo) {
                    throw new Error("Inget giltigt dataobjekt mottogs från Google API.");
                }
    
                setBook({
                    id: data.id,
                    title: data.volumeInfo.title,
                    authors: data.volumeInfo.authors || ["Okänd författare"],
                    publishedDate: data.volumeInfo.publishedDate || "Okänt",
                    description: data.volumeInfo.description || "Ingen beskrivning tillgänglig",
                    smallThumbnail: data.volumeInfo.imageLinks?.smallThumbnail || "",
                    thumbnail: data.volumeInfo.imageLinks?.thumbnail || "",
                });
    
                setGoogleReviews(data.volumeInfo.ratingsCount > 0 ? {
                    rating: data.volumeInfo.averageRating,
                    count: data.volumeInfo.ratingsCount
                } : null);
    
                // Hämtar recensioner från eget API
                const userResponse = await fetch(`http://localhost:4000/reviews/${id}`);
    
                if (!userResponse.ok) {
                    if (userResponse.status === 404) {
                        console.warn(`Ingen recension hittades för boken med id: ${id}`);
                        setUserReview([]); // Här sätts en tom array för att indikera att det inte finns recensioner
                    } else {
                        throw new Error("Något gick fel vid hämtning av recensioner");
                    }
                }
    
                const userText = await userResponse.text();
    
                if (!userText) {
                    setUserReview([]); // Om svaret är tomt, sätt till tom array
                } else {
                    const userData = JSON.parse(userText);
                    if (userData && Array.isArray(userData)) {
                        setUserReview(userData);
                    } else {
                        setUserReview([]); // Om inget är returnerat, sätt till tom array
                    }
                }
    
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
                        <p><strong>Författare:</strong> {book.authors}</p>
                        <p><strong>Publiceringsdatum:</strong> {book.publishedDate}</p>
                        {googleReviews ? (
                            <div className="google-reviews">
                                <p><strong>Google Betyg:</strong> {googleReviews.rating}⭐ av  ({googleReviews.count} röster)</p>
                            </div>
                        ) : (
                            <p>Inga recensioner från Google.</p>
                        )}
                        {userReview && userReview.length > 0 ? (
                            <div className="user-reviews">
                                {userReview.map((review, index) => (
                                    <div key={index} className="user-review">
                                        <p><strong>Betyg:</strong> {review.rating}⭐</p>
                                        <p><strong>Recension:</strong> {review.text}</p>
                                        <p><em>– Användare {review.userId}</em></p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>Inga recensioner från användare.</p>
                        )}
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