import React from 'react';
import { Check, Layers, X } from 'lucide-react';
import { UI_REFERENCES, UIReferenceId } from '../data/palmStages';

interface UIReferenceDrawerProps {
  open: boolean;
  activeRefId: UIReferenceId;
  onSelectRef: (id: UIReferenceId) => void;
  onClose: () => void;
}

export const UIReferenceDrawer: React.FC<UIReferenceDrawerProps> = ({
  open,
  activeRefId,
  onSelectRef,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: 'rgba(10, 14, 12, 0.72)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Panduan 4 Referensi UI Modern"
    >
      <div className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-2xl border border-stone-200 bg-[#FAFAF8] text-stone-900 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-stone-200 bg-[#FAFAF8] px-6 py-4">
          <div className="min-w-0">
            <h2
              className="text-xl font-semibold tracking-tight text-stone-900"
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            >
              4 Referensi Desain UI Modern untuk Website Sawit Interaktif
            </h2>
            <p className="mt-0.5 text-xs text-stone-500">
              Pilih salah satu gaya untuk mencobanya langsung di atas kanvas 3D, atau pelajari token desain dan pola UX-nya.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
            aria-label="Tutup panduan referensi UI"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Architectural Principles Banner */}
        <div className="border-b border-stone-200 bg-stone-100/70 px-6 py-4">
          <div className="flex items-start gap-3">
            <Layers className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" />
            <div className="text-xs leading-relaxed text-stone-700">
              <span className="font-semibold text-stone-900">Prinsip Utama UI 3D Modern: </span>
              Hindari panel kiri/kanan yang menutupi batang dan tajuk sawit. Gunakan kanvas 3D penuh layar,{' '}
              <span className="font-medium text-stone-900">collapsible bottom dock</span> untuk pengatur siklus umur,
              angka <span className="font-mono">tabular-nums</span> agar metrik tidak bergeser, dan inspeksi organ langsung lewat klik pada model 3D.
            </div>
          </div>
        </div>

        {/* 4 Reference Cards */}
        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
          {UI_REFERENCES.map((spec) => {
            const isActive = spec.id === activeRefId;
            return (
              <section
                key={spec.id}
                className={`flex flex-col justify-between rounded-xl border p-5 transition-colors ${
                  isActive
                    ? 'border-emerald-700 bg-white shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div>
                  {/* Index + Aesthetic Line (no pill sandwich) */}
                  <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
                    <span className="font-mono font-medium text-stone-700">
                      Referensi {spec.code} · {spec.aesthetic}
                    </span>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-800">
                        <Check className="h-3.5 w-3.5" />
                        Aktif
                      </span>
                    )}
                  </div>

                  <h3
                    className="mt-2 text-lg font-semibold text-stone-900"
                    style={{ fontFamily: spec.displayFont }}
                  >
                    {spec.name}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{spec.tagline}</p>

                  {/* Palette Swatches */}
                  <div className="mt-4">
                    <div className="text-[11px] font-medium text-stone-500">Palet Warna 60-30-10</div>
                    <div className="mt-1.5 grid grid-cols-4 gap-2">
                      {spec.palette.map((c) => (
                        <div key={c.hex} className="space-y-1">
                          <div
                            className="h-6 w-full rounded-md border border-stone-200"
                            style={{ backgroundColor: c.hex }}
                          />
                          <div className="truncate text-[10px] font-mono text-stone-600">{c.hex}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Typography & Best For */}
                  <div className="mt-4 space-y-1.5 border-t border-stone-100 pt-3 text-xs text-stone-600">
                    <div>
                      <span className="font-medium text-stone-800">Tipografi: </span>
                      <span>
                        {spec.displayFont.split(',')[0].replace(/"/g, '')} +{' '}
                        {spec.bodyFont.split(',')[0].replace(/"/g, '')} +{' '}
                        {spec.monoFont.split(',')[0].replace(/"/g, '')}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-stone-800">Cocok untuk: </span>
                      <span>{spec.bestFor}</span>
                    </div>
                    <div>
                      <span className="font-medium text-stone-800">Pola Interaksi: </span>
                      <span>{spec.interactionPattern}</span>
                    </div>
                  </div>

                  {/* Key Notes */}
                  <ul className="mt-3 space-y-1 border-t border-stone-100 pt-3 text-xs leading-relaxed text-stone-600">
                    {spec.layoutNotes.map((note, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="font-mono text-stone-400">–</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectRef(spec.id);
                      onClose();
                    }}
                    className={`w-full rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-emerald-700 ${
                      isActive
                        ? 'bg-emerald-800 text-white'
                        : 'border border-stone-300 bg-stone-50 text-stone-900 hover:bg-stone-900 hover:text-white'
                    }`}
                  >
                    {isActive ? 'Sedang Digunakan di Kanvas 3D' : `Terapkan ${spec.name}`}
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};
