import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Tag } from 'lucide-react';
import { ConnectStatus, SalesStatus, ArtistStatus, DemoStatus, ReactionStatus } from '../types';
import { CustomDropdown } from './CustomDropdown';
import { DatePicker } from './DatePicker';

export const ArtistModal: React.FC = () => {
  const { isNewArtistModalOpen, setIsNewArtistModalOpen, addArtist, t, theme } = useApp();
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
  const [tagInput, setTagInput] = useState('');
  const [sales, setSales] = useState<SalesStatus>('no');
  const [status, setStatus] = useState<ArtistStatus>('active');
  const [demoStatus, setDemoStatus] = useState<DemoStatus>('none');
  const [touches, setTouches] = useState(0);
  const [reaction, setReaction] = useState<ReactionStatus>('none');
  const [followUpDate, setFollowUpDate] = useState('');

  const resetForm = () => {
    setName('');
    setInstagram('');
    setEmail('');
    setPhone('');
    setTelegram('');
    setDiscord('');
    setNotes('');
    setConnect('yes');
    setTypes([]);
    setTagInput('');
    setSales('no');
    setStatus('active');
    setDemoStatus('none');
    setTouches(0);
    setReaction('none');
    setFollowUpDate('');
  };

  const handleClose = () => {
    resetForm();
    setIsNewArtistModalOpen(false);
  };

  if (!isNewArtistModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addArtist({
      name: name.trim(),
      instagram: instagram.trim(),
      email: email.trim(),
      phone: phone.trim(),
      telegram: telegram.trim(),
      discord: discord.trim(),
      notes: notes.trim(),
      connect,
      types,
      sales,
      status,
      demoStatus,
      touches,
      reaction,
      followUpDate,
    });

    handleClose();
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const clean = tagInput.trim();
      if (!types.includes(clean)) {
        setTypes([...types, clean]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tToRemove: string) => {
    setTypes(types.filter((x) => x !== tToRemove));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border animate-in zoom-in-95 duration-150 ${
          isLight
            ? 'bg-white border-black/[0.08] text-[#1A1A1E]'
            : 'bg-[#111113] border-white/[0.08] text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isLight ? 'bg-[#F8F9FA] border-black/[0.06]' : 'bg-[#141418] border-white/[0.06]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-mono">✦</span>
            <h3 className={`text-sm font-semibold ${isLight ? 'text-[#1A1A1E]' : 'text-white'}`}>
              {t.newArtistTitle}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isLight
                ? 'hover:bg-black/[0.05] text-zinc-400 hover:text-zinc-800'
                : 'hover:bg-white/[0.08] text-zinc-400 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className={`text-[11px] block mb-1 font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {t.fieldInstaName} <span className="text-red-500">*</span>
              </label>
              <input
                autoFocus
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ken Carson or @kencarson"
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${
                  isLight
                    ? 'bg-white text-zinc-900 border-black/[0.1] focus:border-black/30'
                    : 'bg-[#18181C] text-zinc-100 border-white/[0.08] focus:border-emerald-500/40'
                }`}
              />
            </div>

            <div>
              <label className={`text-[11px] block mb-1 font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Instagram
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${
                  isLight
                    ? 'bg-white text-zinc-900 border-black/[0.1] focus:border-black/30'
                    : 'bg-[#18181C] text-zinc-100 border-white/[0.08] focus:border-emerald-500/40'
                }`}
              />
            </div>

            <div>
              <label className={`text-[11px] block mb-1 font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {t.fieldEmail}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="artist@gmail.com"
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${
                  isLight
                    ? 'bg-white text-zinc-900 border-black/[0.1] focus:border-black/30'
                    : 'bg-[#18181C] text-zinc-100 border-white/[0.08] focus:border-emerald-500/40'
                }`}
              />
            </div>

            <div>
              <label className={`text-[11px] block mb-1 font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {t.fieldPhone}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 404 555 0192"
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${
                  isLight
                    ? 'bg-white text-zinc-900 border-black/[0.1] focus:border-black/30'
                    : 'bg-[#18181C] text-zinc-100 border-white/[0.08] focus:border-emerald-500/40'
                }`}
              />
            </div>

            <div>
              <label className={`text-[11px] block mb-1 font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {t.fieldTelegram}
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@username"
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${
                  isLight
                    ? 'bg-white text-zinc-900 border-black/[0.1] focus:border-black/30'
                    : 'bg-[#18181C] text-zinc-100 border-white/[0.08] focus:border-emerald-500/40'
                }`}
              />
            </div>

            <div>
              <label className={`text-[11px] block mb-1 font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {t.fieldDiscord}
              </label>
              <input
                type="text"
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                placeholder="username#0000"
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${
                  isLight
                    ? 'bg-white text-zinc-900 border-black/[0.1] focus:border-black/30'
                    : 'bg-[#18181C] text-zinc-100 border-white/[0.08] focus:border-emerald-500/40'
                }`}
              />
            </div>

            <div>
              <label className={`text-[11px] block mb-1 font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {t.fieldFollowUp}
              </label>
              <DatePicker
                value={followUpDate}
                onChange={setFollowUpDate}
                variant="input"
                showShortcuts={true}
                showFollowUpBadge={true}
                allowClear={true}
                className="w-full"
              />
            </div>
          </div>

          {/* Custom Dropdown Badges Grid */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl border ${
              isLight
                ? 'bg-[#F8F9FA] border-black/[0.06]'
                : 'bg-[#18181C] border-white/[0.06]'
            }`}
          >
            <div className="min-w-0">
              <label className="text-[10px] text-zinc-400 font-medium block mb-1 truncate">{t.fieldConnect}</label>
              <CustomDropdown
                variant="filter"
                value={connect}
                onChange={(val) => setConnect(val as ConnectStatus)}
                options={[
                  { id: 'yes', label: t.connectYes, color: 'emerald' },
                  { id: 'no', label: t.connectNo, color: 'red' },
                ]}
                allowCreate={false}
                className="w-full"
                buttonClassName="w-full overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1.5 text-xs"
              />
            </div>

            <div className="min-w-0">
              <label className="text-[10px] text-zinc-400 font-medium block mb-1 truncate">{t.fieldSales}</label>
              <CustomDropdown
                variant="filter"
                value={sales}
                onChange={(val) => setSales(val as SalesStatus)}
                options={[
                  { id: 'yes', label: t.salesYes, color: 'emerald' },
                  { id: 'no', label: t.salesNo, color: 'red' },
                ]}
                allowCreate={false}
                className="w-full"
                buttonClassName="w-full overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1.5 text-xs"
              />
            </div>

            <div className="min-w-0">
              <label className="text-[10px] text-zinc-400 font-medium block mb-1 truncate">{t.fieldStatus}</label>
              <CustomDropdown
                variant="filter"
                category="artistStatus"
                value={status}
                onChange={(val) => setStatus(val as ArtistStatus)}
                className="w-full"
                buttonClassName="w-full overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1.5 text-xs"
              />
            </div>

            <div className="min-w-0">
              <label className="text-[10px] text-zinc-400 font-medium block mb-1 truncate">{t.fieldDemo}</label>
              <CustomDropdown
                variant="filter"
                category="demoStatus"
                value={demoStatus}
                onChange={(val) => setDemoStatus(val as DemoStatus)}
                className="w-full"
                buttonClassName="w-full overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1.5 text-xs"
              />
            </div>
          </div>

          {/* Types / Genre Tags */}
          <div>
            <label className={`text-[11px] block mb-1 font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {t.fieldTypes}
            </label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {types.map((tag, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border font-mono ${
                    isLight
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      : 'bg-[#1C1C22] text-zinc-300 border-white/[0.08]'
                  }`}
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-zinc-400 hover:text-red-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
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
                    : 'bg-[#18181C] text-zinc-100 border-white/[0.08] focus:border-emerald-500/40'
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
            <label className={`text-[11px] block mb-1 font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {t.fieldNotes}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes, BPM, price agreements, key..."
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none resize-y ${
                isLight
                  ? 'bg-white text-zinc-900 border-black/[0.1] focus:border-black/30'
                  : 'bg-[#18181C] text-zinc-100 border-white/[0.08] focus:border-emerald-500/40'
              }`}
            />
          </div>

          {/* Buttons */}
          <div
            className={`pt-3 flex items-center justify-end gap-2 border-t ${
              isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'
            }`}
          >
            <button
              type="button"
              onClick={handleClose}
              className={`px-4 py-2 rounded-lg font-medium border transition cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-black/[0.04] text-zinc-700 border-black/[0.08]'
                  : 'bg-[#1C1C22] hover:bg-[#25252e] text-zinc-300 border-white/[0.06]'
              }`}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg font-semibold border transition shadow-sm cursor-pointer ${
                isLight
                  ? 'bg-black text-white hover:bg-black/90 border-black'
                  : 'bg-white text-black hover:bg-zinc-200 border-white'
              }`}
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
