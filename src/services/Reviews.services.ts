import { Review } from "../types/reviews.types";

const API_URL = "http://localhost:4000/reviews";

export const getReviews = async (bookId: string): Promise<Review[]> => {
    try {
        const response = await fetch(`http://localhost:4000/reviews/book/${bookId}`);

        if (!response.ok) {
            if (response.status === 404) {
                return []; // Returnera tom lista istället för att kasta ett fel
            }
            throw new Error(`Fel vid hämtning av recensioner. Status: ${response.status}`);
        }

        try {
            return await response.json(); // Försök att parsa JSON
        } catch (jsonError) {
            throw new Error('Fel vid parsing av JSON-svar från servern');
        }

    } catch (error) {
        console.error("Fel vid hämtning av recensioner:", error);
        return [];
    }
};

export const addReview = async (review: Review): Promise<Review> => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(review),
    });
    if (!response.ok) {
        throw new Error(`Fel vid skapande av recension. Status: ${response.status}`);
    }
    return response.json();
};

export const updateReview = async (reviewId: string, updatedReview: Partial<Review>): Promise<Review> => {
    const response = await fetch(`${API_URL}/${reviewId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedReview),
    });
    if (!response.ok) {
        throw new Error(`Fel vid uppdatering av recension. Status: ${response.status}`);
    }
    return response.json();
};

export const deleteReview = async (reviewId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${reviewId}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Fel vid radering av recension.");
};