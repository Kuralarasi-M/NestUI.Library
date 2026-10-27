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
import LeaderboardPage from "./pages/LeaderboardPage";
import RandomChallengePage from "./pages/RandomChallengePage";
import DailyTamilSentencesPage from "./pages/DailyTamilSentencesPage";
import DailyTechBytesPage from "./pages/DailyTechBytesPage";

function LeaderboardRoute() {
  const { onOpenMenu } = useOutletContext<{ onOpenMenu: () => void }>();
  return <LeaderboardPage onOpenMenu={onOpenMenu} />;
}

function ChallengeRoute() {
  const { onOpenMenu } = useOutletContext<{ onOpenMenu: () => void }>();
  return <RandomChallengePage onOpenMenu={onOpenMenu} />;
}

function DailyTamilRoute() {
  const { onOpenMenu } = useOutletContext<{ onOpenMenu: () => void }>();
  return <DailyTamilSentencesPage onOpenMenu={onOpenMenu} />;
}

function DailyTechBytesRoute() {
  const { onOpenMenu } = useOutletContext<{ onOpenMenu: () => void }>();
  return <DailyTechBytesPage onOpenMenu={onOpenMenu} />;
}

import WordGamesPage from "./pages/WordGamesPage";
import GamesHubPage from "./pages/GamesHubPage";
import MyLibraryPage from "./pages/MyLibraryPage";

function WordGamesRoute() {
  const { onOpenMenu } = useOutletContext<{ onOpenMenu: () => void }>();
  return <WordGamesPage onOpenMenu={onOpenMenu} />;
}

function GamesHubRoute() {
  const { onOpenMenu } = useOutletContext<{ onOpenMenu: () => void }>();
  return <GamesHubPage onOpenMenu={onOpenMenu} />;
}

function MyLibraryRoute() {
  const { onOpenMenu } = useOutletContext<{ onOpenMenu: () => void }>();
  return <MyLibraryPage onOpenMenu={onOpenMenu} />;
}

function DiscoverRoute() {
  const { onOpenMenu } = useOutletContext<{ onOpenMenu: () => void }>();
  return <DiscoverPage onOpenMenu={onOpenMenu} />;
}

function FavoritesRoute() {
  const { onOpenMenu } = useOutletContext<{ onOpenMenu: () => void }>();
  return <FavoritesPage onOpenMenu={onOpenMenu} />;
}

function HistoryRoute() {
  const { onOpenMenu } = useOutletContext<{ onOpenMenu: () => void }>();
  return <HistoryPage onOpenMenu={onOpenMenu} />;
}

function SearchHistoryRoute() {
  const { onOpenMenu } = useOutletContext<{ onOpenMenu: () => void }>();
  return <SearchHistoryPage onOpenMenu={onOpenMenu} />;
}

function NotificationsRoute() {
  const { onOpenMenu } = useOutletContext<{ onOpenMenu: () => void }>();
  return <NotificationsPage onOpenMenu={onOpenMenu} />;
}

function SendNotificationRoute() {
  const { onOpenMenu } = useOutletContext<{ onOpenMenu: () => void }>();
  return <SendNotificationPage onOpenMenu={onOpenMenu} />;
}

function LanguageBooksRoute() {
  const { onOpenMenu } = useOutletContext<{ onOpenMenu: () => void }>();
  return <LanguageBooksPage onOpenMenu={onOpenMenu} />;
}

function BookDetailsRoute() {
  const { onOpenMenu } = useOutletContext<{ onOpenMenu: () => void }>();
  return <BookDetailsPage onOpenMenu={onOpenMenu} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication page */}
        <Route path="/login" element={<AuthPage />} />

        {/* Pages with the regular sidebar */}
        <Route element={<LibraryLayout />}>
          <Route path="/" element={<DashboardRoute />} />
          <Route path="/discover" element={<DiscoverRoute />} />
          <Route path="/games" element={<GamesHubRoute />} />
          <Route path="/word-games" element={<WordGamesRoute />} />
          <Route path="/daily-tech" element={<DailyTechBytesRoute />} />
          <Route path="/daily-read-quiz" element={<DailyTechBytesRoute />} />
          <Route path="/daily-tamil" element={<DailyTamilRoute />} />
          <Route path="/challenge" element={<ChallengeRoute />} />
          <Route path="/leaderboard" element={<LeaderboardRoute />} />
          <Route path="/my-library" element={<MyLibraryRoute />} />
          <Route path="/favorites" element={<FavoritesRoute />} />
          <Route path="/history" element={<HistoryRoute />} />
          <Route path="/search-history" element={<SearchHistoryRoute />} />
          <Route path="/notifications" element={<NotificationsRoute />} />
          <Route path="/admin/broadcast" element={<SendNotificationRoute />} />
          <Route path="/languages" element={<LanguageBooksRoute />} />
          <Route path="/books/:gutendexId" element={<BookDetailsRoute />} />
          <Route path="*" element={<NotFoundRoute />} />
        </Route>

        {/* Immersive reader without the dashboard sidebar */}
        <Route path="/read/:gutendexId" element={<BookReaderPage />} />
      </Routes>
    </BrowserRouter>
  );
}