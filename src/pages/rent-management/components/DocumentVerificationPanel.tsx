import { useState } from 'react';

interface Props { onClose: () => void; }

type VerifyTab = 'verify' | 'status' | 'compliance';

const verificationItems = [
  { label: 'Rental Agreement', status: 'verified', date: '12 Jan 2025', note: 'Legally valid, both parties Aadhaar-signed', icon: 'ri-file-text-line', color: 'text-brand bg-brand/10' },
  { label: 'Aadhaar — Tenant', status: 'verified', date: '12 Jan 2025', note: 'OTP verified · Last 4 digits: XXXX', icon: 'ri-shield-check-line', color: 'text-green-600 bg-green-50' },
  { label: 'Aadhaar — Owner', status: 'verified', date: '10 Jan 2025', note: 'OTP verified · Last 4 digits: XXXX', icon: 'ri-shield-check-line', color: 'text-green-600 bg-green-50' },
  { label: 'Property Ownership Proof', status: 'verified', date: '11 Jan 2025', note: 'Sale deed reviewed by Bhavan team', icon: 'ri-building-line', color: 'text-amber-600 bg-amber-50' },
  { label: 'Society NOC', status: 'pending', date: '—', note: 'Upload required from owner', icon: 'ri-file-shield-2-line', color: 'text-slate-500 bg-slate-100' },
  { label: 'Police Verification', status: 'not_started', date: '—', note: 'Recommended for long-term tenancy', icon: 'ri-police-car-line', color: 'text-gray-400 bg-gray-100' },
];

const complianceChecks = [
  { label: 'Rent within legal limits (city cap)', pass: true },
  { label: 'Security deposit ≤ 2 months rent', pass: true },
  { label: 'Notice period clause present', pass: true },
  { label: 'Maintenance responsibility defined', pass: true },
  { label: 'Subletting clause included', pass: false },
  { label: 'Dispute resolution clause', pass: false },
];

export default function DocumentVerificationPanel({ onClose }: Props) {
  const [tab, setTab] = useState<VerifyTab>('verify');
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const verifiedCount = verificationItems.filter((v) => v.status === 'verified').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
            <i className="ri-shield-check-line text-brand text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-charcoal">Document Verification</h3>
            <p className="text-xs text-gray-500 mt-0.5">Verify authenticity and ensure legal compliance</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-50 text-green-700">
            {verifiedCount}/{verificationItems.length} verified
          </span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
            <i className="ri-close-line text-gray-400 text-lg" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#f9f9f7] rounded-xl p-1 mb-5 w-fit">
        {(['verify', 'status', 'compliance'] as VerifyTab[]).map((t) => (
          <button
            key={t}
            onClick={(e) => { e.stopPropagation(); setTab(t); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              tab === t ? 'bg-white text-charcoal' : 'text-gray-500 hover:text-charcoal'
            }`}
          >
            <i className={`text-sm ${t === 'verify' ? 'ri-upload-cloud-line' : t === 'status' ? 'ri-list-check-3' : 'ri-scales-3-line'} ${tab === t ? 'text-brand' : ''}`} />
            {t === 'verify' ? 'Upload & Verify' : t === 'status' ? 'Status' : 'Compliance'}
          </button>
        ))}
      </div>

      {/* Tab: Upload & Verify */}
      {tab === 'verify' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {verificationItems.map((item) => (
              <div key={item.label} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 ${item.color}`}>
                  <i className={`${item.icon} text-base`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-charcoal">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.note}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.status === 'verified' ? (
                    <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-600">
                      <i className="ri-checkbox-circle-fill text-xs" /> Verified
                    </span>
                  ) : item.status === 'pending' ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); setUploadingFor(item.label); }}
                      className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-upload-line text-xs" /> Upload
                    </button>
                  ) : (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-400">Not started</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="bg-[#f9f9f7] rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Verification Score</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f0f0f0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3"
                      strokeDasharray={`${(verifiedCount / verificationItems.length) * 100} 100`}
                      strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-charcoal">
                    {Math.round((verifiedCount / verificationItems.length) * 100)}%
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-charcoal">{verifiedCount} of {verificationItems.length}</p>
                  <p className="text-xs text-gray-400">documents verified</p>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(verifiedCount / verificationItems.length) * 100}%` }} />
              </div>
            </div>
            <div className="bg-brand/5 rounded-2xl p-4 border border-brand/10">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-lightbulb-line text-brand text-sm" />
                <p className="text-xs font-bold text-charcoal">Why verify?</p>
              </div>
              <ul className="space-y-1.5">
                {['Legally binding agreements', 'Prevents fraud & disputes', 'Required for HRA claims', 'Faster dispute resolution'].map((t) => (
                  <li key={t} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <i className="ri-checkbox-circle-line text-brand text-sm flex-shrink-0 mt-0.5" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Status */}
      {tab === 'status' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-[#f9f9f7] rounded-2xl overflow-hidden border border-gray-100">
              <div className="grid grid-cols-4 px-4 py-2.5 border-b border-gray-100">
                {['Document', 'Status', 'Date', 'Action'].map((h) => (
                  <p key={h} className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{h}</p>
                ))}
              </div>
              {verificationItems.map((item) => (
                <div key={item.label} className="grid grid-cols-4 px-4 py-3.5 border-b border-gray-100 last:border-0 bg-white hover:bg-[#f9f9f7] transition-colors items-center">
                  <p className="text-sm font-semibold text-charcoal pr-2">{item.label}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit ${
                    item.status === 'verified' ? 'bg-green-50 text-green-600'
                    : item.status === 'pending' ? 'bg-amber-50 text-amber-600'
                    : 'bg-gray-100 text-gray-400'
                  }`}>
                    {item.status === 'not_started' ? 'Not started' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                  <p className="text-sm text-gray-500">{item.date}</p>
                  <button className="text-xs text-brand font-semibold hover:text-brand-dark cursor-pointer whitespace-nowrap w-fit">
                    {item.status === 'verified' ? 'View' : 'Upload'}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 h-fit">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Summary</p>
            {[
              { label: 'Verified', count: verificationItems.filter(v => v.status === 'verified').length, color: 'text-green-600 bg-green-50' },
              { label: 'Pending', count: verificationItems.filter(v => v.status === 'pending').length, color: 'text-amber-600 bg-amber-50' },
              { label: 'Not Started', count: verificationItems.filter(v => v.status === 'not_started').length, color: 'text-gray-400 bg-gray-100' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                <span className="text-xs text-gray-500">{s.label}</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${s.color}`}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Compliance */}
      {tab === 'compliance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-2">
            <p className="text-sm font-semibold text-charcoal mb-3">Indian Rental Law Compliance Check</p>
            {complianceChecks.map((c) => (
              <div key={c.label} className={`flex items-center gap-3 p-3.5 rounded-xl border ${c.pass ? 'bg-green-50/50 border-green-100' : 'bg-amber-50/50 border-amber-100'}`}>
                <div className={`w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 ${c.pass ? 'bg-green-100' : 'bg-amber-100'}`}>
                  <i className={`${c.pass ? 'ri-checkbox-circle-fill text-green-600' : 'ri-alert-line text-amber-600'} text-sm`} />
                </div>
                <p className="text-sm text-charcoal font-medium flex-1">{c.label}</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${c.pass ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {c.pass ? 'Pass' : 'Review'}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="bg-[#f9f9f7] rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Compliance Score</p>
              <div className="text-center py-2">
                <p className="text-4xl font-black text-charcoal">{complianceChecks.filter(c => c.pass).length}<span className="text-xl text-gray-300">/{complianceChecks.length}</span></p>
                <p className="text-xs text-gray-400 mt-1">checks passed</p>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(complianceChecks.filter(c => c.pass).length / complianceChecks.length) * 100}%` }} />
              </div>
            </div>
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-1">
                <i className="ri-alert-line text-amber-600 text-sm" />
                <p className="text-xs font-bold text-amber-800">2 items need review</p>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                Consider adding subletting and dispute resolution clauses to your agreement for full legal protection.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload modal */}
      {uploadingFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setUploadingFor(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-charcoal mb-1">Upload {uploadingFor}</h3>
            <p className="text-xs text-gray-500 mb-4">PDF, JPG or PNG · Max 10 MB</p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand/40 transition-colors cursor-pointer">
              <i className="ri-upload-cloud-2-line text-3xl text-gray-300 mb-2 block" />
              <p className="text-sm text-gray-400">Click or drag file here</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setUploadingFor(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-pointer whitespace-nowrap">Cancel</button>
              <button onClick={() => setUploadingFor(null)} className="flex-1 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark cursor-pointer whitespace-nowrap">Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
