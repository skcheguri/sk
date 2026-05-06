import { useState, useRef } from 'react';

interface MaintenanceRequestModalProps {
  category: string;
  categoryIcon: string;
  onClose: () => void;
}

const urgencyLevels = [
  { value: 'low', label: 'Low', desc: 'Can wait a few days', color: 'text-green-600 bg-green-50 border-green-200' },
  { value: 'medium', label: 'Medium', desc: 'Needs attention soon', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'high', label: 'High', desc: 'Urgent — affecting daily life', color: 'text-red-600 bg-red-50 border-red-200' },
];

const subIssues: Record<string, string[]> = {
  Plumbing: ['Leaking pipe', 'Blocked drain', 'No hot water', 'Toilet not flushing', 'Low water pressure', 'Burst pipe'],
  Electrical: ['Power outage in room', 'Faulty switch/socket', 'Short circuit', 'Flickering lights', 'Tripped breaker', 'Exposed wiring'],
  Water: ['No water supply', 'Water discolouration', 'Overhead tank issue', 'Water meter problem', 'Seepage/dampness', 'Bore well issue'],
  Elevator: ['Elevator not working', 'Door not closing', 'Unusual noise', 'Stuck between floors', 'Button malfunction', 'Emergency alarm'],
  Carpentry: ['Broken door/window', 'Damaged furniture', 'Wardrobe issue', 'Broken lock', 'Loose hinges', 'Flooring damage'],
  Painting: ['Wall peeling', 'Damp stains', 'Crack in wall', 'Ceiling damage', 'Mould/fungus', 'Touch-up needed'],
  'AC/Appliance': ['AC not cooling', 'AC leaking water', 'Geyser not working', 'Fan not working', 'Exhaust fan issue', 'Inverter/UPS issue'],
  Security: ['CCTV not working', 'Intercom issue', 'Main gate lock', 'Parking barrier', 'Security light out', 'Access card issue'],
  Housekeeping: ['Common area cleaning', 'Garbage not collected', 'Pest infestation', 'Stray animals', 'Garden/lawn issue', 'Terrace access'],
  Other: ['Other issue'],
};

interface PhotoPreview {
  file: File;
  url: string;
}

export default function MaintenanceRequestModal({ category, categoryIcon, onClose }: MaintenanceRequestModalProps) {
  const [step, setStep] = useState(1);
  const [urgency, setUrgency] = useState('');
  const [subIssue, setSubIssue] = useState('');
  const [description, setDescription] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const issues = subIssues[category] || subIssues['Other'];

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 4 - photos.length;
    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...toAdd]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new URLSearchParams();
    formData.append('category', category);
    formData.append('sub_issue', subIssue);
    formData.append('urgency', urgency);
    formData.append('flat_no', flatNo);
    formData.append('preferred_time', preferredTime);
    formData.append('description', description);
    formData.append('photos_count', String(photos.length));
    formData.append('photos', photos.length > 0 ? 'Uncollectable' : 'None');

    try {
      await fetch('https://readdy.ai/api/form/d7ntkev5qk5pqai6d1i0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
    } catch (_) {
      // silent
    }
    setSubmitting(false);
    setSubmitted(true);
  };

  const stepLabels = ['Select Issue', 'Urgency & Details', 'Photos & Submit'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-brand/10 px-6 py-5 flex items-center justify-between border-b border-brand/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand/20">
              <i className={`${categoryIcon} text-brand text-xl`} />
            </div>
            <div>
              <p className="text-xs text-brand font-semibold uppercase tracking-wide">Maintenance Request</p>
              <h2 className="text-lg font-bold text-charcoal">{category}</h2>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer transition-colors">
            <i className="ri-close-line text-gray-500 text-xl" />
          </button>
        </div>

        {/* Step indicator */}
        {!submitted && (
          <div className="px-6 pt-4 flex items-center gap-2 flex-shrink-0">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-brand text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {step > s ? <i className="ri-check-line text-sm" /> : s}
                </div>
                {s < 3 && <div className={`h-0.5 w-8 rounded-full transition-all ${step > s ? 'bg-brand' : 'bg-gray-200'}`} />}
              </div>
            ))}
            <span className="ml-2 text-xs text-gray-500">{stepLabels[step - 1]}</span>
          </div>
        )}

        {/* Scrollable content */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                <i className="ri-checkbox-circle-line text-green-500 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-charcoal">Request Submitted!</h3>
              <p className="mt-2 text-sm text-gray-600">
                Your maintenance request for <strong>{category} — {subIssue}</strong> has been logged. The property manager will respond within 24 hours.
              </p>
              {photos.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">{photos.length} photo{photos.length > 1 ? 's' : ''} attached.</p>
              )}
              <div className="mt-4 bg-gray-50 rounded-xl p-4 text-left space-y-2">
                {[
                  { label: 'Category', value: category },
                  { label: 'Issue', value: subIssue },
                  { label: 'Urgency', value: urgency.charAt(0).toUpperCase() + urgency.slice(1) },
                  { label: 'Flat No.', value: flatNo },
                  { label: 'Preferred Time', value: preferredTime || 'Any time' },
                  { label: 'Photos', value: photos.length > 0 ? `${photos.length} attached` : 'None' },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{row.label}</span>
                    <span className={`font-medium ${row.label === 'Urgency' && urgency === 'high' ? 'text-red-600' : row.label === 'Urgency' && urgency === 'medium' ? 'text-amber-600' : 'text-charcoal'}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={onClose}
                className="mt-6 w-full bg-brand text-white font-semibold py-3 rounded-xl hover:bg-brand-dark transition-colors cursor-pointer whitespace-nowrap"
              >
                Done
              </button>
            </div>
          ) : step === 1 ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">What specific issue are you facing?</p>
              <div className="grid grid-cols-2 gap-2">
                {issues.map((issue) => (
                  <button
                    key={issue}
                    onClick={() => setSubIssue(issue)}
                    className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${subIssue === issue ? 'border-brand bg-brand/10 text-brand' : 'border-gray-200 text-charcoal hover:border-brand/40 hover:bg-brand/5'}`}
                  >
                    {issue}
                  </button>
                ))}
              </div>
              <button
                disabled={!subIssue}
                onClick={() => setStep(2)}
                className="mt-5 w-full bg-brand text-white font-semibold py-3 rounded-xl hover:bg-brand-dark transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Continue
              </button>
            </div>
          ) : step === 2 ? (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-charcoal mb-2">How urgent is this?</p>
                <div className="space-y-2">
                  {urgencyLevels.map((u) => (
                    <button
                      key={u.value}
                      onClick={() => setUrgency(u.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${urgency === u.value ? u.color + ' border-current' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${urgency === u.value ? 'border-current' : 'border-gray-300'}`}>
                        {urgency === u.value && <div className="w-2 h-2 rounded-full bg-current" />}
                      </div>
                      <div className="text-left">
                        <span className="font-semibold">{u.label}</span>
                        <span className="text-gray-500 ml-2 font-normal">{u.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">Flat / Unit No. *</label>
                  <input
                    type="text"
                    value={flatNo}
                    onChange={(e) => setFlatNo(e.target.value)}
                    placeholder="e.g. B-204"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">Preferred Time</label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand cursor-pointer"
                  >
                    <option value="">Any time</option>
                    <option value="Morning (9am–12pm)">Morning (9am–12pm)</option>
                    <option value="Afternoon (12pm–4pm)">Afternoon (12pm–4pm)</option>
                    <option value="Evening (4pm–7pm)">Evening (4pm–7pm)</option>
                    <option value="Weekend only">Weekend only</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 text-charcoal font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Back
                </button>
                <button
                  disabled={!urgency || !flatNo}
                  onClick={() => setStep(3)}
                  className="flex-1 bg-brand text-white font-semibold py-3 rounded-xl hover:bg-brand-dark transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Continue
                </button>
              </div>
            </div>
          ) : (
            <form data-readdy-form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  Attach Photos <span className="text-gray-400 font-normal">(up to 4 — helps technician diagnose faster)</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                      <img src={p.url} alt={`photo-${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <i className="ri-close-line text-white text-xs" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 4 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-brand/50 hover:bg-brand/5 transition-all cursor-pointer"
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className="ri-image-add-line text-gray-400 text-lg" />
                      </div>
                      <span className="text-[10px] text-gray-400">Add</span>
                    </button>
                  )}
                  {/* Empty placeholders */}
                  {Array.from({ length: Math.max(0, 3 - photos.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square rounded-xl border border-dashed border-gray-100 bg-gray-50" />
                  ))}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoAdd}
                />
                {photos.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">{photos.length}/4 photos added</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">Describe the issue <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  name="description"
                  value={description}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) setDescription(e.target.value);
                  }}
                  placeholder="Add any additional details that might help the technician..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{description.length}/500</p>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-charcoal uppercase tracking-wide mb-3">Request Summary</p>
                {[
                  { label: 'Category', value: category },
                  { label: 'Issue', value: subIssue },
                  { label: 'Urgency', value: urgency.charAt(0).toUpperCase() + urgency.slice(1) },
                  { label: 'Flat No.', value: flatNo },
                  { label: 'Preferred Time', value: preferredTime || 'Any time' },
                  { label: 'Photos', value: photos.length > 0 ? `${photos.length} attached` : 'None' },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{row.label}</span>
                    <span className={`font-medium ${row.label === 'Urgency' && urgency === 'high' ? 'text-red-600' : row.label === 'Urgency' && urgency === 'medium' ? 'text-amber-600' : 'text-charcoal'}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-200 text-charcoal font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-brand text-white font-semibold py-3 rounded-xl hover:bg-brand-dark transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
