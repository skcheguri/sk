import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

type AuthTab = 'email' | 'mobile';
type ForgotStep = 'email' | 'otp' | 'reset' | 'done';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'owner' | null>(null);
  const [tab, setTab] = useState<AuthTab>('email');
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // Redirect when logged in
  useEffect(() => {
    if (user) {
      navigate('/listings');
    }
  }, [user, navigate]);

  // Email login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Mobile OTP state
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);

  // Google sign-in state
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const handleGoogleSignIn = async () => {
    setGoogleError('Google sign-in is not yet available. Please use email + password.');
  };

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setLoginError('');
    setLoginLoading(true);
    const { error } = await signIn(email, password, 'tenant');
    setLoginLoading(false);
    if (error) setLoginError(error);
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
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setLoginLoading(true);
    setLoginError('Mobile OTP login is not yet connected to the backend. Please use email + password.');
    setLoginLoading(false);
  };

  const otpFilled = otp.every((d) => d !== '');

  // Forgot password handlers
  const openForgot = () => {
    setShowForgot(true);
    setForgotStep('email');
    setForgotEmail('');
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
      document.getElementById(`fotp-${index + 1}`)?.focus();
    }
  };

  const handleForgotOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !forgotOtp[index] && index > 0) {
      document.getElementById(`fotp-${index - 1}`)?.focus();
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
    <div className="min-h-screen bg-[#f9f9f7] flex pt-20 pb-10">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-charcoal relative overflow-hidden p-10">
        <img
          src="https://readdy.ai/api/search-image?query=modern%20Indian%20apartment%20building%20exterior%20architecture%20warm%20tones%20urban%20residential%20complex%20beautiful%20facade%20evening%20light%20minimal&width=420&height=900&seq=login-side&orientation=portrait"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-top opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/40 to-charcoal/80" />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://storage.readdy-site.link/project_files/2a4bc4d8-2b56-4cda-b6f5-ac9c2ebbfa8f/4ea9883a-4467-42fc-9416-153bac5fcc0f_log.png?v=6dcc801a33c8ab9acb1484d2408c7c4a"
              alt="Bhavan"
              className="h-9 w-9 object-contain brightness-0 invert"
            />
            <span className="text-xl font-bold text-white">Bhavan</span>
          </Link>
        </div>
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white leading-snug">
              India's most trusted<br />broker-free rental platform
            </h2>
            <p className="mt-3 text-white/60 text-sm leading-relaxed">
              Verified owners. Verified tenants. Zero brokers. Direct connections that save you time and money.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { icon: 'ri-shield-check-fill', text: 'Aadhaar-verified users only' },
              { icon: 'ri-forbid-2-fill', text: 'Strictly no brokers or agents' },
              { icon: 'ri-price-tag-3-line', text: 'Free to list, free to search' },
              { icon: 'ri-file-text-line', text: 'Digital rental agreements' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 flex-shrink-0">
                  <i className={`${item.icon} text-sm text-brand`} />
                </div>
                <span className="text-sm text-white/70">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">

          {/* Step 1 — Role selector */}
          {!selectedRole ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="text-center mb-6">
                <img
                  src="https://storage.readdy-site.link/project_files/2a4bc4d8-2b56-4cda-b6f5-ac9c2ebbfa8f/4ea9883a-4467-42fc-9416-153bac5fcc0f_log.png?v=6dcc801a33c8ab9acb1484d2408c7c4a"
                  alt="Bhavan"
                  className="h-11 w-11 object-contain mx-auto"
                />
                <h1 className="mt-3 text-2xl font-bold text-charcoal">Welcome Back</h1>
                <p className="mt-1 text-sm text-gray-500">How are you signing in today?</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Tenant card */}
                <button
                  onClick={() => setSelectedRole('tenant')}
                  className="group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-gray-100 hover:border-brand hover:bg-brand/5 transition-all cursor-pointer"
                >
                  <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-brand/10 group-hover:bg-brand/20 transition-colors">
                    <i className="ri-home-heart-line text-2xl text-brand" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-charcoal">I'm a Tenant</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Looking for a place to rent</p>
                  </div>
                  <div className="w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-brand text-white text-xs font-semibold group-hover:bg-brand-dark transition-colors whitespace-nowrap">
                    Sign in as Tenant
                    <i className="ri-arrow-right-line text-xs" />
                  </div>
                </button>

                {/* Owner card */}
                <button
                  onClick={() => setSelectedRole('owner')}
                  className="group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-gray-100 hover:border-amber-400 hover:bg-amber-50/50 transition-all cursor-pointer"
                >
                  <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-amber-50 group-hover:bg-amber-100 transition-colors">
                    <i className="ri-building-4-line text-2xl text-amber-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-charcoal">I'm an Owner</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Managing my properties</p>
                  </div>
                  <div className="w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold group-hover:bg-amber-600 transition-colors whitespace-nowrap">
                    Sign in as Owner
                    <i className="ri-arrow-right-line text-xs" />
                  </div>
                </button>
              </div>

              <p className="mt-5 text-center text-sm text-gray-500">
                New to Bhavan?{' '}
                <Link to="/signup" className="text-brand hover:text-brand-dark font-semibold">
                  Create an account
                </Link>
              </p>
            </div>
          ) : (
            /* Step 2 — Login form */
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              {/* Role badge + back */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => { setSelectedRole(null); setLoginError(''); }}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-charcoal transition-colors cursor-pointer"
                >
                  <i className="ri-arrow-left-line" /> Back
                </button>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                  selectedRole === 'owner'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-brand/10 text-brand border border-brand/20'
                }`}>
                  <i className={selectedRole === 'owner' ? 'ri-building-4-line' : 'ri-home-heart-line'} />
                  Signing in as {selectedRole === 'owner' ? 'Property Owner' : 'Tenant'}
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-charcoal">
                  {selectedRole === 'owner' ? 'Owner Sign In' : 'Tenant Sign In'}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedRole === 'owner'
                    ? 'Access your properties, tenants and listings'
                    : 'Access your rent tools, maintenance and documents'}
                </p>
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-white hover:bg-[#f9f9f7] transition-colors py-3 rounded-xl text-sm font-medium text-charcoal cursor-pointer whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed relative"
              >
                {googleLoading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-base text-gray-400" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google"
                      className="w-5 h-5"
                    />
                    Continue with Google
                  </>
                )}
              </button>
              {googleError && (
                <p className="text-xs text-red-500 font-medium text-center -mt-1">{googleError}</p>
              )}

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Email / Mobile tab */}
              <div className="flex bg-[#f9f9f7] rounded-full p-1 mb-5">
                <button
                  type="button"
                  onClick={() => setTab('email')}
                  className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                    tab === 'email' ? 'bg-white text-charcoal' : 'text-gray-500 hover:text-charcoal'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <i className="ri-mail-line text-sm" /> Email
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
                    <i className="ri-smartphone-line text-sm" /> Mobile OTP
                  </span>
                </button>
              </div>

              {/* Email Form */}
              {tab === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
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
                        className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 pr-12"
                        placeholder="Enter your password"
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
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={openForgot}
                      className="text-sm text-brand hover:text-brand-dark font-medium cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  {loginError && (
                    <p className="text-xs text-red-500 font-medium">{loginError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className={`w-full text-white font-medium py-3.5 rounded-full transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-2 ${
                      selectedRole === 'owner'
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : 'bg-brand hover:bg-brand-dark'
                    }`}
                  >
                    {loginLoading && <i className="ri-loader-4-line animate-spin" />}
                    Sign In
                  </button>
                </form>
              )}

              {/* Mobile OTP Form */}
              {tab === 'mobile' && (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">Mobile Number</label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-3 bg-[#f9f9f7] rounded-xl text-sm text-charcoal font-medium min-w-[64px]">
                        <i className="ri-flag-line text-xs" /> +91
                      </div>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        required
                        disabled={otpSent}
                        className="flex-1 px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-60"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>

                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={mobile.length < 10 || sendingOtp}
                      className={`w-full text-white font-medium py-3.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                        selectedRole === 'owner' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand hover:bg-brand-dark'
                      }`}
                    >
                      {sendingOtp ? <><i className="ri-loader-4-line animate-spin" /> Sending OTP...</> : <><i className="ri-send-plane-line" /> Send OTP</>}
                    </button>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-charcoal">Enter OTP</label>
                          <span className="text-xs text-gray-500">
                            Sent to +91 {mobile}
                            <button type="button" onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); }} className="ml-2 text-brand hover:text-brand-dark font-medium cursor-pointer">Change</button>
                          </span>
                        </div>
                        <div className="flex gap-2 justify-between">
                          {otp.map((digit, i) => (
                            <input
                              key={i}
                              id={`otp-${i}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(i, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(i, e)}
                              className="w-11 h-12 text-center bg-[#f9f9f7] rounded-xl text-base font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/40"
                            />
                          ))}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-400">{otpTimer > 0 ? `Resend in ${otpTimer}s` : ''}</span>
                          {otpTimer === 0 && (
                            <button type="button" onClick={handleSendOtp} className="text-xs text-brand hover:text-brand-dark font-medium cursor-pointer">Resend OTP</button>
                          )}
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={!otpFilled || loginLoading}
                        className={`w-full text-white font-medium py-3.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap ${
                          selectedRole === 'owner' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand hover:bg-brand-dark'
                        }`}
                      >
                        Verify &amp; Sign In
                      </button>
                    </>
                  )}
                </form>
              )}

              <p className="mt-6 text-center text-sm text-gray-500">
                New to Bhavan?{' '}
                <Link to="/signup" className="text-brand hover:text-brand-dark font-semibold">
                  Create an account
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Forgot Password Modal ── */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeForgot} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-7 border border-gray-100">

            {/* Close */}
            <button
              onClick={closeForgot}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-charcoal hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-lg" />
            </button>

            {/* Step: Email */}
            {forgotStep === 'email' && (
              <div>
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-brand/10 mb-4">
                  <i className="ri-lock-password-line text-2xl text-brand" />
                </div>
                <h3 className="text-lg font-bold text-charcoal">Forgot Password?</h3>
                <p className="mt-1 text-sm text-gray-500 mb-5">
                  Enter your registered email and we'll send you a 6-digit OTP to reset your password.
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

            {/* Step: OTP */}
            {forgotStep === 'otp' && (
              <div>
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-green-50 mb-4">
                  <i className="ri-mail-check-line text-2xl text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-charcoal">Check Your Email</h3>
                <p className="mt-1 text-sm text-gray-500 mb-1">
                  We sent a 6-digit OTP to
                </p>
                <p className="text-sm font-semibold text-charcoal mb-5">{forgotEmail}</p>

                <div className="flex gap-2 justify-between mb-3">
                  {forgotOtp.map((digit, i) => (
                    <input
                      key={i}
                      id={`fotp-${i}`}
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
                  <span className="text-xs text-gray-400">
                    {forgotOtpTimer > 0 ? `Resend in ${forgotOtpTimer}s` : ''}
                  </span>
                  {forgotOtpTimer === 0 && (
                    <button
                      type="button"
                      onClick={handleForgotResendOtp}
                      disabled={forgotSending}
                      className="text-xs text-brand hover:text-brand-dark font-medium cursor-pointer"
                    >
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

            {/* Step: Reset */}
            {forgotStep === 'reset' && (
              <div>
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-amber-50 mb-4">
                  <i className="ri-key-2-line text-2xl text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-charcoal">Set New Password</h3>
                <p className="mt-1 text-sm text-gray-500 mb-5">
                  Choose a strong password with at least 8 characters.
                </p>
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

            {/* Step: Done */}
            {forgotStep === 'done' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-50 mx-auto mb-4">
                  <i className="ri-checkbox-circle-fill text-4xl text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-charcoal">Password Updated!</h3>
                <p className="mt-2 text-sm text-gray-500 mb-6">
                  Your password has been reset successfully. You can now sign in with your new password.
                </p>
                <button
                  type="button"
                  onClick={closeForgot}
                  className="w-full bg-brand hover:bg-brand-dark text-white font-medium py-3 rounded-full transition-colors cursor-pointer whitespace-nowrap"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}