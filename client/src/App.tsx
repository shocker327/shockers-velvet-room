import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, getTRPCClient } from './utils/trpc';
import { isAgeVerified } from './utils/anonymousUser';

import Header from './components/Header';
import Footer from './components/Footer';
import AgeGate from './components/AgeGate';

import Landing from './pages/Landing';
import Companions from './pages/Companions';
import Chat from './pages/Chat';
import Pricing from './pages/Pricing';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import CreateCompanion from './pages/CreateCompanion';

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => getTRPCClient());
  const [ageVerified, setAgeVerified] = useState(isAgeVerified());

  if (!ageVerified) {
    return <AgeGate onVerified={() => setAgeVerified(true)} />;
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/companions" element={<Companions />} />
                <Route path="/chat/:companionId" element={<Chat />} />
                <Route path="/create-companion" element={<CreateCompanion />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
