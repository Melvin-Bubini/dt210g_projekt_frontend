export interface Review {
    id?: string;
    bookId: string;
    userId: number;
    reviewText: string;
    rating: number;
    createdAt?: string;
}
