import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface SoftBlockState {
  tenant_id: string;
  active: boolean;
  triggered_at: string | null;
  aadhaar_re_verified: boolean;
  additional_details_provided: boolean;
}

export default function SoftBlockPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get("tenant") ?? user?.id ?? "";
  const tenantName = user?.name ?? searchParams.get("name") ?? "Your Account";

  const [state, setState] = useState<SoftBlockState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchState = async () => {
      await new Promise((res) => setTimeout(res, 300));
      setState({
        tenant_id: tenantId,
        active: true,
        triggered_at: new Date().toISOString(),
        aadhaar_re_verified: false,
        additional_details_provided: false,
      });
      setLoading(false);
    };
    fetchState();
  }, [tenantId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <i className="ri-loader-4-line animate-spin" />
          Loading restriction status...
        </div>
      </div>
    );
  }

  const resolved = state?.aadhaar_re_verified && state?.additional_details_provided;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto flex items-center justify-center rounded-2xl bg-red-50 mb-5">
            <i className="ri-shield-cross-line text-3xl text-red-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-charcoal">Account Restricted</h1>
          <p className="mt-2 text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
            {tenantName}, your ability to contact landlords has been temporarily restricted due to multiple owner reports.
          </p>
        </div>

        <div className="space-y-4">
          {/* Step 1 */}
          <div
            className={`rounded-xl border p-5 ${state?.aadhaar_re_verified ? "border-green-200 bg-green-50" : "border-gray-100 bg-white"}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 mt-0.5 ${state?.aadhaar_re_verified ? "bg-green-500 text-white" : "bg-red-100 text-red-600"}`}
              >
                {state?.aadhaar_re_verified ? <i className="ri-check-line" /> : "1"}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-charcoal">Re-verify Aadhaar</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Confirm your identity with a fresh OTP verification. This helps us ensure the account belongs to a genuine renter.
                </p>
                {!state?.aadhaar_re_verified && (
                  <Link
                    to="/aadhaar-verify"
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors whitespace-nowrap"
                  >
                    Verify Aadhaar <i className="ri-arrow-right-line text-xs" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div
            className={`rounded-xl border p-5 ${state?.additional_details_provided ? "border-green-200 bg-green-50" : "border-gray-100 bg-white"}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 mt-0.5 ${state?.additional_details_provided ? "bg-green-500 text-white" : "bg-red-100 text-red-600"}`}
              >
                {state?.additional_details_provided ? <i className="ri-check-line" /> : "2"}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-charcoal">Provide Additional Details</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Share your employer name, office address, a reference contact, and the purpose of your rental search. This helps us verify your renting intent.
                </p>
                {!state?.additional_details_provided && (
                  <Link
                    to="/aadhaar-verify"
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-charcoal hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    Submit Details <i className="ri-arrow-right-line text-xs" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {resolved && (
          <div className="mt-6 text-center rounded-xl bg-green-50 border border-green-100 p-5">
            <div className="w-10 h-10 flex items-center justify-center mx-auto rounded-full bg-green-100 mb-2">
              <i className="ri-checkbox-circle-line text-lg text-green-600" />
            </div>
            <p className="text-sm font-bold text-charcoal">All Steps Completed</p>
            <p className="text-xs text-gray-400 mt-1">
              Our team is reviewing your submission. You will be notified within 24 hours.
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-300">
            Restricted on {state?.triggered_at ? new Date(state.triggered_at).toLocaleDateString("en-IN") : "—"}
          </p>
          <Link
            to="/contact"
            className="mt-2 inline-block text-xs text-gray-400 hover:text-charcoal transition-colors underline underline-offset-2"
          >
            Need help? Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}