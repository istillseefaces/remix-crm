import { AnimatePresence } from 'motion/react';
import { NativeBackdrop, NativePanel } from './NativeMotion';
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  Layers,
  ArrowDownToLine,
} from 'lucide-react';
import {
  exportArtistsToExcel,
  exportDealsToExcel,
  exportFullWorkbook,
  exportToCSV,
  parseImportFile,
} from '../utils/exportUtils';

export const ImportExportModal: React.FC = () => {
  const {
    isImportExportOpen,
    setIsImportExportOpen,
    artists,
    deals,
    importArtists,
    importDeals,
    importSnapshot,
    showToast,
    t,
    lang,
    theme,
  } = useApp();

  const isLight = theme === 'light';

  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    success?: boolean;
    message?: string;
    details?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);



  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  };

  const processFile = async (file: File) => {
    setImportStatus(null);
    try {
      const result = await parseImportFile(file);
      if (result.type === 'snapshot' && result.artists && result.deals) {
        importSnapshot(result.artists, result.deals, 'append');
        const sheetMsg = result.sheetInfo?.sheet2Name
          ? `Лист 1 (${result.sheetInfo.sheet1Name}): ${result.artists.length} артистов | Лист 2 (${result.sheetInfo.sheet2Name}): ${result.deals.length} сделок`
          : `${result.artists.length} артистов + ${result.deals.length} сделок`;
        setImportStatus({
          success: true,
          message: `${t.importSuccess} ${result.count}`,
          details: sheetMsg,
        });
        showToast(`Импортировано: ${result.artists.length} артистов и ${result.deals.length} сделок`, 'success');
      } else if (result.type === 'artists' && result.artists) {
        importArtists(result.artists, 'append');
        setImportStatus({
          success: true,
          message: `${t.importSuccess} ${result.artists.length} (${file.name})`,
          details: `База артистов обновлена (${result.artists.length} записей с сохранением исходного порядка)`,
        });
        showToast(`Импортировано ${result.artists.length} артистов`, 'success');
      } else if (result.type === 'deals' && result.deals) {
        importDeals(result.deals, 'append');
        setImportStatus({
          success: true,
          message: `${t.importSuccess} ${result.deals.length} (${file.name})`,
          details: `База сделок обновлена (${result.deals.length} записей)`,
        });
        showToast(`Импортировано ${result.deals.length} сделок`, 'success');
      } else {
        setImportStatus({
          success: false,
          message: 'Не удалось распознать структуру файла. Проверьте заголовки колонок.',
        });
      }
    } catch (err) {
      console.error(err);
      setImportStatus({
        success: false,
        message: 'Ошибка чтения файла: ' + (err as Error).message,
      });
    }
  };

  return <AnimatePresence>{isImportExportOpen && (
    <NativeBackdrop className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <NativePanel
        className={`studio-dialog w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border transition-colors ${
          isLight ? 'bg-white border-black/[0.08]' : 'bg-[var(--surface)] border-white/[0.08]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isLight ? 'bg-[var(--canvas)] border-black/[0.06]' : 'bg-[var(--surface)] border-white/[0.06]'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <h3 className={`text-sm font-semibold ${isLight ? 'text-[var(--ink)]' : 'text-white'}`}>
              {t.importExportTitle}
            </h3>
          </div>
          <button
            onClick={() => setIsImportExportOpen(false)}
            className={`p-1.5 rounded-lg transition ${
              isLight
                ? 'text-zinc-400 hover:text-zinc-800 hover:bg-black/[0.05]'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".xlsx,.xls,.csv,.json"
          className="hidden"
        />

        {/* Body */}
        <div className="p-6 space-y-6 text-xs">
          {/* Section 1: Drag & Drop Import */}
          <div>
            <div
              className={`font-semibold mb-1 flex items-center gap-1.5 ${
                isLight ? 'text-zinc-900' : 'text-zinc-200'
              }`}
            >
              <Upload className="w-4 h-4 text-cyan-500" />
              <span>{t.importFile}</span>
            </div>
            <p className={`text-[11px] mb-3 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {t.importDesc}
            </p>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition ${
                isDragging
                  ? isLight
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                  : isLight
                  ? 'border-black/[0.12] bg-[var(--canvas)] hover:bg-[var(--surface-secondary)] text-zinc-600 hover:border-black/[0.2]'
                  : 'border-white/[0.1] bg-[var(--surface-secondary)] hover:bg-[#1f1f26] text-zinc-400 hover:border-white/[0.2]'
              }`}
            >
              <ArrowDownToLine className="w-7 h-7 text-emerald-500 mb-2" />
              <div className={`font-semibold text-xs ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>
                {t.dragDropText}
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-1">
                {t.supportedFormats}
              </div>
            </div>

            {/* Status notification */}
            {importStatus && (
              <div
                className={`mt-3 p-3 rounded-lg flex items-start gap-2.5 text-xs ${
                  importStatus.success
                    ? isLight
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : isLight
                    ? 'bg-red-50 text-red-900 border border-red-200'
                    : 'bg-red-500/15 text-red-300 border border-red-500/30'
                }`}
              >
                {importStatus.success ? (
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                )}
                <div>
                  <div className="font-semibold">{importStatus.message}</div>
                  {importStatus.details && (
                    <div className="text-[11px] opacity-80 mt-0.5 font-mono">{importStatus.details}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={`h-[1px] ${isLight ? 'bg-black/[0.06]' : 'bg-white/[0.06]'}`} />

          {/* Section 2: One-Click Exports */}
          <div>
            <div
              className={`font-semibold mb-1 flex items-center gap-1.5 ${
                isLight ? 'text-zinc-900' : 'text-zinc-200'
              }`}
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Экспорт отчетов / Export Reports</span>
            </div>
            <p className={`text-[11px] mb-3 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Скачать таблицы в формате Microsoft Excel (.xlsx) или CSV с полным сохранением структуры.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Full 2-sheet Workbook */}
              <button
                onClick={() => exportFullWorkbook(artists, deals, lang)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border transition cursor-pointer ${
                  isLight
                    ? 'bg-[var(--canvas)] hover:bg-[var(--surface-secondary)] text-zinc-800 border-black/[0.06]'
                    : 'bg-[var(--surface-secondary)] hover:bg-[#202028] text-zinc-200 border-white/[0.06]'
                }`}
              >
                <Layers className="w-4 h-4 text-emerald-500" />
                <div className="text-left">
                  <div className={`font-semibold ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
                    Full CRM Workbook (.xlsx)
                  </div>
                  <div className="text-[10px] text-zinc-500">Artists + Deals (2 sheets)</div>
                </div>
              </button>

              {/* Artists Excel */}
              <button
                onClick={() => exportArtistsToExcel(artists, lang)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border transition cursor-pointer ${
                  isLight
                    ? 'bg-[var(--canvas)] hover:bg-[var(--surface-secondary)] text-zinc-800 border-black/[0.06]'
                    : 'bg-[var(--surface-secondary)] hover:bg-[#202028] text-zinc-200 border-white/[0.06]'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <div className="text-left">
                  <div className={`font-semibold ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
                    {t.exportXlsx}
                  </div>
                  <div className="text-[10px] text-zinc-500">{artists.length} artists</div>
                </div>
              </button>

              {/* Deals Excel */}
              <button
                onClick={() => exportDealsToExcel(deals, lang)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border transition cursor-pointer ${
                  isLight
                    ? 'bg-[var(--canvas)] hover:bg-[var(--surface-secondary)] text-zinc-800 border-black/[0.06]'
                    : 'bg-[var(--surface-secondary)] hover:bg-[#202028] text-zinc-200 border-white/[0.06]'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-cyan-500" />
                <div className="text-left">
                  <div className={`font-semibold ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
                    Deals Table (.xlsx)
                  </div>
                  <div className="text-[10px] text-zinc-500">{deals.length} deals</div>
                </div>
              </button>

              {/* Artists CSV */}
              <button
                onClick={() => exportToCSV(artists, 'verse_artists')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border transition cursor-pointer ${
                  isLight
                    ? 'bg-[var(--canvas)] hover:bg-[var(--surface-secondary)] text-zinc-800 border-black/[0.06]'
                    : 'bg-[var(--surface-secondary)] hover:bg-[#202028] text-zinc-200 border-white/[0.06]'
                }`}
              >
                <FileText className="w-4 h-4 text-amber-500" />
                <div className="text-left">
                  <div className={`font-semibold ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
                    {t.exportCsv}
                  </div>
                  <div className="text-[10px] text-zinc-500">Universal CSV format</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3.5 border-t flex justify-end ${
            isLight ? 'bg-[var(--canvas)] border-black/[0.06]' : 'bg-[var(--surface)] border-white/[0.06]'
          }`}
        >
          <button
            onClick={() => setIsImportExportOpen(false)}
            className={`px-4 py-2 text-xs font-medium rounded-lg border transition cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-black/[0.04] text-zinc-800 border-black/[0.08]'
                : 'bg-[#1C1C22] hover:bg-[#25252e] text-zinc-300 border-white/[0.06]'
            }`}
          >
            {t.cancel}
          </button>
        </div>
      </NativePanel>
    </NativeBackdrop>
  )}</AnimatePresence>;
};
