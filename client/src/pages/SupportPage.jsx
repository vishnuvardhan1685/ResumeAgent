import React, { useState } from 'react';
import { HelpCircle, MessageSquare, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../components/ui/Button';

const FAQS = [
  {
    q: 'What resume formats are supported?',
    a: 'Only PDF format is supported, up to 5 MB. For best extraction accuracy, use ATS-friendly single-column layouts and include a dedicated Skills section.',
  },
  {
    q: 'How is the match score calculated?',
    a: 'The Matcher agent computes a weighted combination of semantic similarity (sentence-transformers embeddings via pgvector cosine similarity), explicit skill overlap, keyword frequency, and seniority alignment.',
  },
  {
    q: 'How long does an analysis take?',
    a: 'Typically 15–45 seconds. The Extractor and Matcher run sequentially; the Interviewer and Editor run in parallel after the Matcher completes.',
  },
  {
    q: 'Where do the job listings in Job Discovery come from?',
    a: 'Google Jobs (via SerpAPI) and Internshala. Results are ranked by semantic similarity to your resume embedding.',
  },
  {
    q: 'Is my resume data stored securely?',
    a: 'PDFs are stored in Cloudinary. Parsed text and embeddings are stored in MongoDB and pgvector respectively, scoped to your user ID.',
  },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden border border-border rounded-xl">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-4 text-left transition-colors hover:bg-elevated"
      >
        <p className="pr-4 text-sm font-medium text-text-primary">{q}</p>
        {open ? <ChevronUp size={15} className="text-text-muted shrink-0" /> : <ChevronDown size={15} className="text-text-muted shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pt-3 pb-4 text-sm leading-relaxed border-t text-text-secondary border-border animate-fade-in">
          {a}
        </div>
      )}
    </div>
  );
};

const SupportPage = () => {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    // TODO: POST /api/support with { message }
    setSent(true);
    setMessage('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Support</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Find answers or get in touch with the team.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: ExternalLink, label: 'GitHub Repository', sub: 'Source code & issues', href: 'https://github.com/vishnuvardhan1685' },
          { icon: MessageSquare, label: 'Send feedback', sub: 'Report a bug or suggest a feature', href: null },
        ].map(({ icon: Icon, label, sub, href }) => (
          <div
            key={label}
            className="flex items-start gap-3 p-4 transition-colors border cursor-pointer bg-surface border-border rounded-xl hover:border-border-active"
            onClick={() => href && window.open(href, '_blank')}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 shrink-0">
              <Icon size={15} className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{label}</p>
              <p className="text-xs text-text-secondary mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle size={15} className="text-accent" />
          <h2 className="text-sm font-semibold text-text-primary">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-2">
          {FAQS.map((faq) => <FAQItem key={faq.q} {...faq} />)}
        </div>
      </div>

      {/* Contact form */}
      <div className="p-5 border bg-surface border-border rounded-xl">
        <h2 className="mb-1 text-sm font-semibold text-text-primary">Contact us</h2>
        <p className="mb-4 text-xs text-text-secondary">
          Describe your issue and we'll get back to you.
        </p>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your issue or question..."
          className="w-full px-3 py-3 text-sm transition-colors border rounded-lg resize-none bg-base border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
        <div className="flex justify-end mt-3">
          <Button
            size="sm"
            variant={sent ? 'secondary' : 'primary'}
            onClick={handleSend}
            disabled={!message.trim()}
          >
            {sent ? '✓ Message sent' : 'Send message'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;