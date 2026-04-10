import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ToastStack from "./components/ToastStack.jsx";
import { usePageTransition } from "./hooks/usePageTransition.js";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import Register from "./pages/Register.jsx";
import Settings from "./pages/Settings.jsx";
import Upload from "./pages/Upload.jsx";
import Video from "./pages/Video.jsx";
import { useAuthStore } from "./store/authStore.js";

function App() {
  const location = useLocation();
  const pageRef = usePageTransition(location.pathname);
  const bootstrapAuth = useAuthStore((state) => state.bootstrapAuth);

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  return (
    <div className="relative min-h-screen bg-vidvortex-radial text-brand-ink">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.15),transparent_35%),radial-gradient(circle_at_30%_70%,rgba(157,78,221,0.17),transparent_38%)]" />
      <div className="ambient-drift pointer-events-none fixed -left-20 top-1/4 h-64 w-64 rounded-full bg-brand-base/20 blur-3xl" />
      <div className="ambient-drift pointer-events-none fixed -right-20 bottom-0 h-72 w-72 rounded-full bg-brand-accent/20 blur-3xl" />
      <Navbar />

      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-6 px-4 pb-12 pt-24 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
        <Sidebar />
        <main ref={pageRef} className="min-h-[70vh]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/video/:id" element={<Video />} />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>

      <ToastStack />
    </div>
  );
}

export default App;
