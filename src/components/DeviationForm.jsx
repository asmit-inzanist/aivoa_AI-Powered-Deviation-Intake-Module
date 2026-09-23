import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  updateField,
  resetForm,
  saveDraft,
  setESignatureModalOpen,
  saveToServer,
  addToast
} from '../store/deviationSlice';

export const DeviationForm = () => {
  const dispatch = useDispatch();
  const { formData, status } = useSelector((state) => state.deviation);

  const handleChange = (field, value) => {
    dispatch(updateField({ field, value }));
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset this deviation draft? All unsaved inputs will be cleared.')) {
      dispatch(resetForm());
      dispatch(addToast({ message: 'Deviation form has been reset.', type: 'info' }));
    }
  };

  const handleSaveDraft = () => {
    dispatch(saveDraft());
    dispatch(addToast({ message: 'Draft saved successfully to local GxP store.', type: 'info' }));
  };

  const handleSave = async () => {
    const f = formData;
    if (!f.sitePlant || !f.title || !f.source || !f.description || !f.initialImpact || !f.initialSeverity) {
      dispatch(addToast({ message: 'Please fill or extract all required fields first.', type: 'error' }));
      return;
    }
    const res = await dispatch(saveToServer());
    if (saveToServer.fulfilled.match(res)) {
      dispatch(addToast({ message: `Saved as ${res.payload.deviation_no}`, type: 'success' }));
    } else {
      dispatch(addToast({ message: res.payload || 'Save failed', type: 'error' }));
    }
  };

  return (
    <div class="lg:col-span-7 xl:col-span-8 flex flex-col">
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/40 p-6 md:p-8">
        {/* Header Row */}
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-space-md pb-space-lg border-b border-outline-variant/30">
          <div>
            <div class="flex items-center gap-space-sm">
              <h1 class="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Log Deviation</h1>
              <span class="text-label-sm font-label-sm uppercase px-space-xs py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant">Standard GxP</span>
            </div>
            <p class="font-body-md text-body-md text-on-surface-variant mt-1">
              Record any unexpected event, out-of-specification result, or quality non-conformance.
            </p>
          </div>
          <div class="flex items-center self-start">
            {status === 'Submitted & Lock Triggered' ? (
              <span class="bg-emerald-50 text-emerald-800 border border-emerald-300 font-label-sm text-label-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                Submitted & Lock Triggered
              </span>
            ) : status === 'Draft Saved' ? (
              <span class="bg-amber-50 text-amber-800 border border-amber-300 font-label-sm text-label-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                Draft Saved
              </span>
            ) : (
              <span class="bg-amber-50 text-amber-800 border border-amber-300 font-label-sm text-label-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Draft In-Progress
              </span>
            )}
          </div>
        </div>

        <form class="mt-space-lg flex flex-col" onSubmit={(e) => e.preventDefault()}>
          {/* SECTION 1: DEVIATION INFORMATION */}
          <div class="flex items-center justify-between pb-space-xs mb-space-md border-b border-outline-variant/40">
            <span class="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant tracking-wider flex items-center gap-1.5">
              <span class="w-1.5 h-3.5 bg-primary rounded-xs"></span>
              1. DEVIATION INFORMATION
            </span>
            <span class="font-label-sm text-label-sm text-outline">Mandatory Fields *</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-space-lg gap-y-space-md">
            {/* Site / Plant */}
            <div class="flex flex-col gap-1.5">
              <label class="font-label-md text-label-md font-medium text-on-surface" htmlFor="site-plant">Site / Plant <span class="text-error">*</span></label>
              <input
                id="site-plant"
                type="text"
                placeholder="e.g. API Manufacturing Unit 04"
                value={formData.sitePlant}
                onChange={(e) => handleChange('sitePlant', e.target.value)}
                class="w-full h-9 px-3.5 rounded-lg bg-surface-container-lowest border border-outline-variant/70 text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            {/* Date of Occurrence */}
            <div class="flex flex-col gap-1.5">
              <label class="font-label-md text-label-md font-medium text-on-surface" htmlFor="occurrence-date">Date of Occurrence <span class="text-error">*</span></label>
              <div class="relative">
                <input
                  id="occurrence-date"
                  type="date"
                  value={formData.occurrenceDate}
                  onChange={(e) => handleChange('occurrenceDate', e.target.value)}
                  class="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/70 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* Title */}
            <div class="md:col-span-2 flex flex-col gap-1.5">
              <label class="font-label-md text-label-md font-medium text-on-surface" htmlFor="dev-title">Title / Short Description <span class="text-error">*</span></label>
              <input
                id="dev-title"
                type="text"
                placeholder="e.g. OOS result for Assay in Batch ABC-001"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                class="w-full h-9 px-3.5 rounded-lg bg-surface-container-lowest border border-outline-variant/70 text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            {/* Source */}
            <div class="flex flex-col gap-1.5">
              <label class="font-label-md text-label-md font-medium text-on-surface" htmlFor="source">Source <span class="text-error">*</span></label>
              <div class="relative">
                <select
                  id="source"
                  value={formData.source}
                  onChange={(e) => handleChange('source', e.target.value)}
                  class="w-full h-9 pl-3 pr-8 rounded-lg bg-surface-container-lowest border border-outline-variant/70 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select deviation source</option>
                  <option>Quality Control (Analytical)</option>
                  <option>Production (In-Process)</option>
                  <option>Warehouse &amp; Logistics</option>
                  <option>Packaging Operations</option>
                  <option>Engineering / Facilities</option>
                </select>
                <span class="material-symbols-outlined text-outline absolute right-2.5 top-2 pointer-events-none text-[18px]">expand_more</span>
              </div>
            </div>

            {/* Product / Material */}
            <div class="flex flex-col gap-1.5">
              <label class="font-label-md text-label-md font-medium text-on-surface" htmlFor="product-material">Related Product / Material</label>
              <div class="relative">
                <span class="material-symbols-outlined text-outline absolute left-3 top-2 text-[18px]">search</span>
                <input
                  id="product-material"
                  type="text"
                  placeholder="Search product or material..."
                  value={formData.productMaterial}
                  onChange={(e) => handleChange('productMaterial', e.target.value)}
                  class="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-lowest border border-outline-variant/70 text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Batch Number */}
            <div class="md:col-span-2 flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <label class="font-label-md text-label-md font-medium text-on-surface" htmlFor="batch-number">Batch / Lot Number</label>
                <span class="font-body-sm text-body-sm text-outline">Verified against ERP Inventory</span>
              </div>
              <div class="relative">
                <input
                  id="batch-number"
                  type="text"
                  placeholder="Enter batch / lot no."
                  value={formData.batchNumber}
                  onChange={(e) => handleChange('batchNumber', e.target.value.toUpperCase())}
                  class="w-full h-9 px-3.5 rounded-lg bg-surface-container-lowest border border-outline-variant/70 text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary uppercase"
                />
                <span class="material-symbols-outlined text-secondary absolute right-2.5 top-2 text-[18px]">check_circle</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: DEVIATION DETAILS */}
          <div class="flex items-center justify-between pb-space-xs mb-space-md border-b border-outline-variant/40 mt-space-xl">
            <span class="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant tracking-wider flex items-center gap-1.5">
              <span class="w-1.5 h-3.5 bg-primary rounded-xs"></span>
              2. DEVIATION DETAILS
            </span>
            <span class="font-label-sm text-label-sm text-outline">Clinical Precision Context</span>
          </div>

          <div class="flex flex-col gap-space-md">
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <label class="font-label-md text-label-md font-medium text-on-surface" htmlFor="description-field">Detailed Description <span class="text-error">*</span></label>
              </div>
              <textarea
                id="description-field"
                rows="5"
                placeholder="Describe what happened, where, when and how it was detected..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                class="w-full p-3.5 rounded-lg bg-surface-container-lowest border border-outline-variant/70 text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[140px] leading-relaxed"
                required
              />
              <div class="flex items-center justify-between text-body-sm font-body-sm text-outline mt-0.5">
                <span class="flex items-center gap-1 text-[11px]">
                  <span class="material-symbols-outlined text-[13px] text-secondary">verified_user</span> 
                  21 CFR Part 11 Audit Trail Active
                </span>
                <span class="font-code-md text-code-md text-on-surface-variant">
                  {formData.description.length} / 2000
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
              {/* Initial Impact */}
              <div class="flex flex-col gap-1.5">
                <label class="font-label-md text-label-md font-medium text-on-surface" htmlFor="initial-impact">Initial Impact <span class="text-error">*</span></label>
                <div class="relative">
                  <select
                    id="initial-impact"
                    value={formData.initialImpact}
                    onChange={(e) => handleChange('initialImpact', e.target.value)}
                    class="w-full h-9 pl-3 pr-8 rounded-lg bg-surface-container-lowest border border-outline-variant/70 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select initial impact</option>
                    <option>Product Quality &amp; Identity</option>
                    <option>Patient Safety Direct Risk</option>
                    <option>Regulatory / Statutory Breach</option>
                    <option>Operational Process Only</option>
                  </select>
                  <span class="material-symbols-outlined text-outline absolute right-2.5 top-2 pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>

              {/* Initial Severity */}
              <div class="flex flex-col gap-1.5">
                <label class="font-label-md text-label-md font-medium text-on-surface" htmlFor="initial-severity">Initial Severity <span class="text-error">*</span></label>
                <div class="relative">
                  <select
                    id="initial-severity"
                    value={formData.initialSeverity}
                    onChange={(e) => handleChange('initialSeverity', e.target.value)}
                    class="w-full h-9 pl-3 pr-8 rounded-lg bg-surface-container-lowest border border-outline-variant/70 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select initial severity</option>
                    <option>Critical (Batch Rejection Likely)</option>
                    <option>Major (Requires Formal CAPA)</option>
                    <option>Minor (Immediate Remediation)</option>
                  </select>
                  <span class="material-symbols-outlined text-outline absolute right-2.5 top-2 pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Row */}
          <div class="pt-space-lg mt-space-xl border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-space-md">
            <button
              type="button"
              onClick={handleReset}
              class="w-full sm:w-auto h-9 px-4 rounded-lg bg-surface-container-lowest border border-outline-variant/80 text-on-surface hover:bg-surface-container-low font-label-lg text-label-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <span class="material-symbols-outlined text-[18px] text-outline">history</span>
              Reset Form
            </button>
            <div class="flex items-center gap-space-sm w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSaveDraft}
                class="w-full sm:w-auto h-9 px-4 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-variant font-label-lg text-label-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span class="material-symbols-outlined text-[18px]">save_as</span>
                Save as Draft
              </button>
              <button
                type="button"
                onClick={handleSave}
                class="w-full sm:w-auto h-9 px-5 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-primary transition-all cursor-pointer"
              >
                <span class="material-symbols-outlined text-[18px]">save</span>
                Save Deviation
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Quick Context Cards */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-space-md mt-space-md">
        <div class="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex items-center gap-3 shadow-2xs">
          <div class="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
            <span class="material-symbols-outlined text-[18px]">timer</span>
          </div>
          <div class="flex flex-col">
            <span class="font-label-sm text-label-sm uppercase text-outline">Reporting SLA</span>
            <span class="font-label-md text-label-md font-semibold text-on-surface">Within 24 Hours (GxP)</span>
          </div>
        </div>
        <div class="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex items-center gap-3 shadow-2xs">
          <div class="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
            <span class="material-symbols-outlined text-[18px]">lock</span>
          </div>
          <div class="flex flex-col">
            <span class="font-label-sm text-label-sm uppercase text-outline">Batch Lock State</span>
            <span class="font-label-md text-label-md font-semibold text-secondary">Quarantine Triggered</span>
          </div>
        </div>
        <div class="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex items-center gap-3 shadow-2xs">
          <div class="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary">
            <span class="material-symbols-outlined text-[18px]">group</span>
          </div>
          <div class="flex flex-col">
            <span class="font-label-sm text-label-sm uppercase text-outline">Lead Reviewer</span>
            <span class="font-label-md text-label-md font-semibold text-on-surface">QA Dept Lead #4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
