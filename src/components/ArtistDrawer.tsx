import { AnimatePresence } from 'motion/react';
import { NativeBackdrop, NativePanel } from './NativeMotion';
import type { Artist } from '../types';
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Instagram, Send, Mail, Phone, MessageSquare, Calendar, DollarSign, ExternalLink, Tag, Check, Briefcase, Sparkles, Clock } from 'lucide-react';
import { X, Plus, Trash2 } from './InterfaceIcons';
import { ConnectStatus, SalesStatus, ArtistStatus, DemoStatus, ReactionStatus, Deal } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { CustomDropdown } from './CustomDropdown';
import { DatePicker } from './DatePicker';

export const ArtistDrawer: React.FC = () => {
  const { artists, activeArtistId } = useApp();
  const artist = artists.find(a => a.id === activeArtistId);
  return <AnimatePresence>{artist && <ArtistDrawerContent key={artist.id} artist={artist} />}</AnimatePresence>;
};

const ArtistDrawerContent: React.FC<{ artist: Artist }> = ({ artist }) => {
  const {
    activeArtistId,
    setActiveArtistId,
    artists,
    updateArtist,
    deleteArtist,
    deals,
    setIsNewDealModalOpen,
    theme,
    formatMoney,
    t,
  } = useApp();

  const isLight = theme === 'light';


  const [name, setName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [discord, setDiscord] = useState('');
  const [notes, setNotes] = useState('');
  const [connect, setConnect] = useState<ConnectStatus>('yes');
  const [types, setTypes] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [sales, setSales] = useState<SalesStatus>('no');
  const [status, setStatus] = useState<ArtistStatus>('active');
  const [demoStatus, setDemoStatus] = useState<DemoStatus>('none');
  const [touches, setTouches] = useState(0);
  const [reaction, setReaction] = useState<ReactionStatus>('none');
  const [followUpDate, setFollowUpDate] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (artist) {
      setName(artist.name || '');
      setInstagram(artist.instagram || '');
      setEmail(artist.email || '');
      setPhone(artist.phone || '');
      setTelegram(artist.telegram || '');
      setDiscord(artist.discord || '');
      setNotes(artist.notes || '');
      setConnect(artist.connect || 'yes');
      setTypes(artist.types || []);
      setSales(artist.sales || 'no');
      setStatus(artist.status || 'active');
      setDemoStatus(artist.demoStatus || 'none');
      setTouches(artist.touches || 0);
      setReaction(artist.reaction || 'none');
      setFollowUpDate(artist.followUpDate || '');
    }
  }, [artist]);

  if (!artist) return null;

  const artistDeals = deals.filter(
    (d) =>
      (d.artistId && d.artistId === artist.id) ||
      (d.artistName && d.artistName.toLowerCase().trim() === artist.name.toLowerCase().trim())
  );

  const handleSave = () => {
    updateArtist(artist.id, {
      name,
      instagram,
      email,
      phone,
      telegram,
      discord,
      notes,
      connect,
      types,
      sales,
      status,
      demoStatus,
      touches,
      reaction,
      followUpDate,
    });
    setActiveArtistId(null);
  };

  const handleAddTag = () => {
    if (newTagInput.trim()) {
      const cleanTag = newTagInput.trim();
      if (!types.includes(cleanTag)) {
        const nextTypes = [...types, cleanTag];
        setTypes(nextTypes);
        updateArtist(artist.id, { types: nextTypes });
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const nextTypes = types.filter((t) => t !== tagToRemove);
    setTypes(nextTypes);
    updateArtist(artist.id, { types: nextTypes });
  };

  const handleSetRelativeFollowup = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const dateStr = d.toISOString().split('T')[0];
    setFollowUpDate(dateStr);
    updateArtist(artist.id, { followUpDate: dateStr });
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const getInstagramUrl = (handleOrUrl: string) => {
    if (!handleOrUrl) return '';
    if (handleOrUrl.startsWith('http')) return handleOrUrl;
    const clean = handleOrUrl.replace(/^@/, '');
    return `https://instagram.com/${clean}`;
  };

  const getTelegramUrl = (handleOrUrl: string) => {
    if (!handleOrUrl) return '';
    if (handleOrUrl.startsWith('http')) return handleOrUrl;
    const clean = handleOrUrl.replace(/^@/, '');
    return `https://t.me/${clean}`;
  };

  const handleDeleteConfirmed = () => {
    deleteArtist(artist.id);
    setActiveArtistId(null);
  };

  return (
    <>
      <NativeBackdrop className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
        <NativePanel drawer
          className={`native-drawer w-full max-w-xl shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-200 border-l ${
            isLight
              ? 'bg-white border-black/[0.08] text-[var(--ink)]'
              : 'bg-[var(--surface)] border-white/[0.08] text-white'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div
            className={`px-6 py-4 border-b flex items-center justify-between ${
              isLight ? 'bg-[var(--canvas)] border-black/[0.06]' : 'bg-[var(--surface)] border-white/[0.06]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-mono text-sm">✦</span>
              <h2 className={`text-sm font-semibold truncate max-w-xs ${isLight ? 'text-[var(--ink)]' : 'text-white'}`}>
                {name || t.editArtist}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className={`ios-icon-action is-destructive p-1.5 rounded-md transition ${
                  isLight
                    ? 'hover:bg-red-100 text-zinc-400 hover:text-red-600'
                    : 'hover:bg-red-500/20 text-zinc-400 hover:text-red-400'
                }`}
                title={t.delete}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveArtistId(null)}
                className={`ios-icon-action p-1.5 rounded-md transition ${
                  isLight
                    ? 'hover:bg-black/[0.05] text-zinc-400 hover:text-zinc-800'
                    : 'hover:bg-white/[0.08] text-zinc-400 hover:text-white'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
            {/* Quick Connect Action Buttons */}
            <div
              className={`p-3 rounded-xl border space-y-2 ${
                isLight
                  ? 'bg-[var(--canvas)] border-black/[0.06]'
                  : 'bg-[var(--surface-secondary)] border-white/[0.06]'
              }`}
            >
              <div className="text-[11px] font-medium text-zinc-500 flex items-center justify-between">
                <span>{t.quickContact}</span>
                {copiedField && (
                  <span className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
                    <Check className="w-3 h-3" /> Copied {copiedField}!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {/* Instagram */}
                {instagram ? (
                  <a
                    href={getInstagramUrl(instagram)}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition font-medium text-[11px] ${
                      isLight
                        ? 'bg-pink-50 hover:bg-pink-100 text-pink-800 border-pink-200'
                        : 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border-pink-500/20'
                    }`}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </a>
                ) : (
                  <button
                    onClick={() => copyToClipboard(name, 'Name')}
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] ${
                      isLight
                        ? 'bg-black/[0.03] text-zinc-400 border-black/[0.04]'
                        : 'bg-white/[0.03] text-zinc-500 border-white/[0.04]'
                    }`}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </button>
                )}

                {/* Telegram */}
                {telegram ? (
                  <a
                    href={getTelegramUrl(telegram)}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition font-medium text-[11px] ${
                      isLight
                        ? 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200'
                        : 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border-sky-500/20'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] ${
                      isLight
                        ? 'bg-black/[0.03] text-zinc-400 border-black/[0.04]'
                        : 'bg-white/[0.03] text-zinc-600 border-white/[0.04]'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram</span>
                  </button>
                )}

                {/* Email */}
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition font-medium text-[11px] ${
                      isLight
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                        : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/20'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] ${
                      isLight
                        ? 'bg-black/[0.03] text-zinc-400 border-black/[0.04]'
                        : 'bg-white/[0.03] text-zinc-600 border-white/[0.04]'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </button>
                )}

                {/* iMessage / Phone */}
                {phone ? (
                  <a
                    href={`sms:${phone}`}
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition font-medium text-[11px] ${
                      isLight
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/20'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>iMessage</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] ${
                      isLight
                        ? 'bg-black/[0.03] text-zinc-400 border-black/[0.04]'
                        : 'bg-white/[0.03] text-zinc-600 border-white/[0.04]'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>iMessage</span>
                  </button>
                )}
              </div>
            </div>

            {/* Core Info Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`text-[11px] block mb-1 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  {t.fieldInstaName}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Artist name or @handle"
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${
                    isLight
                      ? 'bg-white text-zinc-900 border-black/[0.1] focus:border-black/30'
                      : 'bg-[var(--surface-secondary)] text-zinc-100 border-white/[0.08] focus:border-emerald-500/40'
                  }`}
                />
              </div>

              <div>
                <label className={`text-[11px] block mb-1 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Instagram URL / Handle
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/... or @user"
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${
                    isLight
                      ? 'bg-white text-zinc-900 border-black/[0.1] focus:border-black/30'
                      : 'bg-[var(--surface-secondary)] text-zinc-100 border-white/[0.08] focus:border-emerald-500/40'
                  }`}
                />
              </div>

              <div>
                <label className={`text-[11px] block mb-1 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  {t.fieldEmail}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="artist@example.com"
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${
                    isLight
                      ? 'bg-white text-zinc-900 border-black/[0.1] focus:border-black/30'
                      : 'bg-[var(--surface-secondary)] text-zinc-100 border-white/[0.08] focus:border-emerald-500/40'
                  }`}
                />
              </div>

              <div>
                <label className={`text-[11px] block mb-1 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  {t.fieldPhone}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 123 4567"
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${
                    isLight
                      ? 'bg-white text-zinc-900 border-black/[0.1] focus:border-black/30'
                      : 'bg-[var(--surface-secondary)] text-zinc-100 border-white/[0.08] focus:border-emerald-500/40'
                  }`}
                />
              </div>

              <div>
                <label className={`text-[11px] block mb-1 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  {t.fieldTelegram}
                </label>
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="@username or t.me/..."
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${
                    isLight
                      ? 'bg-white text-zinc-900 border-black/[0.1] focus:border-black/30'
                      : 'bg-[var(--surface-secondary)] text-zinc-100 border-white/[0.08] focus:border-emerald-500/40'
                  }`}
                />
              </div>

              <div>
                <label className={`text-[11px] block mb-1 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  {t.fieldDiscord}
                </label>
                <input
                  type="text"
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  placeholder="discord_tag#0000"
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${
                    isLight
                      ? 'bg-white text-zinc-900 border-black/[0.1] focus:border-black/30'
                      : 'bg-[var(--surface-secondary)] text-zinc-100 border-white/[0.08] focus:border-emerald-500/40'
                  }`}
                />
              </div>
            </div>

            {/* Status, Connect, Sales, Demo Badges Grid */}
            <div
              className={`grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl border ${
                isLight
                  ? 'bg-[var(--canvas)] border-black/[0.06]'
                  : 'bg-[var(--surface-secondary)] border-white/[0.06]'
              }`}
            >
              <div className="w-full max-w-full overflow-hidden">
                <label className="text-[10px] text-zinc-400 font-medium block mb-1 truncate">{t.fieldConnect}</label>
                <CustomDropdown
                  variant="filter"
                  className="w-full block"
                  buttonClassName="w-full max-w-full px-2 py-1 text-xs text-ellipsis whitespace-nowrap"
                  value={connect}
                  onChange={(val) => {
                    const next = val as ConnectStatus;
                    setConnect(next);
                    updateArtist(artist.id, { connect: next });
                  }}
                  options={[
                    { id: 'yes', label: t.connectYes, color: 'emerald' },
                    { id: 'no', label: t.connectNo, color: 'red' },
                  ]}
                  allowCreate={false}
                />
              </div>

              <div className="w-full max-w-full overflow-hidden">
                <label className="text-[10px] text-zinc-400 font-medium block mb-1 truncate">{t.fieldSales}</label>
                <CustomDropdown
                  variant="filter"
                  className="w-full block"
                  buttonClassName="w-full max-w-full px-2 py-1 text-xs text-ellipsis whitespace-nowrap"
                  value={sales}
                  onChange={(val) => {
                    const next = val as SalesStatus;
                    setSales(next);
                    updateArtist(artist.id, { sales: next });
                  }}
                  options={[
                    { id: 'yes', label: t.salesYes, color: 'emerald' },
                    { id: 'no', label: t.salesNo, color: 'red' },
                  ]}
                  allowCreate={false}
                />
              </div>

              <div className="w-full max-w-full overflow-hidden">
                <label className="text-[10px] text-zinc-400 font-medium block mb-1 truncate">{t.fieldStatus}</label>
                <CustomDropdown
                  variant="filter"
                  className="w-full block"
                  buttonClassName="w-full max-w-full px-2 py-1 text-xs text-ellipsis whitespace-nowrap"
                  category="artistStatus"
                  value={status}
                  onChange={(val) => {
                    const next = val as ArtistStatus;
                    setStatus(next);
                    updateArtist(artist.id, { status: next });
                  }}
                />
              </div>

              <div className="w-full max-w-full overflow-hidden">
                <label className="text-[10px] text-zinc-400 font-medium block mb-1 truncate">{t.fieldDemo}</label>
                <CustomDropdown
                  variant="filter"
                  className="w-full block"
                  buttonClassName="w-full max-w-full px-2 py-1 text-xs text-ellipsis whitespace-nowrap"
                  category="demoStatus"
                  value={demoStatus}
                  onChange={(val) => {
                    const next = val as DemoStatus;
                    setDemoStatus(next);
                    updateArtist(artist.id, { demoStatus: next });
                  }}
                />
              </div>

              <div className="w-full max-w-full overflow-hidden">
                <label className="text-[10px] text-zinc-400 font-medium block mb-1 truncate">{t.fieldTouches}</label>
                <div
                  className={`flex items-center justify-between gap-1 px-2 py-1 rounded-lg border h-[30px] w-full max-w-full overflow-hidden ${
                    isLight
                      ? 'bg-white border-black/[0.1]'
                      : 'bg-[var(--surface)] border-white/[0.08]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.max(0, touches - 1);
                      setTouches(next);
                      updateArtist(artist.id, { touches: next });
                    }}
                    className="text-zinc-400 hover:text-black dark:hover:text-white px-1.5 py-0.5 cursor-pointer font-bold"
                  >
                    -
                  </button>
                  <span className={`text-center font-mono font-semibold text-xs ${isLight ? 'text-zinc-900' : 'text-zinc-200'}`}>
                    {touches}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = touches + 1;
                      setTouches(next);
                      updateArtist(artist.id, { touches: next });
                    }}
                    className="text-zinc-400 hover:text-emerald-600 px-1.5 py-0.5 cursor-pointer font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="w-full max-w-full overflow-hidden">
                <label className="text-[10px] text-zinc-400 font-medium block mb-1 truncate">{t.fieldReaction}</label>
                <CustomDropdown
                  variant="filter"
                  className="w-full block"
                  buttonClassName="w-full max-w-full px-2 py-1 text-xs text-ellipsis whitespace-nowrap"
                  category="reaction"
                  value={reaction}
                  onChange={(val) => {
                    const next = val as ReactionStatus;
                    setReaction(next);
                    updateArtist(artist.id, { reaction: next });
                  }}
                />
              </div>

              <div className="col-span-2 w-full max-w-full overflow-hidden">
                <label className="text-[10px] text-zinc-400 font-medium block mb-1 truncate">{t.fieldFollowUp}</label>
                <div className="flex items-center gap-1.5 w-full max-w-full overflow-hidden">
                  <DatePicker
                    value={followUpDate}
                    onChange={(next) => {
                      setFollowUpDate(next);
                      updateArtist(artist.id, { followUpDate: next });
                    }}
                    variant="input"
                    showShortcuts={true}
                    showFollowUpBadge={true}
                    allowClear={true}
                    className="flex-1 w-full max-w-full"
                  />
                </div>
              </div>
            </div>

            {/* Beat Types / Tags */}
            <div>
              <label className={`text-[11px] block mb-1.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {t.fieldTypes}
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {types.map((tag, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border font-mono ${
                      isLight
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        : 'bg-[#1C1C22] text-zinc-300 border-white/[0.08]'
                    }`}
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ios-icon-action text-zinc-400 hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder={t.typeTagPlaceholder}
                  className={`flex-1 px-3 py-1.5 rounded-lg border focus:outline-none ${
                    isLight
                      ? 'bg-white text-zinc-900 border-black/[0.1] focus:border-black/30'
                      : 'bg-[var(--surface-secondary)] text-zinc-200 border-white/[0.08] focus:border-emerald-500/40'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className={`px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition ${
                    isLight
                      ? 'bg-black/[0.04] hover:bg-black/[0.08] text-zinc-800 border-black/[0.08]'
                      : 'bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border-white/[0.06]'
                  }`}
                >
                  +
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={`text-[11px] block mb-1 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {t.fieldNotes}
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Beat preferences, BPM, references, pack zip links, split deals..."
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none resize-y ${
                  isLight
                    ? 'bg-white text-zinc-900 border-black/[0.1] focus:border-black/30'
                    : 'bg-[var(--surface-secondary)] text-zinc-200 border-white/[0.08] focus:border-emerald-500/40'
                }`}
              />
            </div>

            {/* Deals History with this Artist */}
            <div className={`pt-3 border-t ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`flex items-center gap-1.5 text-xs font-semibold ${isLight ? 'text-zinc-900' : 'text-zinc-200'}`}>
                  <Briefcase className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{t.dealsHistory}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">({artistDeals.length})</span>
                </div>
                <button
                  onClick={() => setIsNewDealModalOpen(true)}
                  className="flex items-center gap-1 text-[11px] text-cyan-600 hover:text-cyan-700 font-medium cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{t.createDealForArtist}</span>
                </button>
              </div>

              {artistDeals.length > 0 ? (
                <div className="space-y-1.5">
                  {artistDeals.map((d) => (
                    <div
                      key={d.id}
                      className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        isLight
                          ? 'bg-[var(--canvas)] border-black/[0.06]'
                          : 'bg-[var(--surface-secondary)] border-white/[0.04]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold font-mono ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
                            {formatMoney(d.amount)}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] ${
                              d.stage === 'closed'
                                ? isLight ? 'bg-emerald-50 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300'
                                : d.stage === 'interested'
                                ? isLight ? 'bg-amber-50 text-amber-800' : 'bg-amber-500/10 text-amber-400'
                                : d.stage === 'in_progress'
                                ? isLight ? 'bg-sky-50 text-sky-800' : 'bg-sky-500/10 text-sky-300'
                                : isLight ? 'bg-red-50 text-red-800' : 'bg-red-500/10 text-red-300'
                            }`}
                          >
                            {d.stage}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">{d.platform}</span>
                        </div>
                        {d.notes && (
                          <div className="text-[10px] text-zinc-500 truncate max-w-sm mt-0.5">
                            {d.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">{d.date}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={`p-3 rounded-lg text-center text-xs border ${
                    isLight
                      ? 'bg-[var(--canvas)] text-zinc-500 border-black/[0.04]'
                      : 'bg-[var(--surface-secondary)] text-zinc-500 border-white/[0.04]'
                  }`}
                >
                  {t.noDealsYet}
                </div>
              )}
            </div>
          </div>

          {/* Drawer Footer */}
          <div
            className={`px-6 py-3.5 border-t flex items-center justify-end gap-2 ${
              isLight ? 'bg-[var(--canvas)] border-black/[0.06]' : 'bg-[var(--surface)] border-white/[0.06]'
            }`}
          >
            <button
              onClick={() => setActiveArtistId(null)}
              className={`px-4 py-2 rounded-lg text-xs font-medium border transition cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-black/[0.04] text-zinc-700 border-black/[0.08]'
                  : 'bg-[#1C1C22] hover:bg-[#25252e] text-zinc-300 border-white/[0.06]'
              }`}
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              className={`px-5 py-2 rounded-lg text-xs font-semibold border transition shadow-sm cursor-pointer ${
                isLight
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {t.save}
            </button>
          </div>
        </NativePanel>
      </NativeBackdrop>

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title={t.deleteArtistModalTitle}
        description={`${t.deleteConfirmDesc} (${artist.name})`}
        confirmLabel={t.delete}
        cancelLabel={t.cancel}
        isDestructive={true}
        onConfirm={handleDeleteConfirmed}
        onClose={() => setIsDeleteConfirmOpen(false)}
      />
    </>
  );
};
