import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useOutletContext,
} from "react-router-dom";

import Sidebar from "./components/SideBar";
import Dashboard from "./pages/Dashboard";
import BookDetailsPage from "./pages/BookDetailsPage";
import BookReaderPage from "./pages/BookReaderPage";
import NotFoundPage from "./pages/NotFoundPage";

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

  return <Dashboard onOpenMenu={onOpenMenu} />;
}

function NotFoundRoute() {
  const { onOpenMenu } = useOutletContext<{
    onOpenMenu: () => void;
  }>();

  return <NotFoundPage onOpenMenu={onOpenMenu} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pages with the regular sidebar */}
        <Route element={<LibraryLayout />}>
          <Route path="/" element={<DashboardRoute />} />
          <Route path="/books/:gutendexId" element={<BookDetailsPage />} />
          <Route path="*" element={<NotFoundRoute />} />
        </Route>

        {/* Immersive reader without the dashboard sidebar */}
        <Route path="/read/:gutendexId" element={<BookReaderPage />} />
      </Routes>
    </BrowserRouter>
  );
}