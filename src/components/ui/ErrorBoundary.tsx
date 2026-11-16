import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { captureException } from '@/lib/sentry';
import { RefreshCw, AlertCircle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    captureException(error, { componentStack: errorInfo.componentStack });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[70vh] flex items-center justify-center bg-[#FAFBFD] px-6 py-20 text-[#0C2D48] font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#0C2D48]/12 p-8 shadow-[0_20px_50px_rgba(12,45,72,0.06)] text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 stroke-[2]" />
            </div>

            <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#0C2D48]/5 text-[#0C2D48]/70 font-mono text-[11px] font-semibold uppercase tracking-wider mb-2">
              SESSION RECOVERY
            </div>

            <h2 className="text-xl font-heading font-semibold text-[#0C2D48] tracking-tight mb-2">
              Temporary Advisory Disruption
            </h2>

            <p className="text-xs text-[#0C2D48]/70 leading-relaxed mb-6">
              Our monitoring systems have logged this event. You may refresh the current interface
              or return to the main portal.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#0C2D48] hover:bg-[#0C2D48]/90 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#22C55E]" />
                Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="py-2.5 px-4 rounded-xl bg-white border border-[#0C2D48]/15 hover:border-[#0C2D48]/30 text-[#0C2D48] font-medium text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Home className="w-3.5 h-3.5 text-[#0C2D48]/60" />
                Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
