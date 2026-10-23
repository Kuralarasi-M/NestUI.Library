import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
  useOutletContext,
} from "react-router-dom";

import Sidebar from "./components/SideBar";
import Dashboard from "./pages/Dashboard";
import BookDetailsPage from "./pages/BookDetailsPage";
import BookReaderPage from "./pages/BookReaderPage";
import NotFoundPage from "./pages/NotFoundPage";
import AuthPage from "./pages/AuthPage";
import { getLoggedInUser } from "./services/authServices";

function LibraryLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lg:ml-64">
        <Outlet context={{ onOpenMenu: () => setSidebarOpen(true) }} />
      </div>
    </>
  );
}

function DashboardRoute() {
  const { onOpenMenu } = useOutletContext<{
    onOpenMenu: () => void;
  }>();

  const user = getLoggedInUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Dashboard onOpenMenu={onOpenMenu} />;
}

function NotFoundRoute() {
  const { onOpenMenu } = useOutletContext<{
    onOpenMenu: () => void;
  }>();

  return <NotFoundPage onOpenMenu={onOpenMenu} />;
}

import FavoritesPage from "./pages/FavoritesPage";
import HistoryPage from "./pages/HistoryPage";
import SearchHistoryPage from "./pages/SearchHistoryPage";
import DiscoverPage from "./pages/DiscoverPage";
import LanguageBooksPage from "./pages/LanguageBooksPage";
import NotificationsPage from "./pages/NotificationsPage";
import SendNotificationPage from "./pages/SendNotificationPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication page */}
        <Route path="/login" element={<AuthPage />} />

        {/* Pages with the regular sidebar */}
        <Route element={<LibraryLayout />}>
          <Route path="/" element={<DashboardRoute />} />
          <Route path="/languages" element={<LanguageBooksPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/search-history" element={<SearchHistoryPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/admin/broadcast" element={<SendNotificationPage />} />
          <Route path="/books/:gutendexId" element={<BookDetailsPage />} />
          <Route path="*" element={<NotFoundRoute />} />
        </Route>

        {/* Immersive reader without the dashboard sidebar */}
        <Route path="/read/:gutendexId" element={<BookReaderPage />} />
      </Routes>
    </BrowserRouter>
  );
}