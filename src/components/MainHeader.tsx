import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Search, Plus, Sun, Moon } from 'lucide-react';
import { nativeTransition } from './NativeMotion';

export const MainHeader: React.FC = () => {
  const { activeTab, searchQuery, setSearchQuery, setIsNewArtistModalOpen, setIsNewDealModalOpen, theme, toggleTheme, currency, setCurrency, lang, t } = useApp();
  const titles = {
    artists: lang === 'ru' ? 'Артисты' : 'Artists',
    deals: t.dealsTab,
    analytics: lang === 'ru' ? 'Аналитика' : 'Analytics',
    parser: t.parserTab,
  };
  return (
    <header className="studio-header">
      <div className="studio-toolbar">
        <span className="workspace-path">{lang === 'ru' ? 'Моя студия' : 'My studio'}</span>
        <div className="toolbar-actions">
          <div className="currency-switch" aria-label={lang === 'ru' ? 'Валюта' : 'Currency'}>
            {(['USD', 'KZT'] as const).map(c => (
              <button key={c} id={`currency-${c.toLowerCase()}-btn`} aria-pressed={currency === c} className={currency === c ? 'is-active' : ''} onClick={() => setCurrency(c)}>
                {currency === c && <motion.span className="native-segment-selection" layoutId="currency-selection" transition={nativeTransition} />}
                <span>{c === 'USD' ? '$' : '₸'} {c}</span>
              </button>
            ))}
          </div>
          <button id="theme-toggle-btn" className="studio-icon-button" onClick={toggleTheme} aria-label="Toggle theme" title={lang === 'ru' ? 'Сменить тему' : 'Change theme'}>
            {theme === 'light' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
      <div className="studio-heading">
        <h1>{titles[activeTab]}</h1>
        <div className="heading-actions">
          {activeTab !== 'analytics' && (
            <label className="studio-search">
              <Search size={17} />
              <input id="global-search-input" aria-label={t.searchPlaceholder} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={lang === 'ru' ? 'Поиск' : 'Search'} />
              <kbd>/</kbd>
            </label>
          )}
          {activeTab !== 'parser' && (
            <button id={activeTab === 'deals' ? 'add-deal-primary-btn' : activeTab === 'analytics' ? 'add-artist-analytics-btn' : 'add-artist-primary-btn'} className="studio-primary" onClick={() => activeTab === 'deals' ? setIsNewDealModalOpen(true) : setIsNewArtistModalOpen(true)}>
              <Plus size={16} /><span>{activeTab === 'deals' ? t.addDeal : t.addArtist}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
