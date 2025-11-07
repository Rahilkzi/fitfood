import { Toaster } from "./components/ui/Sonner";
import { TooltipProvider } from "./components/ui/Tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Index />} />
            <Route path='/login' element={<Login />} />
            <Route path='/dashboard' element={<UserDashboard />} />
            <Route path='/admin' element={<AdminDashboard />} />
            <Route path='/delivery' element={<DeliveryDashboard />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
