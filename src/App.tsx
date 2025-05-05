
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import LiveTV from "@/pages/LiveTV";
import Movies from "@/pages/Movies";
import Series from "@/pages/Series";
import MovieDetails from "@/pages/MovieDetails";
import SeriesDetails from "@/pages/SeriesDetails";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Search from "@/pages/Search";
import Player from "@/pages/Player";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/live" element={
                <ProtectedRoute>
                  <LiveTV />
                </ProtectedRoute>
              } />
              <Route path="/movies" element={
                <ProtectedRoute>
                  <Movies />
                </ProtectedRoute>
              } />
              <Route path="/series" element={
                <ProtectedRoute>
                  <Series />
                </ProtectedRoute>
              } />
              <Route path="/movie/:id" element={
                <ProtectedRoute>
                  <MovieDetails />
                </ProtectedRoute>
              } />
              <Route path="/series/:id" element={
                <ProtectedRoute>
                  <SeriesDetails />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/search" element={
                <ProtectedRoute>
                  <Search />
                </ProtectedRoute>
              } />
              <Route path="/player/:type/:id" element={
                <ProtectedRoute>
                  <Player />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
