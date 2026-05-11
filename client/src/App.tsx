import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/typical_sword_game/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      <Route path={"/typical_sword_game/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Design Philosophy: Geist-Industrial Minimalism.
// App-level shell uses a dark precision-console theme so #03AED2, #F8DE22, #F45B26, and #D12052 remain functional accents.

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
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
