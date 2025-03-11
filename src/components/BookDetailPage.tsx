import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addReview, updateReview, deleteReview, getReviews } from "../services/Reviews.services";
import { Book } from "../types/books.types";
import { useAuth } from "../context/AuthContext";
import "../css/BookDetailPage.css"

const BookDetailPage = () => {
    const { id } = useParams();
    const [book, setBook] = useState<Book | null>(null);
    const [googleReviews, setGoogleReviews] = useState<{ rating: number; count: number } | null>(null);
    const [userReview, setUserReview] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState({ rating: 1, text: "" });
    const [editingReview, setEditingReview] = useState<{ rating: number; text: string } | null>(null);
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ rating?: string; text?: string }>({});
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

    const validateReview = (review = newReview) => {
        const newErrors: { rating?: string; text?: string } = {};
        
        // Validera betyg
        if (review.rating < 1 || review.rating > 5 || isNaN(review.rating)) {
            newErrors.rating = "Betyg måste vara mellan 1 och 5.";
        }
        
        // Validera text
        if (review.text.length > 200) {
            newErrors.text = "Recensionstexten får inte vara längre än 200 tecken.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Funktion för att visa trunkerad text
    const truncateText = (text: string, maxLength = 50) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    const handleAddReview = async () => {
        if (!user) {
            return alert("Du måste vara inloggad för att skriva en recension!");
        }
        if (!validateReview()) return;
        
        try {
            const addedReview = await addReview({
                bookId: id as string,
                userId: user.id,
                reviewText: newReview.text,
                rating: newReview.rating
            });

            setUserReview([...(userReview || []), addedReview]); // Uppdatera listan direkt
            setNewReview({ rating: 1, text: "" }); // Töm formuläret
            setErrors({});
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
        setErrors({}); // Rensa eventuella tidigare fel
    };

    // Stäng uppdateringsformuläret
    const closeUpdateForm = () => {
        setEditingReview(null);
        setEditingReviewId(null);
        setErrors({}); // Rensa fel
    };

    // Validera uppdatering
    const validateUpdateReview = () => {
        if (!editingReview) return false;
        return validateReview(editingReview);
    };

    // Hantera uppdatering
    const handleUpdateReview = async () => {
        if (!editingReview || !editingReviewId) return;
        if (!validateUpdateReview()) return;

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

    // Hantera ändringar i uppdateringsformuläret med validering
    const handleEditingChange = (field: 'text' | 'rating', value: string | number) => {
        if (!editingReview) return;
        
        const updatedReview = {
            ...editingReview,
            [field]: field === 'rating' ? (Number(value) || 1) : value
        };
        
        setEditingReview(updatedReview);
        
        // Validera kontinuerligt
        const newErrors: { rating?: string; text?: string } = {...errors};
        
        if (field === 'rating') {
            const ratingValue = Number(value);
            if (ratingValue < 1 || ratingValue > 5 || isNaN(ratingValue)) {
                newErrors.rating = "Betyg måste vara mellan 1 och 5.";
            } else {
                delete newErrors.rating;
            }
        } else if (field === 'text') {
            const textValue = value as string;
            if (textValue.length > 200) {
                newErrors.text = "Recensionstexten får inte vara längre än 200 tecken.";
            } else {
                delete newErrors.text;
            }
        }
        
        setErrors(newErrors);
    };

    // Hantera ändringar i nya recensioner med validering
    const handleNewReviewChange = (field: 'text' | 'rating', value: string | number) => {
        const updatedReview = {
            ...newReview,
            [field]: field === 'rating' ? (Number(value) || 1) : value
        };
        
        setNewReview(updatedReview);
        
        // Validera kontinuerligt
        const newErrors: { rating?: string; text?: string } = {...errors};
        
        if (field === 'rating') {
            const ratingValue = Number(value);
            if (ratingValue < 1 || ratingValue > 5 || isNaN(ratingValue)) {
                newErrors.rating = "Betyg måste vara mellan 1 och 5.";
            } else {
                delete newErrors.rating;
            }
        } else if (field === 'text') {
            const textValue = value as string;
            if (textValue.length > 200) {
                newErrors.text = "Recensionstexten får inte vara längre än 200 tecken.";
            } else {
                delete newErrors.text;
            }
        }
        
        setErrors(newErrors);
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
                        <p><strong>Beskrivning:</strong> {book.description}</p>
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
                                    <div key={review.id}>
                                        <div className="user-review">
                                            <p><strong>Betyg:</strong> {review.rating}⭐</p>
                                            {review.reviewText && (
                                                <p>
                                                    <strong>Recension:</strong> {truncateText(review.reviewText)}
                                                    {review.reviewText.length > 50 && (
                                                        <button 
                                                            className="read-more-btn"
                                                            onClick={() => alert(review.reviewText)}
                                                        >
                                                            Läs mer
                                                        </button>
                                                    )}
                                                </p>
                                            )}
                                            <p><em>– Användare {review.userId}</em></p>
                                            <button className="delete-btn" onClick={() => handleDeleteReview(review.id)}>❌ Ta bort</button>
                                            <button className="update-btn" onClick={() => openUpdateForm(review)}>✏️ Uppdatera</button>
                                        </div>

                                        {editingReviewId === review.id && editingReview && (
                                            <div className="update-review-form">
                                                <div className="review-form">
                                                    <label className="review-label" htmlFor="update-rating">Betyg:</label>
                                                    <input
                                                        type="number"
                                                        id="update-rating"
                                                        min="1"
                                                        max="5"
                                                        value={editingReview.rating}
                                                        onChange={(e) => handleEditingChange('rating', e.target.value)}
                                                        required
                                                        step="1"
                                                    />
                                                    {errors.rating && <p className="error-message">{errors.rating}</p>}
                                                    
                                                    <label className="review-label" htmlFor="update-text">Text:</label>
                                                    <textarea
                                                        id="update-text"
                                                        value={editingReview.text}
                                                        onChange={(e) => handleEditingChange('text', e.target.value)}
                                                        placeholder="Uppdatera din recension..."
                                                    />
                                                    {errors.text && <p className="error-message">{errors.text}</p>}
                                                    <div className="character-count">
                                                        {editingReview.text.length}/200 tecken
                                                    </div>
                                                    
                                                    <div className="update-buttons">
                                                        <button 
                                                            className="save-btn" 
                                                            onClick={handleUpdateReview}
                                                            disabled={Object.keys(errors).length > 0}
                                                        >
                                                            ✅ Spara
                                                        </button>
                                                        <button className="cancel-btn" onClick={closeUpdateForm}>❌ Avbryt</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>Inga recensioner från användare.</p>
                        )}

                        {/* Formulär för att lägga till recension */}
                        <h2>Skriv en recension</h2>
                        <div className="review-form">
                            <label className="review-label" htmlFor="review">Betyg:</label>
                            <input
                                type="number"
                                id="review"
                                min="1"
                                max="5"
                                value={newReview.rating}
                                onChange={(e) => handleNewReviewChange('rating', e.target.value)}
                                required
                                step="1"
                            />
                            {errors.rating && <p className="error-message">{errors.rating}</p>}
                            
                            <label className="review-label" htmlFor="review-text">Text:</label>
                            <textarea
                                id="review-text"
                                value={newReview.text}
                                onChange={(e) => handleNewReviewChange('text', e.target.value)}
                                placeholder="Skriv din recension..."
                            />
                            {errors.text && <p className="error-message">{errors.text}</p>}
                            <div className="character-count">
                                {newReview.text.length}/200 tecken
                            </div>
                            
                            <button 
                                className="add-btn" 
                                onClick={handleAddReview}
                                disabled={Object.keys(errors).length > 0}
                            >
                                ➕ Lägg till recension
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <h3 className="error-message">Boken kunde inte hämtas.</h3>
            )}
        </div>
    );
};

export default BookDetailPage;