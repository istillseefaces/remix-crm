import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, DollarSign, Briefcase } from 'lucide-react';
import { DealPlatform, DealStage } from '../types';
import { CustomDropdown } from './CustomDropdown';
import { DatePicker } from './DatePicker';
import { ArtistCombobox } from './ArtistCombobox';

export const DealModal: React.FC = () => {
  const {
    isNewDealModalOpen,
    setIsNewDealModalOpen,
    activeDealId,
    setActiveDealId,
    deals,
    addDeal,
    updateDeal,
    artists,
    theme,
    currency: appCurrency,
    t,
  } = useApp();

  const isLight = theme === 'light';
  const isEditing = Boolean(activeDealId);
  const editingDeal = deals.find((d) => d.id === activeDealId);

  const [artistName, setArtistName] = useState('');
  const [platform, setPlatform] = useState<DealPlatform>('Instagram');
  const [stage, setStage] = useState<DealStage>('interested');
  const [amount, setAmount] = useState<number | string>(250);
  const [currency, setCurrency] = useState('$');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingDeal) {
      setArtistName(editingDeal.artistName || '');
      setPlatform(editingDeal.platform || 'Instagram');
      setStage(editingDeal.stage || 'interested');
      setAmount(editingDeal.amount || 0);
      setCurrency(editingDeal.currency || '$');
      setDate(editingDeal.date || new Date().toISOString().split('T')[0]);
      setNotes(editingDeal.notes || '');
    } else {
      setArtistName('');
      setPlatform('Instagram');
      setStage('interested');
      setAmount(250);
      setCurrency('$');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [editingDeal, isNewDealModalOpen]);

  const isOpen = isNewDealModalOpen || isEditing;
  if (!isOpen) return null;

  const handleClose = () => {
    setIsNewDealModalOpen(false);
    setActiveDealId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistName.trim()) return;

    const matchedArtist = artists.find(
      (a) => a.name.toLowerCase().trim() === artistName.toLowerCase().trim()
    );

    if (isEditing && activeDealId) {
      updateDeal(activeDealId, {
        artistName: artistName.trim(),
        artistId: matchedArtist?.id,
        platform,
        stage,
        amount: Number(amount) || 0,
        currency,
        date,
        notes: notes.trim(),
      });
    } else {
      addDeal({
        artistName: artistName.trim(),
        artistId: matchedArtist?.id,
        platform,
        stage,
        amount: Number(amount) || 0,
        currency,
        date,
        notes: notes.trim(),
      });
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border animate-in zoom-in-95 duration-150 ${
          isLight
            ? 'bg-white border-black/[0.08] text-[#1A1A1E]'
            : 'bg-[#111113] border-white/[0.08] text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isLight ? 'bg-[#F8F9FA] border-black/[0.06]' : 'bg-[#141418] border-white/[0.06]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-cyan-500" />
            <h3 className={`text-sm font-semibold ${isLight ? 'text-[#1A1A1E]' : 'text-white'}`}>
              {isEditing ? t.editDealTitle : t.newDealTitle}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Artist Combobox with autocomplete list & fast creation */}
          <div>
            <label className={`text-[11px] block mb-1 font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {t.fieldArtist} <span className="text-red-500">*</span>
            </label>
            <ArtistCombobox
              value={artistName}
              onChange={(name) => setArtistName(name)}
              placeholder="Поиск или ввод артиста..."
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Platform */}
            <div>
              <label className={`text-[11px] block mb-1 font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {t.fieldPlatform}
              </label>
              <CustomDropdown
                variant="filter"
                category="platform"
                value={platform}
                onChange={(val) => setPlatform(val as DealPlatform)}
              />
            </div>

            {/* Stage */}
            <div>
              <label className={`text-[11px] block mb-1 font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {t.fieldStage}
              </label>
              <CustomDropdown
                variant="filter"
                value={stage}
                onChange={(val) => setStage(val as DealStage)}
                options={[
                  { id: 'interested', label: t.stageInterested, color: 'amber' },
                  { id: 'in_progress', label: t.stageInProgress, color: 'blue' },
                  { id: 'closed', label: t.stageClosed, color: 'emerald' },
                  { id: 'cancelled', label: t.stageCancelled, color: 'red' },
                ]}
                allowCreate={false}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Amount */}
            <div>
              <label className={`text-[11px] block mb-1 font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {t.fieldAmount} (USD base)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-emerald-600 font-mono font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="250.00"
                  className={`w-full pl-7 pr-3 py-2 font-mono font-semibold rounded-lg border focus:outline-none ${
                    isLight
                      ? 'bg-white text-zinc-900 border-black/[0.1] focus:border-cyan-500/60'
                      : 'bg-[#18181C] text-zinc-100 border-white/[0.08] focus:border-cyan-500/40'
                  }`}
                />
              </div>
            </div>

            {/* Deal Date */}
            <div>
              <label className={`text-[11px] block mb-1 font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {t.fieldDealDate}
              </label>
              <DatePicker
                value={date}
                onChange={setDate}
                variant="input"
                showShortcuts={true}
                allowClear={true}
                className="w-full"
              />
            </div>
          </div>

          {/* Notes / Terms */}
          <div>
            <label className={`text-[11px] block mb-1 font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {t.fieldDealNotes}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Exclusive license, Stems delivery, 50% publishing, BMI/ASCAP..."
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none resize-y ${
                isLight
                  ? 'bg-white text-zinc-900 border-black/[0.1] focus:border-cyan-500/60'
                  : 'bg-[#18181C] text-zinc-100 border-white/[0.08] focus:border-cyan-500/40'
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
