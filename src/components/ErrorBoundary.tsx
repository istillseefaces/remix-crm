import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleClearAllAndReload = () => {
    try {
      localStorage.removeItem('verse_crm_artists');
      localStorage.removeItem('verse_crm_deals');
      localStorage.removeItem('verse_crm_custom_options');
      localStorage.removeItem('verse_crm_theme');
      localStorage.removeItem('verse_crm_lang');
      localStorage.removeItem('verse_crm_currency');
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[200px] p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-center space-y-4 my-4 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-base text-red-400">
              {this.props.fallbackTitle || 'Произошла непредвиденная ошибка'}
            </h4>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              {this.props.fallbackMessage ||
                'Интерфейс обнаружил ошибку при отображении данных. Вы можете попробовать перезагрузить или сбросить локальные данные.'}
            </p>
            {this.state.error && (
              <div className="mt-2 p-2 rounded bg-black/40 text-[11px] font-mono text-red-300/80 max-w-md mx-auto overflow-x-auto text-left">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 justify-center flex-wrap">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Повторить попытку</span>
            </button>
            <button
              type="button"
              onClick={this.handleClearAllAndReload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/10 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Очистить кэш и перезагрузить</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

