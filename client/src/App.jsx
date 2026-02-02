import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Books from "./Books";
import BookResults from "./BookResults";
import Cart from "./Cart";
import Receipt from "./Receipt";
import Recommended from "./recommended";
import FloatingChatbot from "./components/Floatingchatbot";



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem("token")));

  return (
    <>
    <Routes>
      <Route
        path="/"
        element={
          <Login setIsLoggedIn={setIsLoggedIn} />
        }
      />

      <Route
        path="/dashboard"
        element={
          isLoggedIn ? <Dashboard /> : <Navigate to="/" />
        }
      />

      <Route
        path="/books"
        element={
          isLoggedIn ? <Books /> : <Navigate to="/" />
        }
      />

      <Route
        path="/books/results"
        element={
          isLoggedIn ? <BookResults /> : <Navigate to="/" />
        }
      />

        <Route
          path="/cart"
          element={
            isLoggedIn ? <Cart /> : <Navigate to="/" />
          }
        />

        <Route
          path="/receipt"
          element={
            isLoggedIn ? <Receipt /> : <Navigate to="/" />
          }
        />

      <Route
        path="/recommended"
        element={
          isLoggedIn ? <Recommended /> : <Navigate to="/" />
        }
      />
    </Routes>
      
      {isLoggedIn && <FloatingChatbot />}
    </>
  );
}

export default App;
