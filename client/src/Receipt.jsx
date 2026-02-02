import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import "./Cart.css";
import logo from "./assets/logo2.png";
import ProfileDropdown from "./profiledropdown";

const Receipt = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("CART");
	const [cart, setCart] = useState([]);
	const [pdfUrl, setPdfUrl] = useState("");

	const userName = localStorage.getItem("username") || "User";
	const menuItems = ["HOME", "BOOKS", "CART", "RECOMMENDED"];

	const handleMenuClick = (item) => {
		setActiveTab(item);
		if (item === "HOME") navigate("/dashboard");
		if (item === "BOOKS") navigate("/books");
		if (item === "CART") navigate("/cart");
		if (item === "RECOMMENDED") navigate("/recommended");
	};

	const totalItems = useMemo(
		() => cart.reduce((s, it) => s + (Number(it?.qty) || 0), 0),
		[cart]
	);

	const generatePdfBlobUrl = (items) => {
		const doc = new jsPDF({ unit: "pt", format: "a4" });
		const pageWidth = doc.internal.pageSize.getWidth();
		const margin = 40;
		let y = 60;

		doc.setFont("helvetica", "bold");
		doc.setFontSize(18);
		doc.text("LIBRORA - Checkout Receipt", margin, y);
		y += 22;

		doc.setFont("helvetica", "normal");
		doc.setFontSize(11);
		doc.text(`User: ${userName}`, margin, y);
		y += 16;
		doc.text(`Date: ${new Date().toLocaleString()}`, margin, y);
		y += 22;

		doc.setDrawColor(220);
		doc.line(margin, y, pageWidth - margin, y);
		y += 18;

		doc.setFont("helvetica", "bold");
		doc.text("Items", margin, y);
		y += 16;
		doc.setFont("helvetica", "normal");

		if (!items.length) {
			doc.text("No items in cart.", margin, y);
			y += 16;
		}

		items.forEach((it, idx) => {
			const title = (it?.title || "").toString();
			const qty = Number(it?.qty) || 1;
			const author = (it?.author || "Unknown").toString();
			const isbn = (it?.isbn || "").toString();

			const line1 = `${idx + 1}. ${title}`;
			const line2 = `by ${author}   Qty: ${qty}`;
			const line3 = isbn ? `ISBN: ${isbn}` : "";

			const wrapWidth = pageWidth - margin * 2;
			const l1 = doc.splitTextToSize(line1, wrapWidth);
			const l2 = doc.splitTextToSize(line2, wrapWidth);
			const l3 = line3 ? doc.splitTextToSize(line3, wrapWidth) : [];

			const needed = (l1.length + l2.length + l3.length) * 14 + 12;
			if (y + needed > doc.internal.pageSize.getHeight() - margin) {
				doc.addPage();
				y = margin;
			}

			doc.text(l1, margin, y);
			y += l1.length * 14;
			doc.text(l2, margin, y);
			y += l2.length * 14;
			if (l3.length) {
				doc.text(l3, margin, y);
				y += l3.length * 14;
			}
			y += 12;
		});

		doc.setDrawColor(220);
		doc.line(margin, y, pageWidth - margin, y);
		y += 18;
		doc.setFont("helvetica", "bold");
		doc.text(`Total Items: ${totalItems}`, margin, y);
		y += 20;

		const blob = doc.output("blob");
		return URL.createObjectURL(blob);
	};

	useEffect(() => {
		const stored = JSON.parse(localStorage.getItem("cart")) || [];
		setCart(stored);
		try {
			const raw = localStorage.getItem("borrow_history");
			const prev = raw ? JSON.parse(raw) : [];
			const nextItems = stored.map((it) => ({
				title: it?.title,
				author: it?.author,
				isbn: it?.isbn,
				qty: Number(it?.qty) || 1,
				ts: Date.now(),
			}));
			const merged = [...nextItems, ...prev].filter((it) => it?.title);
			localStorage.setItem("borrow_history", JSON.stringify(merged.slice(0, 50)));
		} catch {
			// ignore
		}
	}, []);

	useEffect(() => {
		if (pdfUrl) {
			URL.revokeObjectURL(pdfUrl);
		}
		const nextUrl = generatePdfBlobUrl(cart);
		setPdfUrl(nextUrl);
		// eslint-disable-next-line react-hooks/exhaustive-deps
		return () => {
			if (nextUrl) URL.revokeObjectURL(nextUrl);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cart]);

	return (
		<div className="cart-page">
			<header className="header">
				<div className="logo-container">
					<img src={logo} alt="Librora Logo" className="logo-img" />
					<h1 className="logo-text">LIBRORA</h1>
				</div>

				<div className="header-right">
					<ProfileDropdown userName={userName} />
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
					<h3 className="list-title">Receipt <span className="small-count">({totalItems} items)</span></h3>

					<ul>
						{cart.map((item) => (
							<li key={item.id} className="cart-item">
								<div className="left-col">
									<div className="cover">{item.title.split(" ").slice(0, 2).map((w) => w[0]).join("")}</div>
									<div className="meta">
										<div className="title">{item.title}</div>
										<div className="author">by {item.author}</div>
										<div className="isbn">{item.isbn}</div>
									</div>
								</div>
								<div className="right-col">
									<div className="qty-controls">
										<span className="qty">Qty: {item.qty}</span>
									</div>
								</div>
							</li>
						))}
					</ul>
				</section>

				<aside className="cart-aside">
					<div className="aside-card checkout-summary">
						<h4>Receipt PDF</h4>
						<div className="line"><span>Total Items:</span><span>{totalItems}</span></div>
						<a className="checkout-btn" href={pdfUrl} download="librora-receipt.pdf">Download PDF</a>
						<button className="continue-btn" onClick={() => navigate("/cart")}>Back to Cart</button>
					</div>

					<div className="aside-card">
						<h4>Preview</h4>
						<div style={{ width: "100%", height: 420, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)" }}>
							{pdfUrl ? (
								<iframe title="Receipt Preview" src={pdfUrl} style={{ width: "100%", height: "100%", border: 0 }} />
							) : (
								<div className="empty">Generating preview...</div>
							)}
						</div>
					</div>
				</aside>
			</main>
		</div>
	);
};

export default Receipt;
