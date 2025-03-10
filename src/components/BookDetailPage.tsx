import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addReview, updateReview, deleteReview, getReviews } from "../services/Reviews.services";
import { Book } from "../types/books.types";
import { Review } from "../types/reviews.types";
import { useAuth } from "../context/AuthContext";
import "../css/BookDetailPage.css"

const BookDetailPage = () => {
    const { id } = useParams();
    const [book, setBook] = useState<Book | null>(null);
    const [googleReviews, setGoogleReviews] = useState<{ rating: number; count: number } | null>(null);
    const [userReview, setUserReview] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState({ rating: 1, text: "" });
    const [editingReview, setEditingReview] = useState<{ rating: number; text: string } | null>(null); // För uppdateringsformuläret
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const googleResponse = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);

                // Kontrollera om svaret är OK
                if (!googleResponse.ok) {
                    throw new Error(`Fel från Google API: ${googleResponse.statusText}`);
                }

                // Konvertera svaret till JSON
                const data = await googleResponse.json();

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

                // Hämta recensioner från API
                const reviews = await getReviews(id as string);
                setUserReview(reviews);
            } catch (error) {
                console.error("Fel vid hämtning av bok:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookDetails();
    }, [id]);

    const handleAddReview = async () => {
        if (!user) {
            return alert("Du måste vara inloggad för att skriva en recension!");
        }
        if (!newReview.text.trim() || newReview.rating < 1) return alert("Skriv en recension och välj betyg!");
        try {
            const addedReview = await addReview({
                bookId: id as string,
                userId: user.id,
                reviewText: newReview.text,
                rating: newReview.rating
            });

            setUserReview([...(userReview || []), addedReview]); // Uppdatera listan direkt
            setNewReview({ rating: 0, text: "" }); // Töm formuläret
        } catch (error) {
            console.error("Fel vid tillägg av recension:", error);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        try {
            await deleteReview(reviewId);
            setUserReview((userReview || []).filter(review => review.id !== reviewId)); // Uppdatera listan direkt
        } catch (error) {
            console.error("Fel vid borttagning av recension:", error);
        }
    };

    // Öppna uppdateringsformuläret och sätt startvärdena
    const openUpdateForm = (review: any) => {
        setEditingReview({
            rating: review.rating,
            text: review.reviewText
        });
        setEditingReviewId(review.id);
    };

    // Stäng uppdateringsformuläret
    const closeUpdateForm = () => {
        setEditingReview(null);
        setEditingReviewId(null);
    };

    // Hantera uppdatering
    const handleUpdateReview = async () => {
        if (!editingReview || !editingReviewId) return;
        
        try {
            const updated = await updateReview(editingReviewId, {
                reviewText: editingReview.text,
                rating: editingReview.rating
            });
            
            setUserReview((userReview || []).map(review =>
                review.id === editingReviewId ? updated : review
            ));
            
            // Stäng formuläret efter uppdatering
            closeUpdateForm();
        } catch (error) {
            console.error("Fel vid uppdatering av recension:", error);
        }
    };


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
                                {userReview.map((review) => (
                                    <div key={review.id} className="user-review">
                                        <p><strong>Betyg:</strong> {review.rating}⭐</p>
                                        <p><strong>Recension:</strong> {review.reviewText}</p>
                                        <p><em>– Användare {review.userId}</em></p>
                                        <button onClick={() => handleDeleteReview(review.id)}>❌ Ta bort</button>
                                        <button onClick={() => openUpdateForm(review)}>✏️ Uppdatera</button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>Inga recensioner från användare.</p>
                        )}
                        
                        {/* Uppdateringsformulär */}
                        {editingReview && (
                            <div className="update-review-form">
                                <h2>Uppdatera recension</h2>
                                <div className="review-form">
                                    <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={editingReview.rating}
                                        onChange={(e) => setEditingReview({ 
                                            ...editingReview, 
                                            rating: Number(e.target.value) 
                                        })}
                                        required
                                        step="1"
                                    />
                                    <textarea
                                        value={editingReview.text}
                                        onChange={(e) => setEditingReview({ 
                                            ...editingReview, 
                                            text: e.target.value 
                                        })}
                                        placeholder="Uppdatera din recension..."
                                    />
                                    <div className="update-buttons">
                                        <button onClick={handleUpdateReview}>✅ Spara</button>
                                        <button onClick={closeUpdateForm}>❌ Avbryt</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Formulär för att lägga till recension */}
                        <h2>Skriv en recension</h2>
                        <div className="review-form">
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={newReview.rating}
                                onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                                required
                                step="1"
                            />
                            <textarea
                                value={newReview.text}
                                onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                                placeholder="Skriv din recension..."
                            />
                            <button onClick={handleAddReview}>➕ Lägg till recension</button>
                        </div>
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