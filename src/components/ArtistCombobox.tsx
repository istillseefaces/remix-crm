import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, ChevronDown, Check, UserPlus, X, User } from 'lucide-react';
import { Artist } from '../types';

interface ArtistComboboxProps {
  value: string;
  onChange: (artistName: string, artistId?: string) => void;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
  id?: string;
}

export const ArtistCombobox: React.FC<ArtistComboboxProps> = ({
  value,
  onChange,
  placeholder = 'Поиск или имя артиста...',
  required = false,
  autoFocus = false,
  className = '',
  id,
}) => {
  const { artists, theme, lang } = useApp();
  const isLight = theme === 'light';

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Sync searchTerm when external value changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter artists
  const filteredArtists = artists.filter((artist) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase().trim();
    const matchName = (artist.name || '').toLowerCase().includes(query);
    const matchInsta = (artist.instagram || '').toLowerCase().includes(query);
    const matchEmail = (artist.email || '').toLowerCase().includes(query);
    const matchTg = (artist.telegram || '').toLowerCase().includes(query);
    return matchName || matchInsta || matchEmail || matchTg;
  });

  const exactMatch = artists.find(
    (a) => a.name.toLowerCase().trim() === searchTerm.toLowerCase().trim()
  );

  const showCustomOption = searchTerm.trim().length > 0 && !exactMatch;

  const handleSelectArtist = (artist: Artist) => {
    setSearchTerm(artist.name);
    onChange(artist.name, artist.id);
    setIsOpen(false);
  };

  const handleSelectCustom = (customName: string) => {
    const trimmed = customName.trim();
    if (!trimmed) return;
    setSearchTerm(trimmed);
    onChange(trimmed, undefined);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const maxLen = filteredArtists.length + (showCustomOption ? 1 : 0);
      if (maxLen > 0) {
        setActiveIndex((prev) => (prev + 1) % maxLen);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const maxLen = filteredArtists.length + (showCustomOption ? 1 : 0);
      if (maxLen > 0) {
        setActiveIndex((prev) => (prev - 1 + maxLen) % maxLen);
      }
    } else if (e.key === 'Enter') {
      if (isOpen) {
        e.preventDefault();
        if (showCustomOption && activeIndex === 0) {
          handleSelectCustom(searchTerm);
        } else {
          const artistIndex = showCustomOption ? activeIndex - 1 : activeIndex;
          if (filteredArtists[artistIndex]) {
            handleSelectArtist(filteredArtists[artistIndex]);
          } else if (searchTerm.trim()) {
            handleSelectCustom(searchTerm);
          }
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-cyan-400 via-teal-500 to-indigo-500',
      'from-indigo-500 via-purple-500 to-pink-500',
      'from-emerald-400 via-teal-500 to-cyan-500',
      'from-blue-500 via-indigo-600 to-violet-600',
      'from-amber-400 via-orange-500 to-red-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return gradients[Math.abs(hash) % gradients.length];
  };

  const getInitials = (name: string) => {
    if (!name) return 'A';
    const clean = name.replace(/^@/, '').trim();
    const parts = clean.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`} id={id}>
      <div
        className={`flex items-center w-full px-3 py-2 rounded-xl border transition-all duration-150 ${
          isOpen
            ? isLight
              ? 'bg-white border-cyan-500 ring-2 ring-cyan-500/20 shadow-sm'
              : 'bg-[var(--surface-secondary)] border-cyan-400 ring-2 ring-cyan-400/20 shadow-lg'
            : isLight
            ? 'bg-white border-black/[0.1] hover:border-black/[0.2]'
            : 'bg-[var(--surface-secondary)] border-white/[0.08] hover:border-white/[0.15]'
        }`}
      >
        <Search
          className={`w-3.5 h-3.5 mr-2 shrink-0 ${
            isOpen ? 'text-cyan-400' : isLight ? 'text-zinc-400' : 'text-zinc-500'
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => {
            setIsOpen(true);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
          className={`w-full bg-transparent focus:outline-none text-xs font-medium placeholder:text-zinc-500 ${
            isLight ? 'text-zinc-900' : 'text-white'
          }`}
        />

        {searchTerm && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSearchTerm('');
              onChange('');
              inputRef.current?.focus();
            }}
            className={`p-0.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer mr-1`}
          >
            <X className="w-3 h-3" />
          </button>
        )}

        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setIsOpen(!isOpen);
            inputRef.current?.focus();
          }}
          className={`p-0.5 rounded-md transition cursor-pointer ${
            isLight ? 'text-zinc-400 hover:text-black' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-cyan-400' : ''
            }`}
          />
        </button>
      </div>

      {/* Floating Popover Autocomplete Menu */}
      {isOpen && (
        <div
          ref={listRef}
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-y-auto rounded-xl border p-1 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-250 ${
            isLight
              ? 'bg-white/95 border-black/[0.08] divide-black/[0.04]'
              : 'bg-[var(--surface)]/95 border-white/[0.08] divide-white/[0.04]'
          }`}
        >
          {/* Custom entry if not exact match */}
          {showCustomOption && (
            <button
              type="button"
              onClick={() => handleSelectCustom(searchTerm)}
              onMouseEnter={() => setActiveIndex(0)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition cursor-pointer mb-1 ${
                activeIndex === 0
                  ? isLight
                    ? 'bg-cyan-50 text-cyan-900 font-semibold'
                    : 'bg-cyan-500/15 text-cyan-300 font-semibold'
                  : isLight
                  ? 'hover:bg-black/[0.03] text-zinc-700'
                  : 'hover:bg-white/[0.04] text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isLight ? 'bg-cyan-100 text-cyan-700' : 'bg-cyan-500/20 text-cyan-400'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="text-[11px] opacity-75">
                    {lang === 'ru' ? 'Выбрать или создать:' : 'Use or create:'}
                  </span>{' '}
                  <span className="font-semibold text-cyan-400">«{searchTerm.trim()}»</span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 shrink-0">
                New
              </span>
            </button>
          )}

          {/* List of matching artists */}
          {filteredArtists.length > 0 ? (
            filteredArtists.map((artist, idx) => {
              const adjustedIdx = showCustomOption ? idx + 1 : idx;
              const isSelected =
                artist.name.toLowerCase().trim() === value.toLowerCase().trim();
              const isHighlighted = activeIndex === adjustedIdx;

              return (
                <button
                  key={artist.id}
                  type="button"
                  onClick={() => handleSelectArtist(artist)}
                  onMouseEnter={() => setActiveIndex(adjustedIdx)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition cursor-pointer ${
                    isHighlighted
                      ? isLight
                        ? 'bg-black/[0.05] text-black font-semibold'
                        : 'bg-white/[0.08] text-white font-semibold'
                      : isSelected
                      ? isLight
                        ? 'bg-cyan-50 text-cyan-900'
                        : 'bg-cyan-500/10 text-cyan-300'
                      : isLight
                      ? 'text-zinc-700 hover:bg-black/[0.03]'
                      : 'text-zinc-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full studio-contact-avatar ${getAvatarGradient(
                        artist.name
                      )} p-[1px] flex items-center justify-center shrink-0`}
                    >
                      <div
                        className={`w-full h-full rounded-full flex items-center justify-center font-bold text-[10px] ${
                          isLight ? 'bg-white text-zinc-900' : 'bg-[var(--surface)] text-white'
                        }`}
                      >
                        {getInitials(artist.name)}
                      </div>
                    </div>

                    <div className="min-w-0 truncate">
                      <div className="font-semibold truncate">{artist.name}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isLight ? 'text-zinc-500' : 'text-zinc-400'
                        }`}
                      >
                        {artist.instagram || artist.email || artist.telegram || 'No social handle'}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })
          ) : !showCustomOption ? (
            <div
              className={`py-4 px-3 text-center text-xs ${
                isLight ? 'text-zinc-400' : 'text-zinc-500'
              }`}
            >
              <User className="w-5 h-5 mx-auto mb-1 opacity-50" />
              <span>{lang === 'ru' ? 'Артисты не найдены' : 'No artists found'}</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
