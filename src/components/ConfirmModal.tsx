"use client";

import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-[4px] transition-opacity" 
        onClick={onCancel}
      />
      
      <div className="relative w-full max-w-sm bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl shadow-2xl animate-slide-down p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--danger-bg)] border border-[var(--danger-border)] flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-[var(--danger-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">{title}</h3>
          <p className="text-sm text-[var(--text-muted)] mb-8">{message}</p>
          
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-semibold text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-[var(--danger-border)] text-[var(--text-main)] text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
