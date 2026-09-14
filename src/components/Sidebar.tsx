import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Settings } from 'lucide-react';
import { Download } from './InterfaceIcons';
import { nativeTransition } from './NativeMotion';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, setIsSettingsOpen, setIsImportExportOpen, lang, setLang, t } = useApp();
  const items = [
    { id: 'artists' as const, label: lang === 'ru' ? 'Артисты' : 'Artists' },
    { id: 'deals' as const, label: t.dealsTab },
    { id: 'analytics' as const, label: lang === 'ru' ? 'Аналитика' : 'Analytics' },
    { id: 'parser' as const, label: t.parserTab },
  ];
  return (
    <header className="studio-navigation">
      <div className="navigation-inner">
        <span className="studio-brand">yx<span>studio</span></span>
        <nav className="studio-nav" aria-label={lang === 'ru' ? 'Основная навигация' : 'Main navigation'}>
          {items.map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} aria-current={activeTab === id ? 'page' : undefined} className={`studio-nav-item ${activeTab === id ? 'is-active' : ''}`}>
              {label}
              {activeTab === id && <motion.span className="native-nav-selection" layoutId="sidebar-selection" transition={nativeTransition} />}
            </button>
          ))}
        </nav>
        <div className="navigation-utilities">
          <button id="export-import-btn" className="studio-icon-button" aria-label={t.exportImport} title={t.exportImport} onClick={() => setIsImportExportOpen(true)}><Download size={16} /></button>
          <button id="settings-btn" className="studio-icon-button" aria-label={t.settings} title={t.settings} onClick={() => setIsSettingsOpen(true)}><Settings size={16} /></button>
          <button onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')} aria-label="Switch language" className="language-button">{lang.toUpperCase()}</button>
        </div>
      </div>
    </header>
  );
};
