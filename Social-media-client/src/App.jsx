import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectRoute from "./components/auth/ProtectRoute";
import { RandomLoader } from "./components/layout/Loaders";
import axios from "axios";
import { server } from "./constants/config";
import { useDispatch, useSelector } from "react-redux";
import { userExists, userNotExists } from "./redux/reducers/auth";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "./socket";
import { MusicPlayerProvider } from "./context/MusicPlayerContext";
import MiniMusicPlayer from "./components/music/MiniMusicPlayer";
import MusicPlayerDialog from "./components/music/MusicPlayerDialog";
import MusicSearchDialog from "./components/music/MusicSearchDialog";

const Home = lazy(() => import("./pages/Home"));
const Welcome = lazy(() => import("./pages/Welcome"));
const Login = lazy(() => import("./pages/Login"));
const Chat = lazy(() => import("./pages/Chat"));
const Groups = lazy(() => import("./pages/Groups"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const ChatManagement = lazy(() => import("./pages/admin/ChatManagement"));
const MessagesManagement = lazy(() =>
  import("./pages/admin/MessageManagement")
);
const BotManagement = lazy(() => import("./pages/admin/BotManagement"));

const App = () => {
  const { user, loader } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  // Register service worker for caching
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .catch(() => {
          // Silently fail - not critical
        });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    axios
      .get(`${server}/api/v1/user/me`, { 
        withCredentials: true,
        signal: controller.signal,
        timeout: 10000
      })
      .then(({ data }) => {
        clearTimeout(timeoutId);
        dispatch(userExists(data.user));
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        // Don't set user state if request was aborted - we're still trying to auth
        if (err.code === 'ERR_CANCELED' || err.message === 'canceled') {
          return;
        }
        dispatch(userNotExists());
      });
    
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [dispatch]);

  return loader ? (
    <RandomLoader />
  ) : (
    <BrowserRouter>
      <MusicPlayerProvider>
        <Suspense fallback={<RandomLoader />}>
          <Routes>
            <Route
              element={
                <SocketProvider>
                  <ProtectRoute user={user} loader={loader} />
                </SocketProvider>
              }
            >
              <Route path="/" element={<Welcome />} />
              <Route path="/chat/:chatId" element={<Chat />} />
              <Route path="/groups" element={<Groups />} />
            </Route>

            <Route
              path="/login"
              element={
                <ProtectRoute user={!user} redirect="/" loader={loader}>
                  <Login />
                </ProtectRoute>
              }
            />

            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/chats" element={<ChatManagement />} />
            <Route path="/admin/messages" element={<MessagesManagement />} />
            <Route path="/admin/bot" element={<BotManagement />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        {/* Global Music Player Components */}
        <MiniMusicPlayer />
        <MusicPlayerDialog />
        <MusicSearchDialog />

        <Toaster position="bottom-center" />
      </MusicPlayerProvider>
    </BrowserRouter>
  );
};

export default App;
