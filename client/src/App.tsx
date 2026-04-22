import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Overview from "./pages/Overview";
import NexusDashboard from "./pages/NexusDashboard";
import NurseAI from "./pages/NurseAI";
import InterventionPlanner from "./pages/InterventionPlanner";
import TriadNeuro from "./pages/TriadNeuro";
import CerberusBPU from "./pages/CerberusBPU";
import AgentDebate from "./pages/AgentDebate";
import MedOSModule from "./pages/MedOSModule";
import Analytics from "./pages/Analytics";
import ConnectorUI from "./pages/ConnectorUI";
import Jarvis from "./pages/Jarvis";
import Roadmap from "./pages/Roadmap";
import Skills from "./pages/Skills";
import Settings from "./pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Overview} />
      <Route path="/nexus-dashboard" component={NexusDashboard} />
      <Route path="/nurse-ai" component={NurseAI} />
      <Route path="/intervention-planner" component={InterventionPlanner} />
      <Route path="/triad-neuro" component={TriadNeuro} />
      <Route path="/cerberus-bpu" component={CerberusBPU} />
      <Route path="/agent-debate" component={AgentDebate} />
      <Route path="/medos-module" component={MedOSModule} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/connector-ui" component={ConnectorUI} />
      <Route path="/jarvis" component={Jarvis} />
      <Route path="/roadmap" component={Roadmap} />
      <Route path="/skills" component={Skills} />
      <Route path="/settings" component={Settings} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <DashboardLayout>
            <Router />
          </DashboardLayout>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
