import { MotionConfig } from 'motion/react';
import { NativePage, nativeTransition } from './components/NativeMotion';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { MainHeader } from './components/MainHeader';
import { StatsBar } from './components/StatsBar';
import { FilterBuilder } from './components/FilterBuilder';
import { ArtistsTable } from './components/ArtistsTable';
import { DealsTable } from './components/DealsTable';
import { AnalyticsView } from './components/AnalyticsView';
import { ArtistDrawer } from './components/ArtistDrawer';
import { ArtistModal } from './components/ArtistModal';
import { DealModal } from './components/DealModal';
import { SettingsModal } from './components/SettingsModal';
import { ImportExportModal } from './components/ImportExportModal';
import { ParserView } from './components/ParserView';
import { ImportFromParserModal } from './components/ImportFromParserModal';
import { Toast } from './components/Toast';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    activeArtistId,
    setActiveArtistId,
    activeDealId,
    setActiveDealId,
    isSettingsOpen,
    setIsSettingsOpen,
    isImportExportOpen,
    setIsImportExportOpen,
    isNewArtistModalOpen,
    setIsNewArtistModalOpen,
    isNewDealModalOpen,
    setIsNewDealModalOpen,
    isImportFromParserOpen,
    setIsImportFromParserOpen,
  } = useApp();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey: Esc -> Close any open drawer or modal
      if (e.key === 'Escape') {
        if (activeArtistId) setActiveArtistId(null);
        if (activeDealId) setActiveDealId(null);
        if (isSettingsOpen) setIsSettingsOpen(false);
        if (isImportExportOpen) setIsImportExportOpen(false);
        if (isNewArtistModalOpen) setIsNewArtistModalOpen(false);
        if (isNewDealModalOpen) setIsNewDealModalOpen(false);
        return;
      }

      // Hotkey: '/' -> Focus search input
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        searchInput?.focus();
        return;
      }

      // Hotkey: Cmd+N or Ctrl+N -> New record
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (activeTab === 'artists') {
          setIsNewArtistModalOpen(true);
        } else if (activeTab === 'deals') {
          setIsNewDealModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeTab,
    activeArtistId,
    activeDealId,
    isSettingsOpen,
    isImportExportOpen,
    isNewArtistModalOpen,
    isNewDealModalOpen,
    setActiveArtistId,
    setActiveDealId,
    setIsSettingsOpen,
    setIsImportExportOpen,
    setIsNewArtistModalOpen,
    setIsNewDealModalOpen,
  ]);

  return (
    <div className="studio-app">
      {/* Immersive UI Left Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="studio-workspace">
        {/* Top Header with Search and Action Button */}
        <MainHeader />

        <NativePage view={activeTab}>
        {activeTab === 'parser' ? (
          <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
            <ParserView />
          </main>
        ) : activeTab === 'analytics' ? (
          <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
            <AnalyticsView />
          </main>
        ) : (
          <>
            {/* Quick Metrics Bar */}
            <StatsBar />

            {/* Flexible Multi-Filter Builder */}
            <FilterBuilder />

            {/* Main Table View Container */}
            <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
              {activeTab === 'artists' ? <ArtistsTable /> : <DealsTable />}
            </main>
          </>
        )}
        </NativePage>
      </div>

      {/* Slide-over Detail Drawer & Modals */}
      <ArtistDrawer />
      <ArtistModal />
      <DealModal />
      <SettingsModal />
      <ImportExportModal />
      <ImportFromParserModal
        isOpen={isImportFromParserOpen}
        onClose={() => setIsImportFromParserOpen(false)}
      />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MotionConfig reducedMotion="user" transition={nativeTransition}><MainLayout /></MotionConfig>
    </AppProvider>
  );
}
