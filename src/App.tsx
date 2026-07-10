import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Shop from "./components/Shop";
import Cart from "./components/Cart";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Checkout from "./components/Checkout";
import OrderDetails from "./components/OrderDetails";
import { ThemeProvider } from "./context/ThemeContext";
import "./App.css";

function App() {
    return (
        <ThemeProvider>
            <div className="min-h-screen flex flex-col relative bg-neutral text-text dark:bg-bg-start dark:text-text transition-colors duration-300">
                <div className="creamy-haze"></div>
                <Navbar />
                <main className="flex-1 w-full max-w-7xl mx-auto pt-[104px] pb-24 px-6 md:px-12 relative z-10">
                    <Routes>
                        <Route path="/" element={<Shop />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/orders" element={<OrderDetails />} />
                    </Routes>
                </main>
            </div>
        </ThemeProvider>
    );
}

export default App;
