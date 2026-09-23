import React from 'react';
import { useSelector } from 'react-redux';
import { Header, Footer, ToastContainer } from './components/Navigation';
import { DeviationForm } from './components/DeviationForm';
import { AiAssistant } from './components/AiAssistant';
import { ESignatureModal } from './components/ESignatureModal';

export function App() {
  const gxpId = useSelector((state) => state.deviation.gxpId);

  return (
    <>
      <ToastContainer />
      <Header />
      <main class="w-full pt-16 bg-background min-h-screen">
        <div class="max-w-7xl mx-auto px-margin-desktop py-space-xl">
          <div class="flex flex-col w-full">
            {/* Top Context & Navigation Breadcrumbs */}
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-xl">
              <div class="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
                <span class="hover:text-primary cursor-pointer transition-colors">Quality Assurance</span>
                <span class="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
                <span class="hover:text-primary cursor-pointer transition-colors">Deviations</span>
                <span class="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
                <span class="text-on-surface font-semibold">Log Deviation (Form 483-B)</span>
              </div>
              <div class="flex items-center gap-space-sm">
                <span class="font-code-md text-code-md px-space-sm py-space-xs rounded bg-surface-container-high text-on-surface-variant font-medium">
                  GxP ID: {gxpId}
                </span>
                <span class="text-label-sm font-label-sm uppercase px-2 py-0.5 rounded bg-surface-container-highest text-primary font-bold">
                  Part 11 Compliant
                </span>
              </div>
            </div>

            {/* Grid Workspace */}
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
              <DeviationForm />
              <AiAssistant />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ESignatureModal />
    </>
  );
}

export default App;
