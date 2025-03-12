import { NavLink } from "react-router-dom";
import "../css/HomePage.css";
import { useBooks } from "../context/BookContext";
import { useEffect } from "react";

export const HomePage = () => {
  const { books, loading, fetchBooks } = useBooks();

  useEffect(() => {
    fetchBooks("Lord of the Rings");
  }, []);

  return (
    <div className="home-page">
      {/* Hero-sektion */}
      <header className="hero">
        <div className="hero-content">
          <h1>Välkommen till Bookshelf</h1>
          <p className="hero-subtitle">Upptäck, läs och dela dina favoritböcker</p>
          <NavLink to="/books" className="cta-button">Utforska böcker</NavLink>
        </div>
      </header>

      {/* Om-sektion */}
      <section className="about-section">
        <div className="about-section-container">
          <h2>Om Bookshelf</h2>
          <p>Bookshelf är din portal till litteraturens värld. Här kan du hitta tusentals böcker och upptäcka nya favoriter.</p>
        </div>
      </section>

      {/* Featured Books */}
      {loading ? (
        <h3 className="loading-message">Laddar böcker...</h3>
      ) : !books.length ? (
        <h3 className="error-message">Inga böcker hittades.</h3>
      ) : (
        <section className="featured-books">
          <div className="featured-books-container">
            <h2>Utvalda böcker</h2>
            <div className="book-grid">
              {books.slice(0, 3).map((book) => (
                <div className="book-card" key={book.id}>
                  <div className="book-information">
                    <h3>{book.title}</h3>
                    <p>av {book.authors}</p>
                    <NavLink to={`/book/${book.id}`} className="book-link">Läs mer</NavLink>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="about-section">
        <div className="about-section-container">
          <h2>Vilka är vi?</h2>
          <p>Vi är fem kompisar som bestämde oss för att satsa på Bookshelf. Vi älskar böcker och ville skapa en portal för alla att upptäcka det underbara med böcker!</p>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-container">
          <h2>Börja ditt läsäventyr idag</h2>
          <p>Anslut till tusentals läsare och upptäck din nästa favoritbok</p>
          <NavLink to="/register" className="cta-button">Registrera dig</NavLink>
        </div>
      </section>
    </div>
  );
};
