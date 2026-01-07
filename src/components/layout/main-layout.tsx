'use client';

import { useState } from 'react';
import { Sidebar, SidebarTrigger } from './sidebar';
import { Header } from './header';
import { ProtectedRoute } from '@/components/protected-route';
import { CepalabIAChat } from '@/components/cepalab-ia-chat';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar 
          mobileOpen={mobileSidebarOpen} 
          setMobileOpen={setMobileSidebarOpen}
          onChatOpen={() => setChatOpen(true)}
        />
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex h-16 items-center gap-4 border-b border-border px-4 lg:px-6 bg-background">
            <SidebarTrigger onClick={() => setMobileSidebarOpen(true)} />
            <Header />
          </div>
          
          <main className="flex-1 overflow-y-auto bg-background">
            {children}
          </main>
        </div>

        <CepalabIAChat open={chatOpen} onOpenChange={setChatOpen} />
      </div>
    </ProtectedRoute>
  );
}
