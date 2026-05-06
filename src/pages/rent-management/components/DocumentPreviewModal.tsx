import { useToast } from '@/hooks/useToast';

interface Props {
  doc: {
    name: string;
    size: string;
    type: string;
    date: string;
    tag: string;
    tagColor: string;
    icon: string;
    iconColor: string;
  };
  onClose: () => void;
}

export default function DocumentPreviewModal({ doc, onClose }: Props) {
  const { addToast } = useToast();

  const handleDownload = () => {
    const blob = new Blob([''], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast(`Downloaded "${doc.name}"`, 'success');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-charcoal truncate pr-4">
            {doc.name}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0"
          >
            <i className="ri-close-line text-gray-400" />
          </button>
        </div>

        {/* Preview area */}
        <div className="px-5 py-6 flex flex-col items-center">
          <div
            className={`w-20 h-20 flex items-center justify-center rounded-2xl mb-4 ${doc.iconColor}`}
          >
            <i className={`${doc.icon} text-3xl`} />
          </div>

          <p className="text-base font-bold text-charcoal text-center px-4">
            {doc.name}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${doc.tagColor}`}>
              {doc.tag}
            </span>
            <span className="text-xs text-gray-400">{doc.type}</span>
          </div>

          {/* Metadata grid */}
          <div className="w-full mt-6 grid grid-cols-3 gap-3">
            <div className="bg-[#f9f9f7] rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-0.5">Size</p>
              <p className="text-sm font-bold text-charcoal">{doc.size}</p>
            </div>
            <div className="bg-[#f9f9f7] rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-0.5">Uploaded</p>
              <p className="text-sm font-bold text-charcoal">{doc.date}</p>
            </div>
            <div className="bg-[#f9f9f7] rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-0.5">Format</p>
              <p className="text-sm font-bold text-charcoal">{doc.type}</p>
            </div>
          </div>

          {/* Preview placeholder */}
          <div className="w-full mt-5 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/50">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 mx-auto mb-2">
              <i className="ri-file-text-line text-gray-400 text-xl" />
            </div>
            <p className="text-xs text-gray-400">
              Preview not available for this file type
            </p>
            <p className="text-[11px] text-gray-300 mt-1">
              Download the file to view it locally
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-gray-100 bg-[#fafaf8]">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Close
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="flex-1 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
          >
            <i className="ri-download-line" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}