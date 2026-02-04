import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Verification from "./pages/Verification";
import VerifyEmail from "./pages/VerifyEmail";
import VerifySMS from "./pages/VerifySMS";
import AdminDashboard from "./pages/AdminDashboard";
import Retry from "./pages/Retry";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/verify"} component={Verification} />
      <Route path={"/verification"} component={Verification} />
      <Route path={"verify-email"} component={VerifyEmail} />
      <Route path={"verify-sms"} component={VerifySMS} />
      <Route path={"retry"} component={Retry} />
      <Route path={"admin"} component={AdminDashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * Design: Dark, premium crypto trading platform
 * - Dark theme with high contrast
 * - Yellow accents for CTAs
 * - Minimal, clean interface
 */

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
