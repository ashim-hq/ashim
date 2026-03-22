import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HomePage } from "./pages/home-page";
import { LoginPage } from "./pages/login-page";
import { ToolPage } from "./pages/tool-page";
import { AutomatePage } from "./pages/automate-page";
import { FullscreenGridPage } from "./pages/fullscreen-grid-page";
import { KeyboardShortcutProvider } from "./components/common/keyboard-shortcut-provider";
import { useAuth } from "./hooks/use-auth";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, authEnabled, isAuthenticated } = useAuth();
  const location = useLocation();

  // Don't guard the login page itself
  if (location.pathname === "/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (authEnabled && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <KeyboardShortcutProvider>
        <AuthGuard>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/automate" element={<AutomatePage />} />
            <Route path="/fullscreen" element={<FullscreenGridPage />} />
            <Route path="/:toolId" element={<ToolPage />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </AuthGuard>
      </KeyboardShortcutProvider>
    </BrowserRouter>
  );
}
