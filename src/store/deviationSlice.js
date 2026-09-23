import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { extractFromFile, extractFromText, chatWithAI, saveDeviation } from '../api';

const toBackend = (f) => ({
  title: f.title, site: f.sitePlant, date_of_occurrence: f.occurrenceDate,
  source: f.source, product: f.productMaterial, batch_no: f.batchNumber,
  description: f.description, impact: f.initialImpact, severity: f.initialSeverity,
});

const fromBackend = {
  title: 'title', site: 'sitePlant', date_of_occurrence: 'occurrenceDate',
  source: 'source', product: 'productMaterial', batch_no: 'batchNumber',
  description: 'description', impact: 'initialImpact', severity: 'initialSeverity',
};

export const runExtract = createAsyncThunk('deviation/extract', async (input, { rejectWithValue }) => {
  try {
    return input.file ? await extractFromFile(input.file) : await extractFromText(input.text);
  } catch (e) { return rejectWithValue(e.message); }
});

export const sendChat = createAsyncThunk('deviation/chat', async (message, { getState, rejectWithValue }) => {
  try {
    return await chatWithAI(message, toBackend(getState().deviation.formData));
  } catch (e) { return rejectWithValue(e.message); }
});

export const saveToServer = createAsyncThunk('deviation/save', async (_, { getState, rejectWithValue }) => {
  const { formData, aiAssistant } = getState().deviation;
  const b = toBackend(formData);
  try {
    return await saveDeviation({
      ...b,
      date_of_occurrence: b.date_of_occurrence || null,
      product: b.product || null,
      batch_no: b.batch_no || null,
      ai_reason: aiAssistant.reason || null,
    });
  } catch (e) { return rejectWithValue(e.message); }
});

const emptyForm = {
  sitePlant: '', occurrenceDate: '', title: '', source: '', productMaterial: '',
  batchNumber: '', description: '', initialImpact: '', initialSeverity: '',
};

const initialState = {
  gxpId: 'New Deviation',
  status: 'Draft In-Progress',
  formData: emptyForm,
  aiAssistant: {
    progress: 0,
    statusText: 'Upload a deviation report, or paste text, to begin.',
    reason: '',
    messages: [
      { id: 1, sender: 'bot', text: 'Upload a deviation report or paste the details, and I will fill in the form for you.' },
    ],
  },
  extracting: false,
  chatting: false,
  saving: false,
  eSignatureModalOpen: false,
  toasts: []
};

const deviationSlice = createSlice({
  name: 'deviation',
  initialState,
  reducers: {
    updateField: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
    },
    resetForm: (state) => {
      state.formData = emptyForm;
      state.aiAssistant.progress = 0;
      state.aiAssistant.reason = '';
      state.status = 'Draft In-Progress';
    },
    saveDraft: (state) => {
      state.status = 'Draft Saved';
    },
    setESignatureModalOpen: (state, action) => {
      state.eSignatureModalOpen = action.payload;
    },
    submitDeviation: (state) => {
      state.status = 'Submitted & Lock Triggered';
      state.eSignatureModalOpen = false;
    },

    addChatMessage: (state, action) => {
      state.aiAssistant.messages.push(action.payload);
    },
    addToast: (state, action) => {
      state.toasts.push({
        id: Date.now(),
        message: action.payload.message,
        type: action.payload.type || 'info'
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(runExtract.pending, (state) => {
        state.extracting = true;
        state.aiAssistant.progress = 20;
        state.aiAssistant.statusText = 'Analyzing document content and extracting key details... Please wait, this may take a few moments.';
      })
      .addCase(runExtract.fulfilled, (state, { payload }) => {
        const { form, assessment } = payload;
        state.extracting = false;
        state.formData = {
          title: form.title ?? '',
          sitePlant: form.site ?? '',
          occurrenceDate: form.date_of_occurrence ?? '',
          source: form.source ?? '',
          productMaterial: form.product ?? '',
          batchNumber: form.batch_no ?? '',
          description: form.description ?? '',
          initialImpact: assessment.impact,
          initialSeverity: assessment.severity,
        };
        state.aiAssistant.reason = assessment.reason;
        state.aiAssistant.progress = 100;
        state.aiAssistant.statusText = 'Extraction complete. Please review the fields before saving.';
        state.aiAssistant.messages.push({
          id: Date.now(), sender: 'bot',
          text: `I've filled the form. Suggested severity: ${assessment.severity}. ${assessment.reason}`,
        });
      })
      .addCase(runExtract.rejected, (state, { payload }) => {
        state.extracting = false;
        state.aiAssistant.progress = 0;
        state.aiAssistant.statusText = payload || 'Extraction failed. Please try again.';
      })

      .addCase(sendChat.pending, (state) => { state.chatting = true; })
      .addCase(sendChat.fulfilled, (state, { payload }) => {
        state.chatting = false;
        for (const [k, v] of Object.entries(payload.updates || {})) {
          if (fromBackend[k]) state.formData[fromBackend[k]] = v;
        }
        state.aiAssistant.messages.push({ id: Date.now(), sender: 'bot', text: payload.reply });
      })
      .addCase(sendChat.rejected, (state, { payload }) => {
        state.chatting = false;
        state.aiAssistant.messages.push({ id: Date.now(), sender: 'bot', text: payload || 'Sorry, something went wrong.' });
      })

      .addCase(saveToServer.pending, (state) => { state.saving = true; })
      .addCase(saveToServer.fulfilled, (state, { payload }) => {
        state.saving = false;
        state.status = 'Draft Saved';
        state.gxpId = payload.deviation_no;
      })
      .addCase(saveToServer.rejected, (state) => { state.saving = false; });
  },
});

export const {
  updateField,
  resetForm,
  saveDraft,
  setESignatureModalOpen,
  submitDeviation,
  addChatMessage,
  addToast,
  removeToast
} = deviationSlice.actions;

export default deviationSlice.reducer;
