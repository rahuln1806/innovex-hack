import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import logo from "./assets/logo2.png";
import ProfileDropdown from "./profiledropdown";

const SAMPLE_BOOKS = [
	{ id: "b1", title: "Introduction to Python Programming", author: "Mark Lutz", isbn: "ISBN-978-1449355739", available: true },
	{ id: "b2", title: "Web Development with HTML & CSS", author: "Jon Duckett", isbn: "ISBN-978-1118008188", available: true },
	{ id: "b3", title: "Design Patterns: Elements of Reusable Object-Oriented Software", author: "Gang of Four", isbn: "ISBN-978-0201633610", available: true },
	{ id: "b4", title: "The Pragmatic Programmer", author: "David Thomas & Andrew Hunt", isbn: "ISBN-978-0201616224", available: true },
	{ id: "b5", title: "Clean Code", author: "Robert C. Martin", isbn: "ISBN-978-0132350884", available: true }
];

const Cart = () => {
	const [cart, setCart] = useState([]);
	const [animToggle, setAnimToggle] = useState(false);
	const [showHistory, setShowHistory] = useState(false);
	const [activeTab, setActiveTab] = useState("CART");
	const [searchQuery, setSearchQuery] = useState("");
	const cartIconRef = useRef(null);
	const navigate = useNavigate();

	const menuItems = ["HOME", "BOOKS", "CART", "RECOMMENDED"];

	const handleMenuClick = (item) => {
		setActiveTab(item);

		if (item === "HOME") {
			navigate("/dashboard");
		} else if (item === "BOOKS") {
			navigate("/books");
		} else if (item === "CART") {
			navigate("/cart");
		} else if (item === "RECOMMENDED") {
			navigate("/recommended");
		}
	};

	useEffect(() => {
		const stored = JSON.parse(localStorage.getItem("cart")) || [];
		setCart(stored);
	}, []);

	const saveCart = (next) => {
		setCart(next);
		localStorage.setItem("cart", JSON.stringify(next));
		// trigger micro-animation
		setAnimToggle((s) => !s);
		if (cartIconRef.current) {
			cartIconRef.current.classList.remove("bounce");
			// reflow to restart animation
			// eslint-disable-next-line no-unused-expressions
			cartIconRef.current.offsetWidth;
			cartIconRef.current.classList.add("bounce");
		}
	};

	const increment = (id) => {
		const next = cart.map((it) => (it.id === id ? { ...it, qty: it.qty + 1 } : it));
		saveCart(next);
	};

	const decrement = (id) => {
		const next = cart
			.map((it) => (it.id === id ? { ...it, qty: Math.max(1, it.qty - 1) } : it));
		saveCart(next);
	};

	const removeItem = (id) => {
		// add removing flag for animation
		const next = cart.map((it) => (it.id === id ? { ...it, removing: true } : it));
		setCart(next);
		setTimeout(() => {
			const filtered = next.filter((it) => it.id !== id);
			saveCart(filtered);
		}, 300);
	};

	const addRecommendation = (book) => {
		const exists = cart.find((it) => it.id === book.id);
		if (exists) {
			increment(book.id);
			return;
		}

		const next = [...cart, { ...book, qty: 1 }];
		saveCart(next);
	};

	const totalItems = cart.reduce((s, it) => s + (it.qty || 0), 0);

	const normalizedQuery = searchQuery.trim().toLowerCase();
	const filteredCart = normalizedQuery
		? cart.filter((item) => {
			const title = (item?.title || "").toString().toLowerCase();
			const author = (item?.author || "").toString().toLowerCase();
			const isbn = (item?.isbn || "").toString().toLowerCase();
			return (
				title.includes(normalizedQuery) ||
				author.includes(normalizedQuery) ||
				isbn.includes(normalizedQuery)
			);
		})
		: cart;

	const recommendations = SAMPLE_BOOKS.filter((b) => !cart.find((c) => c.id === b.id));

	return (
		<div className="cart-page">
			<header className="header">
				<div className="logo-container">
					<img src={logo} alt="Librora Logo" className="logo-img" />
					<h1 className="logo-text">LIBRORA</h1>
				</div>

				<div className="header-right">
					<div className="search-box">
						<svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21L15.8 15.8" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
						<input
							className="search-input"
							placeholder="Search in cart..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>

					<ProfileDropdown userName={localStorage.getItem("username") || "User"} />
				</div>
			</header>

			<nav className="nav">
				{menuItems.map((item) => (
					<span
						key={item}
						className={`nav-item ${activeTab === item ? "active" : ""}`}
						onClick={() => handleMenuClick(item)}
					>
						{item}
					</span>
				))}
			</nav>

			<main className="cart-main">
				<section className="cart-list">
					<h3 className="list-title">Cart Items <span className="small-count">({cart.length} items)</span></h3>
					{cart.length === 0 && <p className="empty">Your cart is empty. Add books from recommendations.</p>}
					{cart.length > 0 && filteredCart.length === 0 && (
						<p className="empty">No matching books found in your cart.</p>
					)}

					<ul>
						{filteredCart.map((item) => (
							<li key={item.id} className={`cart-item ${item.removing ? "removing" : ""}`}>
								<div className="left-col">
									<div className="cover">{item.title.split(" ").slice(0,2).map(w=>w[0]).join("")}</div>
									<div className="meta">
										<div className="title">{item.title}</div>
										<div className="author">by {item.author}</div>
										<div className="isbn">{item.isbn}</div>
										<div className={`available ${item.available ? 'in' : 'out'}`}>{item.available ? 'Available' : 'Not available'}</div>
									</div>
								</div>

								<div className="right-col">
									<div className="qty-controls">
										<button type="button" onClick={() => decrement(item.id)} aria-label="decrease">−</button>
										<span className="qty">{item.qty}</span>
										<button type="button" onClick={() => increment(item.id)} aria-label="increase">+</button>
									</div>

									<div className="actions">
										<button type="button" className="heart" title="Add to wishlist">♡</button>
										<button type="button" className="remove-x" onClick={() => removeItem(item.id)} title="Remove">✕</button>
									</div>
								</div>
							</li>
						))}
					</ul>
				</section>

				<aside className="cart-aside">
					<div className="cart-counter" ref={cartIconRef} data-bounce={animToggle}>
						<div className="counter-icon">🛒</div>
						<div className="counter-content">
							<p className="counter-label">Items in Cart</p>
							<p className="counter-number">{totalItems}</p>
						</div>
					</div>

					<div className="aside-card checkout-summary">
						<h4>Checkout Summary</h4>
						<div className="line"><span>Items in Cart:</span><span>{totalItems}</span></div>
						<button type="button" className="checkout-btn" onClick={() => navigate("/receipt")}>Checkout Books</button>
						<button type="button" className="continue-btn" onClick={() => navigate("/books")}>Continue Browsing</button>
					</div>

					<div className="aside-card">
						<h4>Checkout Limit</h4>
						<p>Maximum 5 books per checkout</p>
						<p>Loan period: 30 days</p>
					</div>

					<div className="aside-card wishlist-card">
						<h4>Wishlist</h4>
						{cart[0] ? (
							<div className="wish-item">
								<div className="wish-title">{cart[0].title.split(" ").slice(0,3).join(" ")}...</div>
								<div className="wish-actions"><button className="small">Add</button><button className="small muted">Remove</button></div>
							</div>
						) : (
							<p className="muted">No wishlist items</p>
						)}
					</div>

					<div className="aside-card">
						<h4>Library Info</h4>
						<p>Free book checkout for students!</p>
						<p>30-day loan period</p>
						<p>Renew up to 2 times</p>
					</div>

					<div className="aside-card">
						<h4>Borrowing History</h4>
						<button type="button" className="history-btn" onClick={() => setShowHistory(true)}>View History</button>
					</div>

					{showHistory && (
						<div className="modal-overlay" onClick={() => setShowHistory(false)}>
							<div className="modal" onClick={(e) => e.stopPropagation()}>
								<h3>Borrowing History</h3>
								<p className="muted">No borrowing history yet</p>
								<button type="button" className="close" onClick={() => setShowHistory(false)}>Close</button>
							</div>
						</div>
					)}
				</aside>
			</main>
		</div>
	);
};

export default Cart;

