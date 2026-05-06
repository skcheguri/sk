import { useState, useRef, useCallback } from 'react';
import DocumentPreviewModal from '@/pages/rent-management/components/DocumentPreviewModal';
import { useToast } from '@/hooks/useToast';

interface Props {
  onClose: () => void;
}

interface DocFile {
  name: string;
  size: string;
  type: string;
  date: string;
  tag: string;
  tagColor: string;
  icon: string;
  iconColor: string;
  file?: File;
}

const mockDocs: DocFile[] = [
  { name: 'Rental Agreement — Jan 2025.pdf', size: '1.2 MB', type: 'PDF', date: '12 Jan 2025', tag: 'Agreement', tagColor: 'bg-brand/10 text-brand', icon: 'ri-file-text-line', iconColor: 'text-brand bg-brand/10' },
  { name: 'Aadhaar Verification Receipt.pdf', size: '340 KB', type: 'PDF', date: '12 Jan 2025', tag: 'Identity', tagColor: 'bg-green-50 text-green-700', icon: 'ri-shield-check-line', iconColor: 'text-green-600 bg-green-50' },
  { name: 'Rent Receipt — April 2026.pdf', size: '88 KB', type: 'PDF', date: '1 Apr 2026', tag: 'Receipt', tagColor: 'bg-amber-50 text-amber-700', icon: 'ri-receipt-line', iconColor: 'text-amber-600 bg-amber-50' },
  { name: 'Rent Receipt — March 2026.pdf', size: '88 KB', type: 'PDF', date: '1 Mar 2026', tag: 'Receipt', tagColor: 'bg-amber-50 text-amber-700', icon: 'ri-receipt-line', iconColor: 'text-amber-600 bg-amber-50' },
  { name: 'Move-in Checklist — Signed.pdf', size: '210 KB', type: 'PDF', date: '12 Jan 2025', tag: 'Checklist', tagColor: 'bg-teal-50 text-teal-700', icon: 'ri-checkbox-circle-line', iconColor: 'text-teal-600 bg-teal-50' },
  { name: 'Society NOC Letter.pdf', size: '156 KB', type: 'PDF', date: '15 Jan 2025', tag: 'NOC', tagColor: 'bg-slate-100 text-slate-600', icon: 'ri-file-shield-2-line', iconColor: 'text-slate-600 bg-slate-100' },
];

const tags = ['All', 'Agreement', 'Receipt', 'Identity', 'Checklist', 'NOC'];

export default function DigitalRentStoragePanel({ onClose }: Props) {
  const [activeTag, setActiveTag] = useState('All');
  const [search, setSearch] = useState('');
  const [docs, setDocs] = useState<DocFile[]>(mockDocs);
  const [dragOver, setDragOver] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  // Calculate total storage used (in MB)
  const totalBytes = docs.reduce((sum, d) => {
    const sizeStr = d.size.toLowerCase();
    if (sizeStr.includes('mb')) return sum + parseFloat(sizeStr) * 1024 * 1024;
    if (sizeStr.includes('kb')) return sum + parseFloat(sizeStr) * 1024;
    return sum + parseFloat(sizeStr);
  }, 0);
  const totalMB = totalBytes / (1024 * 1024);
  const percentUsed = Math.min((totalMB / 100) * 100, 100);

  const filtered = docs.filter((d) => {
    const matchTag = activeTag === 'All' || d.tag === activeTag;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  const handleUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const fileArray = Array.from(files);
    const newProgress: Record<string, number> = {};

    fileArray.forEach((f) => {
      newProgress[f.name] = 0;
    });
    setUploadProgress(newProgress);

    // Simulate progress then add files
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const next = { ...prev };
        let allDone = true;
        Object.keys(next).forEach((key) => {
          if (next[key] < 100) {
            next[key] = Math.min(next[key] + Math.random() * 30 + 10, 100);
            allDone = false;
          }
        });
        if (allDone) {
          clearInterval(interval);
        }
        return next;
      });
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      const uploadedDocs: DocFile[] = fileArray.map((f) => {
        const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
        let icon = 'ri-file-line';
        let iconColor = 'text-gray-500 bg-gray-100';
        let tag = 'Other';
        let tagColor = 'bg-gray-100 text-gray-600';

        if (['pdf'].includes(ext)) {
          icon = 'ri-file-text-line';
          iconColor = 'text-brand bg-brand/10';
          tag = 'Document';
          tagColor = 'bg-brand/10 text-brand';
        } else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
          icon = 'ri-image-line';
          iconColor = 'text-teal-600 bg-teal-50';
          tag = 'Image';
          tagColor = 'bg-teal-50 text-teal-700';
        } else if (['doc', 'docx'].includes(ext)) {
          icon = 'ri-file-word-line';
          iconColor = 'text-blue-600 bg-blue-50';
          tag = 'Document';
          tagColor = 'bg-blue-50 text-blue-700';
        }

        return {
          name: f.name,
          size: f.size > 1024 * 1024
            ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
            : `${(f.size / 1024).toFixed(0)} KB`,
          type: ext.toUpperCase(),
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          tag,
          tagColor,
          icon,
          iconColor,
          file: f,
        };
      });

      setDocs((prev) => [...uploadedDocs, ...prev]);
      setUploadProgress({});
      setIsUploading(false);

      if (fileArray.length === 1) {
        addToast(`Uploaded "${fileArray[0].name}"`, 'success');
      } else {
        addToast(`Uploaded ${fileArray.length} documents`, 'success');
      }
    }, 1400);
  }, [addToast]);

  const handleDownload = (doc: DocFile) => {
    if (doc.file) {
      const url = URL.createObjectURL(doc.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([''], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    addToast(`Downloaded "${doc.name}"`, 'success');
  };

  const handleDelete = (docName: string) => {
    setDocs((prev) => prev.filter((d) => d.name !== docName));
    addToast('Document removed', 'info');
  };

  return (
    <div className="p-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
            <i className="ri-file-text-line text-brand text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-charcoal">Digital Rent Storage</h3>
            <p className="text-xs text-gray-500 mt-0.5">All your rental documents in one secure place</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#f9f9f7] text-gray-500 border border-gray-100">
            {docs.length} documents
          </span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
            <i className="ri-close-line text-gray-400 text-lg" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: doc list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 border border-gray-100"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={(e) => { e.stopPropagation(); setActiveTag(t); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    activeTag === t ? 'bg-brand text-white' : 'bg-[#f9f9f7] text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Upload progress overlay */}
          {isUploading && Object.keys(uploadProgress).length > 0 && (
            <div className="bg-white rounded-xl border border-brand/20 p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <i className="ri-upload-cloud-2-line text-brand text-sm" />
                <span className="text-sm font-semibold text-charcoal">Uploading...</span>
              </div>
              {Object.entries(uploadProgress).map(([name, progress]) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 truncate max-w-[200px]">{name}</span>
                    <span className="text-xs font-semibold text-brand">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Doc list */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No documents found</div>
            ) : filtered.map((doc) => (
              <div key={doc.name} className="flex items-center gap-3 bg-white rounded-xl p-3.5 border border-gray-100 hover:border-brand/20 transition-colors group">
                <div className={`w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 ${doc.iconColor}`}>
                  <i className={`${doc.icon} text-base`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-charcoal truncate">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{doc.size}</span>
                    <span className="text-gray-200">·</span>
                    <span className="text-xs text-gray-400">{doc.date}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${doc.tagColor}`}>{doc.tag}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreviewDoc(doc); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-brand/10 transition-colors cursor-pointer"
                    title="Preview document"
                  >
                    <i className="ri-eye-line text-xs text-gray-500" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-brand/10 transition-colors cursor-pointer"
                    title="Download document"
                  >
                    <i className="ri-download-line text-xs text-gray-500" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(doc.name); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <i className="ri-delete-bin-line text-xs text-gray-500 hover:text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: upload + storage info */}
        <div className="space-y-4">
          {/* Upload zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              dragOver ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-brand/40 hover:bg-brand/5'
            }`}
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-brand/10 mx-auto mb-3">
              <i className="ri-upload-cloud-2-line text-brand text-2xl" />
            </div>
            <p className="text-sm font-semibold text-charcoal">Drop files here</p>
            <p className="text-xs text-gray-400 mt-1">or click to browse</p>
            <p className="text-[11px] text-gray-300 mt-2">PDF, JPG, PNG · Max 10 MB each</p>
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
          </div>

          {/* Storage meter */}
          <div className="bg-[#f9f9f7] rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-charcoal">Storage Used</p>
              <p className="text-xs text-gray-400">{totalMB.toFixed(1)} MB / 100 MB</p>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-brand rounded-full transition-all duration-500" style={{ width: `${percentUsed}%` }} />
            </div>
            <p className="text-[11px] text-gray-400 mt-2">{(100 - totalMB).toFixed(1)} MB free · Encrypted &amp; secure</p>
          </div>

          {/* Tips */}
          <div className="bg-brand/5 rounded-2xl p-4 border border-brand/10">
            <div className="flex items-center gap-2 mb-2">
              <i className="ri-lightbulb-line text-brand text-sm" />
              <p className="text-xs font-bold text-charcoal">What to store here</p>
            </div>
            <ul className="space-y-1.5">
              {['Rental agreement & addendums', 'Monthly rent receipts', 'Move-in / move-out checklist', 'Society NOC & utility bills', 'Aadhaar & ID copies'].map((t) => (
                <li key={t} className="flex items-start gap-1.5 text-xs text-gray-600">
                  <i className="ri-checkbox-circle-line text-brand text-sm flex-shrink-0 mt-0.5" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
    </div>
  );
}