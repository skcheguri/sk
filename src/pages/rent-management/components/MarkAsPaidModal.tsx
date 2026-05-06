import { useState } from 'react';

interface Props {
  month: string;
  amount: string;
  onConfirm: (mode: string, date: string) => void;
  onClose: () => void;
}

const paymentModes = ['UPI', 'Bank Transfer', 'Cash', 'Cheque', 'NEFT / RTGS'];

export default function MarkAsPaidModal({ month, amount, onConfirm, onClose }: Props) {
  const [mode, setMode] = useState('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      onConfirm(mode, date);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {confirmed ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
              <i className="ri-checkbox-circle-line text-green-500 text-3xl" />
            </div>
            <h3 className="text-lg font-bold text-charcoal">Marked as Paid!</h3>
            <p className="text-sm text-gray-500 mt-1">{month} rent of <strong>{amount}</strong> has been recorded.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-brand/5 px-6 py-5 border-b border-brand/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-brand/20">
                  <i className="ri-money-rupee-circle-line text-brand text-lg" />
                </div>
                <div>
                  <p className="text-xs text-brand font-semibold uppercase tracking-wide">Mark as Paid</p>
                  <h2 className="text-base font-bold text-charcoal">{month}</h2>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer transition-colors">
                <i className="ri-close-line text-gray-400 text-xl" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Amount display */}
              <div className="bg-[#f9f9f7] rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">Rent Amount</span>
                <span className="text-xl font-black text-charcoal">{amount}</span>
              </div>

              {/* Payment date */}
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5 uppercase tracking-wide">Payment Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 border border-gray-100"
                />
              </div>

              {/* Payment mode */}
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-2 uppercase tracking-wide">Payment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {paymentModes.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        mode === m
                          ? 'bg-brand text-white'
                          : 'bg-[#f9f9f7] text-gray-600 hover:bg-gray-200 border border-gray-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="bg-amber-50 rounded-xl px-4 py-3 flex items-start gap-2">
                <i className="ri-information-line text-amber-500 text-sm flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  This will update your payment history. Make sure the payment has actually been made before confirming.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <i className="ri-checkbox-circle-line" /> Confirm Payment
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
