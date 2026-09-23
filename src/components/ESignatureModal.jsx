import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setESignatureModalOpen, submitDeviation, addToast } from '../store/deviationSlice';

export const ESignatureModal = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.deviation.eSignatureModalOpen);
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('Authorship / Initial Reporting');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!password) {
      alert('Please enter your GxP authorization password.');
      return;
    }
    dispatch(submitDeviation());
    dispatch(addToast({ message: 'Deviation logged & 21 CFR Part 11 signature verified!', type: 'success' }));
    setPassword('');
  };

  return (
    <div class="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant max-w-md w-full p-6 flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
        <div class="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <div class="flex items-center gap-2 text-primary">
            <span class="material-symbols-outlined text-[22px]">verified</span>
            <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">21 CFR Part 11 E-Signature</h3>
          </div>
          <button onClick={() => dispatch(setESignatureModalOpen(false))} class="text-outline hover:text-on-surface">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <p class="text-body-sm text-on-surface-variant">
          This legal digital sign-off will record an immutable entry in the system audit trail. Please enter your GxP authorization password to proceed.
        </p>

        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-label-md font-medium text-on-surface">User ID / License</label>
            <input type="text" value="SK-09 (Quality Control Analyst)" disabled class="h-9 px-3 rounded-lg bg-surface-container-low border border-outline-variant/50 text-body-sm text-on-surface-variant font-medium"/>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-label-md font-medium text-on-surface" htmlFor="esign-reason">Reason for Signature</label>
            <select
              id="esign-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              class="h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/70 text-body-sm text-on-surface"
            >
              <option>Authorship / Initial Reporting</option>
              <option>Technical Review</option>
              <option>QA Authorization</option>
            </select>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-label-md font-medium text-on-surface" htmlFor="esign-password">GxP Authorization Password <span class="text-error">*</span></label>
            <input
              type="password"
              id="esign-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              class="h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/70 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={() => dispatch(setESignatureModalOpen(false))}
            class="h-9 px-4 rounded-lg bg-surface-container-high text-on-surface font-label-lg text-label-lg hover:bg-surface-variant"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            class="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold hover:bg-primary/90"
          >
            Sign &amp; Submit
          </button>
        </div>
      </div>
    </div>
  );
};
