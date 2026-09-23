import React, { useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { runExtract, sendChat, saveToServer, addChatMessage, addToast } from '../store/deviationSlice';

export const AiAssistant = () => {
  const dispatch = useDispatch();
  const { progress, statusText, messages } = useSelector((state) => state.deviation.aiAssistant);
  const extracting = useSelector((state) => state.deviation.extracting);
  const [inputVal, setInputVal] = useState('');
  const fileRef = useRef(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const extract = async (input) => {
    const res = await dispatch(runExtract(input));
    if (runExtract.fulfilled.match(res)) {
      dispatch(addToast({ message: 'Form populated. Please review the fields.', type: 'success' }));
    } else {
      dispatch(addToast({ message: res.payload || 'Extraction failed', type: 'error' }));
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      dispatch(addToast({ message: 'File is larger than 10MB', type: 'error' }));
      return;
    }
    extract({ file });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const userText = inputVal.trim();
    setInputVal('');
    dispatch(addChatMessage({ id: Date.now(), sender: 'user', text: userText }));
    dispatch(sendChat(userText));
  };

  return (
    <div class="lg:col-span-5 xl:col-span-4 flex flex-col gap-space-md">
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/40 p-6 flex flex-col relative overflow-hidden">
        {/* Header Row */}
        <div class="flex items-center justify-between pb-space-sm border-b border-outline-variant/30">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary">
              <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
            </div>
            <h2 class="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">AI Deviation Assistant</h2>
          </div>
          <span class="bg-tertiary-fixed text-tertiary font-label-sm text-label-sm font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-tertiary/20">
            BETA
          </span>
        </div>

        {/* Upload Dropzone */}
        <div
          onClick={() => fileRef.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          class="mt-space-md border-2 border-dashed border-primary/30 bg-surface-container-low hover:bg-surface-container rounded-xl p-5 text-center flex flex-col items-center justify-center transition-all cursor-pointer group"
        >
          <div class="w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant/40 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <span class="material-symbols-outlined text-primary text-[22px]">upload_file</span>
          </div>
          <span class="font-label-md text-label-md font-semibold text-on-surface mt-2">Drag &amp; drop supporting document here</span>
          <span class="font-label-sm text-label-sm text-primary hover:underline mt-0.5">or click to browse from system</span>
          <input
            ref={fileRef} type="file" accept=".pdf,.docx,.txt" hidden
            onChange={(e) => { handleFile(e.target.files[0]); e.target.value = ''; }}
          />
        </div>

        {/* OR Divider */}
        <div class="my-3 relative flex items-center justify-center text-label-sm font-label-sm text-outline uppercase tracking-wider before:border-t before:border-outline-variant/40 before:flex-grow after:border-t after:border-outline-variant/40 after:flex-grow before:mr-3 after:ml-3">
          OR
        </div>

        {/* Paste Tile */}
        <button
          type="button"
          onClick={() => setPasteOpen(!pasteOpen)}
          class="w-full border border-outline-variant/50 rounded-lg p-2.5 bg-surface-container-low hover:bg-surface-container flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant transition-colors cursor-pointer text-left"
        >
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-outline text-[18px]">content_paste</span>
            <span class="font-label-md text-label-md text-on-surface">Paste deviation details / lab notes</span>
          </div>
          <span class="material-symbols-outlined text-outline text-[16px]">chevron_right</span>
        </button>

        {pasteOpen && (
          <div class="mt-2">
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={5}
              placeholder="Paste the deviation email or notes here..."
              class="w-full border border-outline-variant/70 rounded-lg p-2 text-body-sm font-body-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              disabled={!pasteText.trim() || extracting}
              onClick={() => { extract({ text: pasteText }); setPasteOpen(false); setPasteText(''); }}
              class="mt-1 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-label-sm font-label-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Extract with AI
            </button>
          </div>
        )}
        {/* Compliance Banner */}
        <div class="bg-secondary-container/20 border border-secondary-container text-on-secondary-fixed-variant rounded-lg p-3 my-3 flex items-start gap-2.5 text-body-sm font-body-sm leading-snug">
          <span class="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">check_circle</span>
          <div>
            <span class="font-semibold">Validated Parsers:</span> PDF, DOCX, TXT, XLS, JPG, PNG — Max individual size: 10MB (GxP Encrypted).
          </div>
        </div>

        {/* Progress Bar */}
        <div class="flex flex-col gap-1.5 mt-1">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">EXTRACTION PROGRESS</span>
            <span class="font-code-md text-code-md font-bold text-primary">{progress}%</span>
          </div>
          <div class="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
            <div class="bg-primary h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
          <p class="font-body-sm text-body-sm text-outline leading-tight mt-1">
            {statusText}
          </p>
        </div>

        {/* AI Dialogue */}
        <div class="mt-space-md pt-space-sm border-t border-outline-variant/30 flex flex-col">
          <span class="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">AI ASSISTANT</span>
          <div class="flex flex-col gap-space-sm max-h-[180px] overflow-y-auto pr-1">
            {messages.map((msg) =>
              msg.sender === 'user' ? (
                <div key={msg.id} class="bg-surface-container-high rounded-2xl rounded-tr-xs p-2.5 text-right font-body-sm text-body-sm text-on-surface self-end max-w-[85%]">
                  {msg.text}
                </div>
              ) : (
                <div key={msg.id} class="bg-surface-container-low border border-outline-variant/40 rounded-2xl rounded-tl-xs p-3 flex items-start gap-2.5">
                  <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 mt-0.5">
                    <span class="material-symbols-outlined text-[14px]">smart_toy</span>
                  </div>
                  <p class="font-body-sm text-body-sm text-on-surface leading-relaxed">
                    {msg.text}
                  </p>
                </div>
              )
            )}
          </div>

          <form onSubmit={handleSendMessage} class="mt-3 flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/70 rounded-full pl-3.5 pr-1.5 py-1 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-2xs">
            <input
              type="text"
              placeholder="Ask me anything about deviations..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              class="bg-transparent font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none flex-grow py-1"
            />
            <button type="submit" class="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xs hover:bg-primary/90 transition-all cursor-pointer">
              <span class="material-symbols-outlined text-[16px]">arrow_upward</span>
            </button>
          </form>
          <span class="font-label-sm text-[10px] text-outline text-center mt-2">
            AI responses may contain errors. Qualified Person (QP) review required under Part 11.
          </span>
        </div>
      </div>

      {/* Regulatory Reference */}
      <div class="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-2xs flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="font-label-sm text-label-sm uppercase font-bold text-on-surface">Standard Operating Procedure</span>
          <span class="font-code-md text-code-md text-primary font-semibold">SOP-QA-042 v3</span>
        </div>
        <p class="font-body-sm text-body-sm text-on-surface-variant leading-snug">
          "All Out-of-Specification (OOS) chromatographic variations must be escalated to the Head of QA within 24 hours of sequence confirmation."
        </p>
        <div class="flex items-center gap-space-sm pt-2 text-label-sm font-label-sm text-outline border-t border-outline-variant/20 mt-1">
          <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">policy</span> Section 4.2.1</span>
          <span>•</span>
          <span>Audited by USFDA (2024)</span>
        </div>
      </div>
    </div>
  );
};
