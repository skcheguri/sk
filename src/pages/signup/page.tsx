import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

type AuthTab = 'email' | 'mobile';
type ForgotStep = 'email' | 'otp' | 'reset' | 'done';

export default function Signup() {
  const [tab, setTab] = useState<AuthTab>('email');
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect when logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'owner' ? '/owner-profile' : '/tenant-profile');
    }
  }, [user, navigate]);

  // Email signup state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('renter');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [notBroker, setNotBroker] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');

  // Google sign-up state
  const [googleError, setGoogleError] = useState('');
  const [showGoogleRoleModal, setShowGoogleRoleModal] = useState(false);
  const [googleRole, setGoogleRole] = useState<'renter' | 'landlord'>('renter');

  const handleGoogleSignUp = async () => {
    setGoogleError('Google sign-up is not yet available. Please use email + password.');
  };

  const handleGoogleRoleConfirm = async () => {
    setShowGoogleRoleModal(false);
  };

  // Mobile OTP state
  const [mobileName, setMobileName] = useState('');
  const [mobileRole, setMobileRole] = useState('renter');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [mobileAgreed, setMobileAgreed] = useState(false);
  const [mobileNotBroker, setMobileNotBroker] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setSignupLoading(true);
    const mappedRole = role === 'renter' ? 'tenant' : 'owner';
    const { error } = await signUp(email, password, name, mappedRole as 'tenant' | 'owner');
    setSignupLoading(false);
    if (error) {
      setSignupError(error);
    }
  };

  const handleSendOtp = () => {
    if (mobile.length < 10) return;
    setSendingOtp(true);
    setTimeout(() => {
      setSendingOtp(false);
      setOtpSent(true);
      setOtpTimer(30);
      const interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    }, 1200);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) {
      document.getElementById(`sotp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`sotp-${index - 1}`)?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError('Mobile OTP sign-up is not yet connected to the backend. Please use email + password.');
    setSignupLoading(false);
  };

  const otpFilled = otp.every((d) => d !== '');

  // Forgot password modal state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '', '', '']);
  const [forgotOtpTimer, setForgotOtpTimer] = useState(0);
  const [forgotSending, setForgotSending] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const openForgot = () => {
    setShowForgot(true);
    setForgotStep('email');
    setForgotEmail(email);
    setForgotOtp(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
  };

  const closeForgot = () => {
    setShowForgot(false);
    setForgotStep('email');
    setForgotError('');
  };

  const handleForgotSendOtp = () => {
    if (!forgotEmail.includes('@')) { setForgotError('Enter a valid email address'); return; }
    setForgotError('');
    setForgotSending(true);
    setTimeout(() => {
      setForgotSending(false);
      setForgotStep('otp');
      setForgotOtpTimer(30);
      const interval = setInterval(() => {
        setForgotOtpTimer((prev) => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    }, 1200);
  };

  const handleForgotOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...forgotOtp];
    next[index] = value.slice(-1);
    setForgotOtp(next);
    if (value && index < 5) {
      document.getElementById(`sfotp-${index + 1}`)?.focus();
    }
  };

  const handleForgotOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !forgotOtp[index] && index > 0) {
      document.getElementById(`sfotp-${index - 1}`)?.focus();
    }
  };

  const handleForgotVerifyOtp = () => {
    if (!forgotOtp.every((d) => d !== '')) { setForgotError('Please enter the complete OTP'); return; }
    setForgotError('');
    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotStep('reset');
    }, 1000);
  };

  const handleForgotResendOtp = () => {
    setForgotOtp(['', '', '', '', '', '']);
    setForgotSending(true);
    setTimeout(() => {
      setForgotSending(false);
      setForgotOtpTimer(30);
      const interval = setInterval(() => {
        setForgotOtpTimer((prev) => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    }, 1000);
  };

  const handleForgotReset = () => {
    if (newPassword.length < 8) { setForgotError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setForgotError('Passwords do not match'); return; }
    setForgotError('');
    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotStep('done');
    }, 1200);
  };

  const forgotOtpFilled = forgotOtp.every((d) => d !== '');

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center pt-20 pb-10">
      <div className="w-full max-w-md px-4">
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-6">
            <img
              src="https://storage.readdy-site.link/project_files/2a4bc4d8-2b56-4cda-b6f5-ac9c2ebbfa8f/4ea9883a-4467-42fc-9416-153bac5fcc0f_log.png?v=6dcc801a33c8ab9acb1484d2408c7c4a"
              alt="Bhavan"
              className="h-12 w-12 object-contain mx-auto"
            />
            <h1 className="mt-4 text-2xl font-bold text-charcoal">Create Account</h1>
            <p className="mt-1 text-sm text-gray-500">Join thousands of happy renters &amp; owners</p>
          </div>

          {/* Role selector */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-charcoal mb-3">I am signing up as a</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('renter')}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  role === 'renter'
                    ? 'border-brand bg-brand/5'
                    : 'border-gray-100 hover:border-brand/30 bg-lightgray'
                }`}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${role === 'renter' ? 'bg-brand/20' : 'bg-white'}`}>
                  <i className={`ri-home-heart-line text-xl ${role === 'renter' ? 'text-brand' : 'text-gray-400'}`} />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-bold ${role === 'renter' ? 'text-brand' : 'text-charcoal'}`}>Tenant</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Looking to rent</p>
                </div>
                {role === 'renter' && (
                  <div className="w-4 h-4 flex items-center justify-center rounded-full bg-brand flex-shrink-0">
                    <i className="ri-check-line text-white text-[10px]" />
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => setRole('landlord')}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  role === 'landlord'
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-gray-100 hover:border-amber-200 bg-lightgray'
                }`}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${role === 'landlord' ? 'bg-amber-100' : 'bg-white'}`}>
                  <i className={`ri-building-4-line text-xl ${role === 'landlord' ? 'text-amber-600' : 'text-gray-400'}`} />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-bold ${role === 'landlord' ? 'text-amber-700' : 'text-charcoal'}`}>Property Owner</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Listing my property</p>
                </div>
                {role === 'landlord' && (
                  <div className="w-4 h-4 flex items-center justify-center rounded-full bg-amber-500 flex-shrink-0">
                    <i className="ri-check-line text-white text-[10px]" />
                  </div>
                )}
              </button>
            </div>
            <p className="mt-2.5 text-xs text-red-500 font-medium flex items-center gap-1">
              <i className="ri-forbid-line text-xs" />
              Brokers &amp; real estate agents are strictly not allowed.
            </p>
          </div>

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-white hover:bg-lightgray transition-colors py-3 rounded-xl text-sm font-medium text-charcoal cursor-pointer whitespace-nowrap"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>
          {googleError && (
            <p className="text-xs text-red-500 font-medium text-center mt-2">{googleError}</p>
          )}

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-lightgray rounded-full p-1 mb-5">
            <button
              type="button"
              onClick={() => setTab('email')}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                tab === 'email' ? 'bg-white text-charcoal' : 'text-gray-500 hover:text-charcoal'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-mail-line text-sm" />
                </div>
                Email
              </span>
            </button>
            <button
              type="button"
              onClick={() => { setTab('mobile'); setOtpSent(false); setOtp(['', '', '', '', '', '']); }}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                tab === 'mobile' ? 'bg-white text-charcoal' : 'text-gray-500 hover:text-charcoal'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-smartphone-line text-sm" />
                </div>
                Mobile OTP
              </span>
            </button>
          </div>

          {/* Email Signup Form */}
          {tab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-lightgray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-lightgray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 bg-lightgray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 pr-12"
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-charcoal cursor-pointer"
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className={`ri-${showPassword ? 'eye-off' : 'eye'}-line`} />
                    </div>
                  </button>
                </div>
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notBroker}
                  onChange={(e) => setNotBroker(e.target.checked)}
                  required
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-brand focus:ring-brand"
                />
                <span className="text-sm text-gray-600">
                  I confirm I am <strong className="text-charcoal">not a real estate broker or agent</strong>. I am signing up as a genuine renter or property owner only.
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  required
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-brand focus:ring-brand"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-brand hover:text-brand-dark font-medium">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-brand hover:text-brand-dark font-medium">Privacy Policy</a>
                </span>
              </label>
              {signupError && <p className="text-xs text-red-500 font-medium">{signupError}</p>}
              <button
                type="submit"
                disabled={!agreed || !notBroker || signupLoading}
                className="w-full bg-brand text-white font-medium py-3.5 rounded-full hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
              >
                {signupLoading && <i className="ri-loader-4-line animate-spin" />}
                Create Account
              </button>
            </form>
          )}

          {/* Mobile OTP Signup Form */}
          {tab === 'mobile' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={mobileName}
                  onChange={(e) => setMobileName(e.target.value)}
                  required
                  disabled={otpSent}
                  className="w-full px-4 py-3 bg-lightgray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-60"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-3 bg-lightgray rounded-xl text-sm text-charcoal font-medium min-w-[64px]">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-flag-line text-xs" />
                    </div>
                    +91
                  </div>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    disabled={otpSent}
                    className="flex-1 px-4 py-3 bg-lightgray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-60"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
              {!otpSent ? (
                <>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mobileNotBroker}
                      onChange={(e) => setMobileNotBroker(e.target.checked)}
                      required
                      className="w-4 h-4 mt-0.5 rounded border-gray-300 text-brand focus:ring-brand"
                    />
                    <span className="text-sm text-gray-600">
                      I confirm I am <strong className="text-charcoal">not a real estate broker or agent</strong>. I am signing up as a genuine renter or property owner only.
                    </span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mobileAgreed}
                      onChange={(e) => setMobileAgreed(e.target.checked)}
                      required
                      className="w-4 h-4 mt-0.5 rounded border-gray-300 text-brand focus:ring-brand"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the{' '}
                      <a href="#" className="text-brand hover:text-brand-dark font-medium">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="text-brand hover:text-brand-dark font-medium">Privacy Policy</a>
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={mobile.length < 10 || sendingOtp || !mobileAgreed || !mobileNotBroker || !mobileName}
                    className="w-full bg-brand text-white font-medium py-3.5 rounded-full hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    {sendingOtp ? (
                      <><i className="ri-loader-4-line animate-spin" /> Sending OTP...</>
                    ) : (
                      <><i className="ri-send-plane-line" /> Send OTP</>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-charcoal">Enter OTP</label>
                      <span className="text-xs text-gray-500">
                        Sent to +91 {mobile}
                        <button
                          type="button"
                          onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); }}
                          className="ml-2 text-brand hover:text-brand-dark font-medium cursor-pointer"
                        >
                          Change
                        </button>
                      </span>
                    </div>
                    <div className="flex gap-2 justify-between">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          id={`sotp-${i}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="w-11 h-12 text-center bg-lightgray rounded-xl text-base font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/40"
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400">{otpTimer > 0 ? `Resend in ${otpTimer}s` : ''}</span>
                      {otpTimer === 0 && (
                        <button type="button" onClick={handleSendOtp} className="text-xs text-brand hover:text-brand-dark font-medium cursor-pointer">
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!otpFilled}
                    className="w-full bg-brand text-white font-medium py-3.5 rounded-full hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                  >
                    Verify &amp; Create Account
                  </button>
                </>
              )}
            </form>
          )}

          {/* Forgot password hint */}
          {tab === 'email' && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={openForgot}
                className="text-sm text-gray-400 hover:text-brand transition-colors cursor-pointer"
              >
                Already have an account?{' '}
                <span className="text-brand font-medium">Forgot your password?</span>
              </button>
            </div>
          )}

          {/* Aadhaar Verification Nudge */}
          <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <i className="ri-shield-check-line text-green-600 text-sm" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800">Verify with Aadhaar after signing up</p>
                <p className="text-xs text-green-700 mt-0.5 leading-relaxed">
                  Aadhaar verification is required to contact owners and sign rental agreements. It takes under 60 seconds.
                </p>
                <Link
                  to="/aadhaar-verify"
                  className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-green-700 hover:text-green-800 cursor-pointer"
                >
                  Verify Now <i className="ri-arrow-right-line" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-brand hover:text-brand-dark font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Google Role Picker Modal ── */}
      {showGoogleRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-7 border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#f1f3f4] mx-auto mb-4">
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-7 h-7"
                />
              </div>
              <h3 className="text-lg font-bold text-charcoal">One last step!</h3>
              <p className="mt-1 text-sm text-gray-500">How will you be using Bhavan?</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setGoogleRole('renter')}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  googleRole === 'renter' ? 'border-brand bg-brand/5' : 'border-gray-100 hover:border-brand/30'
                }`}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${googleRole === 'renter' ? 'bg-brand/20' : 'bg-gray-50'}`}>
                  <i className={`ri-home-heart-line text-xl ${googleRole === 'renter' ? 'text-brand' : 'text-gray-400'}`} />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-bold ${googleRole === 'renter' ? 'text-brand' : 'text-charcoal'}`}>Tenant</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Looking to rent</p>
                </div>
                {googleRole === 'renter' && (
                  <div className="w-4 h-4 flex items-center justify-center rounded-full bg-brand">
                    <i className="ri-check-line text-white text-[10px]" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setGoogleRole('landlord')}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  googleRole === 'landlord' ? 'border-amber-400 bg-amber-50' : 'border-gray-100 hover:border-amber-200'
                }`}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${googleRole === 'landlord' ? 'bg-amber-100' : 'bg-gray-50'}`}>
                  <i className={`ri-building-4-line text-xl ${googleRole === 'landlord' ? 'text-amber-600' : 'text-gray-400'}`} />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-bold ${googleRole === 'landlord' ? 'text-amber-700' : 'text-charcoal'}`}>Property Owner</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Listing my property</p>
                </div>
                {googleRole === 'landlord' && (
                  <div className="w-4 h-4 flex items-center justify-center rounded-full bg-amber-500">
                    <i className="ri-check-line text-white text-[10px]" />
                  </div>
                )}
              </button>
            </div>

            <p className="text-xs text-red-500 font-medium flex items-center gap-1 mb-5">
              <i className="ri-forbid-line text-xs" />
              Brokers &amp; real estate agents are strictly not allowed.
            </p>

            <button
              type="button"
              onClick={handleGoogleRoleConfirm}
              className={`w-full text-white font-medium py-3 rounded-full transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-2 ${
                googleRole === 'landlord' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand hover:bg-brand-dark'
              }`}
            >
              <i className="ri-check-line" /> Continue as {googleRole === 'landlord' ? 'Property Owner' : 'Tenant'}
            </button>

            <button
              type="button"
              onClick={() => setShowGoogleRoleModal(false)}
              className="w-full mt-2 text-sm text-gray-400 hover:text-charcoal transition-colors cursor-pointer py-2 text-center"
            >
              ← Go back
            </button>
          </div>
        </div>
      )}

      {/* ── Forgot Password Modal ── */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeForgot} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-7 border border-gray-100">
            <button
              onClick={closeForgot}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-charcoal hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-lg" />
            </button>

            {forgotStep === 'email' && (
              <div>
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-brand/10 mb-4">
                  <i className="ri-lock-password-line text-2xl text-brand" />
                </div>
                <h3 className="text-lg font-bold text-charcoal">Forgot Password?</h3>
                <p className="mt-1 text-sm text-gray-500 mb-5">
                  Enter your registered email and we&apos;ll send you a 6-digit OTP to reset your password.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => { setForgotEmail(e.target.value); setForgotError(''); }}
                      className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                      placeholder="your@email.com"
                      autoFocus
                    />
                  </div>
                  {forgotError && <p className="text-xs text-red-500 font-medium">{forgotError}</p>}
                  <button
                    type="button"
                    onClick={handleForgotSendOtp}
                    disabled={forgotSending || !forgotEmail}
                    className="w-full bg-brand hover:bg-brand-dark text-white font-medium py-3 rounded-full transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {forgotSending ? <><i className="ri-loader-4-line animate-spin" /> Sending...</> : <><i className="ri-send-plane-line" /> Send OTP</>}
                  </button>
                </div>
              </div>
            )}

            {forgotStep === 'otp' && (
              <div>
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-green-50 mb-4">
                  <i className="ri-mail-check-line text-2xl text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-charcoal">Check Your Email</h3>
                <p className="mt-1 text-sm text-gray-500 mb-1">We sent a 6-digit OTP to</p>
                <p className="text-sm font-semibold text-charcoal mb-5">{forgotEmail}</p>
                <div className="flex gap-2 justify-between mb-3">
                  {forgotOtp.map((digit, i) => (
                    <input
                      key={i}
                      id={`sfotp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleForgotOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleForgotOtpKeyDown(i, e)}
                      className="w-11 h-12 text-center bg-[#f9f9f7] rounded-xl text-base font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/40"
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-400">{forgotOtpTimer > 0 ? `Resend in ${forgotOtpTimer}s` : ''}</span>
                  {forgotOtpTimer === 0 && (
                    <button type="button" onClick={handleForgotResendOtp} disabled={forgotSending} className="text-xs text-brand hover:text-brand-dark font-medium cursor-pointer">
                      {forgotSending ? 'Sending...' : 'Resend OTP'}
                    </button>
                  )}
                </div>
                {forgotError && <p className="text-xs text-red-500 font-medium mb-3">{forgotError}</p>}
                <button
                  type="button"
                  onClick={handleForgotVerifyOtp}
                  disabled={!forgotOtpFilled || forgotLoading}
                  className="w-full bg-brand hover:bg-brand-dark text-white font-medium py-3 rounded-full transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {forgotLoading ? <><i className="ri-loader-4-line animate-spin" /> Verifying...</> : 'Verify OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => { setForgotStep('email'); setForgotOtp(['', '', '', '', '', '']); setForgotError(''); }}
                  className="w-full mt-2 text-sm text-gray-400 hover:text-charcoal transition-colors cursor-pointer py-2"
                >
                  ← Use a different email
                </button>
              </div>
            )}

            {forgotStep === 'reset' && (
              <div>
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-amber-50 mb-4">
                  <i className="ri-key-2-line text-2xl text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-charcoal">Set New Password</h3>
                <p className="mt-1 text-sm text-gray-500 mb-5">Choose a strong password with at least 8 characters.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPwd ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setForgotError(''); }}
                        className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 pr-12"
                        placeholder="Min. 8 characters"
                        autoFocus
                      />
                      <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-charcoal cursor-pointer">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <i className={`ri-${showNewPwd ? 'eye-off' : 'eye'}-line`} />
                        </div>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPwd ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setForgotError(''); }}
                        className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 pr-12"
                        placeholder="Re-enter password"
                      />
                      <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-charcoal cursor-pointer">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <i className={`ri-${showConfirmPwd ? 'eye-off' : 'eye'}-line`} />
                        </div>
                      </button>
                    </div>
                  </div>
                  {forgotError && <p className="text-xs text-red-500 font-medium">{forgotError}</p>}
                  <button
                    type="button"
                    onClick={handleForgotReset}
                    disabled={forgotLoading || !newPassword || !confirmPassword}
                    className="w-full bg-brand hover:bg-brand-dark text-white font-medium py-3 rounded-full transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? <><i className="ri-loader-4-line animate-spin" /> Updating...</> : <><i className="ri-check-line" /> Update Password</>}
                  </button>
                </div>
              </div>
            )}

            {forgotStep === 'done' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-50 mx-auto mb-4">
                  <i className="ri-checkbox-circle-fill text-4xl text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-charcoal">Password Updated!</h3>
                <p className="mt-2 text-sm text-gray-500 mb-6">
                  Your password has been reset successfully. You can now sign in with your new password.
                </p>
                <Link
                  to="/login"
                  onClick={closeForgot}
                  className="block w-full bg-brand hover:bg-brand-dark text-white font-medium py-3 rounded-full transition-colors cursor-pointer whitespace-nowrap text-center"
                >
                  Go to Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}