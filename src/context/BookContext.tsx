import { Book } from "../types/books.types"
import { getBooks } from "../services/Books.services";
import { createContext, ReactNode, useState, useContext } from "react";


export interface BookContextType {
    books: Book[];
    loading: boolean;
    fetchBooks: (query: string) => void;
}

const BookContext = createContext<BookContextType | null>(null);

interface BookProviderProps {
    children: ReactNode;
}

export const BookProvider: React.FC<BookProviderProps> = ({ children }) => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchBooks = async (query: string) => {
        setLoading(true);
        try {
            let data = await getBooks(query);
            setBooks(data);
        } catch (error) {
            console.error("Fel vid hämtning av böcker: ", error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <BookContext.Provider value={{ books, loading, fetchBooks }}>
            {children}
        </BookContext.Provider>
    )
};

export const useBooks = (): BookContextType => {
    const context = useContext(BookContext);
    if (!context) {
        throw new Error("useBooks måste användas inom en BookProvider");
    }
    return context;
};