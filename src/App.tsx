import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import SelectRole from "./pages/SelectRole";
import Navbar from "./components/Navbar";
import Account from "./pages/Account";
import { PublicRoute } from "./components/PublicRoute";
import { useAppData } from "./context/AppContext";
import Restaurant from "./pages/Restaurant";
import RestaurantPage from "./pages/RestaurantPage";
import Cart from "./pages/Cart";

const App = () => {
  const { user } = useAppData();

  if (user && user.role === "seller") {
    return <Restaurant />;
  }

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/restaurant/:id" element={<RestaurantPage />} />
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
