import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../store/deviationSlice';

export const Header = () => {
  return (
    <header class="fixed top-0 w-full z-40 bg-surface-container-lowest border-b border-outline-variant/40">
      <div class="h-16 max-w-7xl mx-auto px-margin-desktop flex items-center justify-between gap-space-lg">
        <div class="flex items-center gap-space-xl">
          <a class="flex items-center gap-space-sm cursor-pointer select-none" href="#">
            <div class="w-8 h-8 rounded bg-primary flex items-center justify-center shadow-sm">
              <span class="material-symbols-outlined text-on-primary text-[20px]">verified</span>
            </div>
            <span class="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">AIVOA</span>
          </a>
          <nav class="hidden lg:flex items-center gap-space-xs">
            <a class="px-space-md py-space-xs rounded-lg text-on-surface-variant font-label-lg text-label-lg transition-colors hover:text-on-surface hover:bg-surface-container-low" href="#">QMS</a>
            <a class="px-space-md py-space-xs rounded-lg text-on-surface-variant font-label-lg text-label-lg transition-colors hover:text-on-surface hover:bg-surface-container-low" href="#">Dashboard</a>
            <a aria-current="page" class="px-space-md py-space-xs transition-colors bg-surface-container-low text-primary font-label-lg rounded-lg" href="#">Deviations</a>
            <a class="px-space-md py-space-xs rounded-lg text-on-surface-variant font-label-lg text-label-lg transition-colors hover:text-on-surface hover:bg-surface-container-low" href="#">CAPAs</a>
            <a class="px-space-md py-space-xs rounded-lg text-on-surface-variant font-label-lg text-label-lg transition-colors hover:text-on-surface hover:bg-surface-container-low" href="#">Change Control</a>
            <a class="px-space-md py-space-xs rounded-lg text-on-surface-variant font-label-lg text-label-lg transition-colors hover:text-on-surface hover:bg-surface-container-low" href="#">Audits</a>
            <a class="px-space-md py-space-xs rounded-lg text-on-surface-variant font-label-lg text-label-lg transition-colors hover:text-on-surface hover:bg-surface-container-low" href="#">Documents</a>
            <a class="px-space-md py-space-xs rounded-lg text-on-surface-variant font-label-lg text-label-lg transition-colors hover:text-on-surface hover:bg-surface-container-low" href="#">Reports</a>
          </nav>
        </div>
        <div class="flex items-center gap-space-md">
          <div class="hidden md:flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container-low border border-outline-variant/30 cursor-pointer hover:bg-surface-container transition-colors">
            <span class="material-symbols-outlined text-outline text-[18px]">corporate_fare</span>
            <span class="font-label-md text-label-md text-on-surface font-semibold max-w-[190px] truncate">Vasudha Pharma Chem Limited</span>
            <span class="material-symbols-outlined text-outline text-[16px]">expand_more</span>
          </div>
          <button aria-label="Notifications" class="relative p-space-sm rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors flex items-center justify-center" type="button">
            <span class="material-symbols-outlined text-[20px]">notifications</span>
            <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest"></span>
          </button>
          <div class="flex items-center gap-space-sm pl-space-xs cursor-pointer">
            <div class="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary font-label-md text-label-md font-bold select-none">SK</div>
            <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span class="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export const Footer = () => {
  return (
    <footer class="w-full bg-surface-container-lowest border-t border-outline-variant/30 py-space-lg mt-12">
      <div class="max-w-7xl mx-auto px-margin-desktop flex flex-col sm:flex-row items-center justify-between gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
        <div>© 2025 AIVOA Quality Systems. Enterprise GxP 21 CFR Part 11 Validated Platform.</div>
        <div class="flex items-center gap-space-lg">
          <span class="flex items-center gap-space-xs"><span class="w-2 h-2 rounded-full bg-secondary"></span>System Operational</span>
          <span>Build v4.12.0-pharma</span>
        </div>
      </div>
    </footer>
  );
};

export const ToastContainer = () => {
  const toasts = useSelector((state) => state.deviation.toasts);
  const dispatch = useDispatch();

  return (
    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => dispatch(removeToast(toast.id))}
          class={`${
            toast.type === 'success' ? 'bg-secondary text-on-secondary' : 'bg-primary text-on-primary'
          } px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-body-sm font-medium transition-all duration-300 cursor-pointer`}
        >
          <span class="material-symbols-outlined text-[18px]">
            {toast.type === 'success' ? 'check_circle' : 'info'}
          </span>
          {toast.message}
        </div>
      ))}
    </div>
  );
};
