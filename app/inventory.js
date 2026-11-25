"use client";

import { useEffect, useMemo, useState } from "react";

const storageKey = "stock-inventory-v1";
const lowStockLimit = 5;
const sampleQuantities = [24, 12, 4, 18, 8, 3, 15, 0, 7, 11, 5, 9, 21, 2, 14, 6, 10, 0, 8, 16];
const emptyForm = { title: "", author: "", isbn: "", category: "", quantity: "0" };

function isInventory(value) {
  return Array.isArray(value) && value.every((book) =>
    book && typeof book.title === "string" && book.title.trim() &&
    typeof book.author === "string" && book.author.trim() &&
    typeof book.category === "string" && book.category.trim() &&
    typeof book.isbn === "string" && /^(?:\d{10}|\d{13})$/.test(book.isbn) &&
    Number.isSafeInteger(book.quantity) && book.quantity >= 0
  ) && new Set(value.map((book) => book.isbn)).size === value.length;
}

function stockStatus(quantity) {
  if (quantity === 0) return "Out of stock";
  if (quantity <= lowStockLimit) return "Low stock";
  return "In stock";
}

export default function Inventory({ initialBooks }) {
  const [inventory, setInventory] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All stock");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const sampleIsbns = useMemo(() => new Set(initialBooks.map((book) => book.isbn)), [initialBooks]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (!isInventory(parsed)) throw new Error("Invalid inventory data");
        setInventory(parsed);
      } else {
        setInventory(initialBooks.map((book, index) => ({ ...book, quantity: sampleQuantities[index] ?? 0 })));
      }
      setReady(true);
    } catch (loadError) {
      console.error("Could not load inventory:", loadError);
      setError("Inventory could not be loaded from this browser. Your saved data has not been changed.");
    }
  }, [initialBooks]);

  function save(nextInventory) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextInventory));
      setInventory(nextInventory);
      setError("");
      return true;
    } catch (saveError) {
      console.error("Could not save inventory:", saveError);
      setError("Changes could not be saved in this browser. Check your browser storage and try again.");
      return false;
    }
  }

  function openForm(book) {
    setEditing(book ? book.isbn : "new");
    setForm(book ? { ...book, quantity: String(book.quantity) } : emptyForm);
    setFormError("");
  }

  function submitForm(event) {
    event.preventDefault();
    const book = {
      title: form.title.trim(),
      author: form.author.trim(),
      isbn: form.isbn.trim(),
      category: form.category.trim(),
      quantity: Number(form.quantity),
    };
    if (!book.title || !book.author || !book.category || !/^(?:\d{10}|\d{13})$/.test(book.isbn) ||
        form.quantity.trim() === "" || !Number.isSafeInteger(book.quantity) || book.quantity < 0) {
      setFormError("Complete every field. ISBN must be 10 or 13 digits and quantity must be a non-negative whole number.");
      return;
    }
    if (inventory.some((item) => item.isbn === book.isbn && item.isbn !== editing)) {
      setFormError("A book with this ISBN is already in your inventory.");
      return;
    }
    const next = editing === "new"
      ? [...inventory, book]
      : inventory.map((item) => item.isbn === editing ? book : item);
    if (save(next)) setEditing(null);
  }

  function changeQuantity(book, amount) {
    const quantity = book.quantity + amount;
    if (!Number.isSafeInteger(quantity) || quantity < 0) return;
    save(inventory.map((item) => item.isbn === book.isbn ? { ...item, quantity } : item));
  }

  function removeBook(book) {
    if (window.confirm(`Remove "${book.title}" from this inventory?`)) {
      if (save(inventory.filter((item) => item.isbn !== book.isbn)) && editing === book.isbn) setEditing(null);
    }
  }

  const totalUnits = inventory.reduce((total, book) => total + book.quantity, 0);
  const lowStock = inventory.filter((book) => book.quantity > 0 && book.quantity <= lowStockLimit).length;
  const outOfStock = inventory.filter((book) => book.quantity === 0).length;
  const normalizedQuery = query.trim().toLowerCase();
  const visibleBooks = inventory.filter((book) =>
    (filter === "All stock" || stockStatus(book.quantity) === filter) &&
    [book.title, book.author, book.isbn, book.category].some((value) => value.toLowerCase().includes(normalizedQuery))
  );

  return (
    <main className="dashboard">
      <div className="breadcrumb">WORKSPACE <span>/</span> INVENTORY</div>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR BOOK INVENTORY</p>
          <h1>Stock management<span className="heading-period">.</span></h1>
          <p className="page-description">A clear view of your books, all in one place.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => openForm()} disabled={!ready}>
          <span aria-hidden="true">＋</span> Add a book
        </button>
      </div>

      <div className="local-notice"><span aria-hidden="true">ⓘ</span> Inventory is saved only in this browser. Sample quantities are provided to get you started.</div>
      {error && <div className="error-message" role="alert">{error}</div>}

      <section className="stats" aria-label="Inventory overview">
        <div className="stat"><span className="stat-label">TOTAL TITLES</span><strong>{ready ? inventory.length : "—"}</strong><span className="stat-detail">Books in your inventory</span><span className="stat-icon" aria-hidden="true">▤</span></div>
        <div className="stat"><span className="stat-label">TOTAL UNITS</span><strong>{ready ? totalUnits.toLocaleString() : "—"}</strong><span className="stat-detail">Copies on hand</span><span className="stat-icon" aria-hidden="true">▦</span></div>
        <div className="stat"><span className="stat-label">LOW STOCK</span><strong>{ready ? lowStock : "—"}</strong><span className="stat-detail">1–{lowStockLimit} copies remaining</span><span className="stat-icon warning-icon" aria-hidden="true">!</span></div>
        <div className="stat"><span className="stat-label">OUT OF STOCK</span><strong>{ready ? outOfStock : "—"}</strong><span className="stat-detail">Titles needing attention</span><span className="stat-icon" aria-hidden="true">○</span></div>
      </section>

      {editing !== null && (
        <section className="form-panel" aria-labelledby="form-title">
          <div className="panel-heading">
            <div><p className="eyebrow">INVENTORY DETAILS</p><h2 id="form-title">{editing === "new" ? "Add a book" : "Edit book"}</h2></div>
            <button type="button" className="text-button" onClick={() => setEditing(null)}>Cancel</button>
          </div>
          <form onSubmit={submitForm}>
            <div className="form-grid">
              <label>Title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
              <label>Author<input required value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} /></label>
              <label>ISBN<input required inputMode="numeric" value={form.isbn} onChange={(event) => setForm({ ...form, isbn: event.target.value })} placeholder="10 or 13 digits" /></label>
              <label>Category<input required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label>
              <label>Quantity<input required type="number" min="0" step="1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></label>
            </div>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <button className="primary-button" type="submit">{editing === "new" ? "Add to inventory" : "Save changes"}</button>
          </form>
        </section>
      )}

      <section className="inventory-panel" aria-labelledby="inventory-title">
        <div className="panel-heading inventory-heading">
          <div><p className="eyebrow">THE COLLECTION</p><h2 id="inventory-title">Inventory <span className="count">{ready ? inventory.length : "—"}</span></h2><p className="panel-description">Manage your titles and keep stock up to date.</p></div>
          <div className="filters">
            <label className="search-field"><span aria-hidden="true">⌕</span><span className="sr-only">Search inventory</span><input type="search" placeholder="Search books or ISBN..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            <label><span className="sr-only">Filter by stock status</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>All stock</option><option>In stock</option><option>Low stock</option><option>Out of stock</option></select></label>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>BOOK</th><th>CATEGORY</th><th>ISBN</th><th>STATUS</th><th>QUANTITY</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {visibleBooks.map((book) => (
                <tr key={book.isbn}>
                  <td><div className="book-cell"><div className="book-thumb"><span aria-hidden="true">▤</span>{sampleIsbns.has(book.isbn) && <img src={`/covers/${book.isbn}`} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} />}</div><div><span className="book-title">{book.title}</span><span className="book-author">{book.author}</span></div></div></td>
                  <td><span className="category-label">{book.category}</span></td>
                  <td className="isbn">{book.isbn}</td>
                  <td><span className={`status ${book.quantity === 0 ? "status-out" : book.quantity <= lowStockLimit ? "status-low" : "status-in"}`}><span aria-hidden="true">●</span> {stockStatus(book.quantity)}</span></td>
                  <td><div className="quantity-control"><button type="button" onClick={() => changeQuantity(book, -1)} disabled={book.quantity === 0} aria-label={`Decrease quantity of ${book.title}`}>−</button><span>{book.quantity}</span><button type="button" onClick={() => changeQuantity(book, 1)} disabled={book.quantity === Number.MAX_SAFE_INTEGER} aria-label={`Increase quantity of ${book.title}`}>+</button></div></td>
                  <td><div className="row-actions"><button type="button" onClick={() => openForm(book)} aria-label={`Edit ${book.title}`}>Edit</button><button type="button" onClick={() => removeBook(book)} aria-label={`Remove ${book.title}`}>Remove</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!ready ? <p className="empty-state">{error ? "Inventory unavailable." : "Loading inventory…"}</p> : visibleBooks.length === 0 && <p className="empty-state">{inventory.length === 0 ? "No books yet. Add a book to get started." : "No books match your search or filter."}</p>}
        </div>
        <div className="table-footer">{ready ? `Showing ${visibleBooks.length} of ${inventory.length} titles` : "Inventory overview"} <span>BOOKS, ACCOUNTED FOR.</span></div>
      </section>
      <footer className="dashboard-footer"><span>stock<span className="brand-period">.</span> <span> /  BOOK INVENTORY MANAGEMENT</span></span><span>MADE FOR YOUR SHELVES</span></footer>
    </main>
  );
}
