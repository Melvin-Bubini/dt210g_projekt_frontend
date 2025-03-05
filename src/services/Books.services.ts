import { Book } from "../types/books.types";


export const getBooks = async (query: string): Promise<Book[]> => {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
    
    if (!response.ok) {
        throw new Error(`Fel vid hämtning av böcker. Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items) {
        return [];
    }

    return data.items.map((item: any) => ({
        id: item.id,
        title: item.volumeInfo.title || "Okänd titel",
        authors: item.volumeInfo.authors?.join(", ") || "Okänd författare",
        publishedDate: item.volumeInfo.publishedDate || "Okänt publiceringsdatum",
        description: item.volumeInfo.description || "Ingen beskrivning tillgänglig",
        smallThumbnail: item.volumeInfo.imageLinks?.smallThumbnail || "",
        thumbnail: item.volumeInfo.imageLinks?.thumbnail || ""
    }));
};
