import { useState } from 'react';
import { verificationFaqs } from '@/mocks/verification';

export default function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {verificationFaqs.map((faq, idx) => (
        <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span className="text-sm font-medium text-charcoal pr-4">{faq.q}</span>
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <i className={`ri-${openIdx === idx ? 'subtract' : 'add'}-line text-gray-400`} />
            </div>
          </button>
          {openIdx === idx && (
            <div className="px-5 pb-4 bg-white">
              <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
