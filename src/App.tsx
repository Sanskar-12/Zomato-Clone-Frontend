import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { PublicRoute } from "./components/publicRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import SelectRole from "./pages/SelectRole";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/select-role" element={<SelectRole />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
