import React, { useState } from 'react';
import { FileText, Wand2, Save } from 'lucide-react';
import Button from '../ui/Button';
import { saveJob } from '../../api/jobs.api';

const INITIAL = { company: '', title: '', jdText: '' };

const JDForm = ({ onSaved }) => {
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleClean = () => {
    // Simple cleanup: collapse extra whitespace, remove HTML tags if any
    const cleaned = form.jdText
      .replace(/<[^>]+>/g, '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    setForm((f) => ({ ...f, jdText: cleaned }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.company.trim() || !form.jdText.trim()) {
      setError('Company, job title, and job description are required.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const result = await saveJob({
        title: form.title,
        company: form.company,
        jdText: form.jdText,
      });
      setForm(INITIAL);
      onSaved?.(result);
    } catch (err) {
      setError(err?.message ?? 'Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full h-10 px-3 text-sm rounded-lg bg-base border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors';

  return (
    <div className="p-5 border bg-surface border-border rounded-xl">
      <h3 className="flex items-center gap-2 mb-5 text-sm font-semibold text-text-primary">
        <FileText size={15} className="text-accent" />
        Add New Job Profile
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-2xs font-mono uppercase tracking-widest text-text-muted mb-1.5">
            Company Name
          </label>
          <input
            type="text"
            placeholder="e.g. Acme Corp"
            value={form.company}
            onChange={set('company')}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-2xs font-mono uppercase tracking-widest text-text-muted mb-1.5">
            Job Title
          </label>
          <input
            type="text"
            placeholder="e.g. Senior Backend Engineer"
            value={form.title}
            onChange={set('title')}
            className={inputCls}
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-mono tracking-widest uppercase text-2xs text-text-muted">
            Job Description Body
          </label>
          <button
            onClick={handleClean}
            className="flex items-center gap-1 transition-colors text-2xs text-text-secondary hover:text-accent"
          >
            <Wand2 size={11} />
            Clean Formatting
          </button>
        </div>
        <textarea
          placeholder="Paste the full job description here..."
          value={form.jdText}
          onChange={set('jdText')}
          rows={14}
          className="w-full px-3 py-3 text-sm leading-relaxed transition-colors border rounded-lg resize-none bg-base border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
      </div>

      {error && (
        <p className="mb-3 text-xs text-red-400">{error}</p>
      )}

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
        <button
          onClick={() => setForm(INITIAL)}
          className="text-sm transition-colors text-text-muted hover:text-text-secondary"
        >
          Clear Form
        </button>
        <Button
          variant="primary"
          loading={saving}
          icon={<Save size={13} />}
          onClick={handleSave}
        >
          Save Job Profile
        </Button>
      </div>
    </div>
  );
};

export default JDForm;
