import { useState } from 'react';
import { ownerOnRenterQuestions, renterOnOwnerQuestions } from '@/mocks/feedback';
import StarRating from './StarRating';
import type { FeedbackRole } from '@/mocks/feedback';

interface FeedbackModalProps {
  role: FeedbackRole;
  onClose: () => void;
  onSubmit: () => void;
}

export default function FeedbackModal({ role, onClose, onSubmit }: FeedbackModalProps) {
  const questions = role === 'owner_on_renter' ? ownerOnRenterQuestions : renterOnOwnerQuestions;

  const [step, setStep] = useState<'info' | 'questionnaire' | 'rating' | 'done'>('info');
  const [subjectName, setSubjectName] = useState('');
  const [property, setProperty] = useState('');
  const [period, setPeriod] = useState('');
  const [answers, setAnswers] = useState<Record<string, boolean | null>>(
    Object.fromEntries(questions.map((q) => [q.id, null]))
  );
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOwner = role === 'owner_on_renter';

  const calculateAutoRating = (role: FeedbackRole, ans: Record<string, boolean | null>) => {
    const qs = role === 'owner_on_renter' ? ownerOnRenterQuestions : renterOnOwnerQuestions;
    const total = qs.length;
    const positive = qs.reduce((acc, q) => {
      const val = ans[q.id];
      if (val === null) return acc;
      const isGood = q.negative ? !val : val;
      return acc + (isGood ? 1 : 0);
    }, 0);
    return Math.max(1, Math.round((positive / total) * 5));
  };

  const satisfiedCount = questions.reduce((acc, q) => {
    const val = answers[q.id];
    if (val === null) return acc;
    const isGood = q.negative ? !val : val;
    return acc + (isGood ? 1 : 0);
  }, 0);

  const autoRating = calculateAutoRating(role, answers);

  const handleAnswer = (id: string, val: boolean) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  };

  const allAnswered = Object.values(answers).every((v) => v !== null);
  const infoValid = subjectName.trim() && property.trim() && period.trim();

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setStep('done');
    }, 1200);
  };

  if (step === 'done') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <i className="ri-check-double-line text-emerald-500 text-3xl" />
          </div>
          <h3 className="mt-5 text-xl font-bold text-charcoal">Feedback Submitted!</h3>
          <p className="mt-2 text-sm text-gray-500">
            Your review has been recorded. It helps build a trustworthy rental community.
          </p>
          <button
            type="button"
            onClick={onSubmit}
            className="mt-6 bg-brand text-white font-medium px-8 py-3 rounded-full hover:bg-brand-dark transition-colors whitespace-nowrap cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`px-6 py-5 border-b flex items-center justify-between ${isOwner ? 'bg-brand/5' : 'bg-teal-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOwner ? 'bg-brand/20' : 'bg-teal-100'}`}>
              <i className={`${isOwner ? 'ri-home-4-line text-brand' : 'ri-user-line text-teal-600'} text-lg`} />
            </div>
            <div>
              <h2 className="font-bold text-charcoal text-base">
                {isOwner ? 'Review Your Tenant' : 'Review Your Owner'}
              </h2>
              <p className="text-xs text-gray-500">
                {isOwner ? 'Help future landlords make informed decisions' : 'Help future tenants find trustworthy owners'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line text-gray-500 text-lg" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-5">
          <div className="flex items-center gap-2">
            {['info', 'questionnaire', 'rating'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s ? (isOwner ? 'bg-brand text-white' : 'bg-teal-500 text-white')
                  : ['info', 'questionnaire', 'rating'].indexOf(step) > i ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {['info', 'questionnaire', 'rating'].indexOf(step) > i ? <i className="ri-check-line" /> : i + 1}
                </div>
                <span className="text-xs text-gray-500 hidden sm:block">
                  {s === 'info' ? 'Details' : s === 'questionnaire' ? 'Questionnaire' : 'Rating'}
                </span>
                {i < 2 && <div className="w-8 h-px bg-gray-200 mx-1" />}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-5">
          {/* Step 1: Basic Info */}
          {step === 'info' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-charcoal">
                {isOwner ? 'Who are you reviewing?' : 'Which owner are you reviewing?'}
              </h3>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">
                  {isOwner ? 'Tenant\'s Full Name' : 'Owner\'s Full Name'}
                </label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder={isOwner ? 'e.g. Arjun Mehta' : 'e.g. Priya Sharma'}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Property Name / Address</label>
                <input
                  type="text"
                  value={property}
                  onChange={(e) => setProperty(e.target.value)}
                  placeholder="e.g. Sunny 2BHK in Bandra West"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Tenancy Period</label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="e.g. Jan 2025 – Mar 2026"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand"
                />
              </div>
              <button
                type="button"
                disabled={!infoValid}
                onClick={() => setStep('questionnaire')}
                className={`w-full py-3 rounded-full font-medium text-sm transition-colors whitespace-nowrap cursor-pointer ${
                  infoValid ? (isOwner ? 'bg-brand text-white hover:bg-brand-dark' : 'bg-teal-500 text-white hover:bg-teal-600') : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue to Questionnaire
              </button>
            </div>
          )}

          {/* Step 2: Questionnaire */}
          {step === 'questionnaire' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-charcoal">Answer the questionnaire</h3>
                <p className="text-xs text-gray-500 mt-1">Be honest — your answers help the community make better decisions</p>
              </div>
              <div className="space-y-3">
                {questions.map((q) => (
                  <div key={q.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <i className={`${q.icon} text-gray-500 text-sm`} />
                      </div>
                      <p className="text-sm font-medium text-charcoal leading-snug pt-1">{q.label}</p>
                    </div>
                    <div className="flex gap-3 ml-11">
                      <button
                        type="button"
                        onClick={() => handleAnswer(q.id, true)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                          answers[q.id] === true
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'
                        }`}
                      >
                        <i className="ri-check-line mr-1.5" />
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAnswer(q.id, false)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                          answers[q.id] === false
                            ? 'bg-red-500 text-white border-red-500'
                            : 'border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50'
                        }`}
                      >
                        <i className="ri-close-line mr-1.5" />
                        No
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="flex-1 py-3 rounded-full font-medium text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!allAnswered}
                  onClick={() => setStep('rating')}
                  className={`flex-1 py-3 rounded-full font-medium text-sm transition-colors cursor-pointer whitespace-nowrap ${
                    allAnswered ? (isOwner ? 'bg-brand text-white hover:bg-brand-dark' : 'bg-teal-500 text-white hover:bg-teal-600') : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue to Rating
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Rating & Comment */}
          {step === 'rating' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-charcoal">Overall Rating</h3>
                <p className="text-xs text-gray-500 mt-1">Based on your questionnaire answers</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 text-center">
                <div className="flex justify-center items-center gap-2">
                  <span className="text-2xl font-bold text-charcoal">{autoRating}</span>
                  <StarRating value={autoRating} readonly size="lg" />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {satisfiedCount} of {questions.length} criteria satisfied
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">
                  Write a Review <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  rows={4}
                  placeholder={isOwner
                    ? 'Share your experience with this tenant — what went well, what could have been better...'
                    : 'Share your experience with this owner — was the property as described, how was communication...'
                  }
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/500</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('questionnaire')}
                  className="flex-1 py-3 rounded-full font-medium text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className={`flex-1 py-3 rounded-full font-medium text-sm transition-colors cursor-pointer whitespace-nowrap ${
                    !submitting ? (isOwner ? 'bg-brand text-white hover:bg-brand-dark' : 'bg-teal-500 text-white hover:bg-teal-600') : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-loader-4-line animate-spin" />
                      Submitting...
                    </span>
                  ) : 'Submit Review'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
