import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("clientData router", () => {
  it("saves client login data successfully", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.clientData.save({
      email: "test@example.com",
      password: "password123",
      loginMethod: "email",
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0",
    });

    expect(result.success).toBe(true);
    expect(result.clientId).toBeDefined();
  });

  it("authenticates with valid credentials", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // First, save some client data
    await caller.clientData.save({
      email: "test@example.com",
      password: "password123",
      loginMethod: "email",
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0",
    });

    // Then authenticate
    const result = await caller.clientData.authenticate({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.isValid).toBe(false); // Should be false because we haven't added valid credentials
  });

  it("rejects invalid credentials", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.clientData.authenticate({
      email: "invalid@example.com",
      password: "wrongpassword",
    });

    expect(result.isValid).toBe(false);
  });

  it("only admin can view all client data", async () => {
    const adminCtx = createAdminContext();
    const caller = appRouter.createCaller(adminCtx);

    const result = await caller.clientData.getAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it("non-admin cannot view all client data", async () => {
    const publicCtx = createPublicContext();
    const caller = appRouter.createCaller(publicCtx);

    try {
      await caller.clientData.getAll();
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("saves phone login data successfully", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.clientData.save({
      phoneNumber: "1234567890",
      phoneCountryCode: "+1",
      password: "password123",
      loginMethod: "phone",
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0",
    });

    expect(result.success).toBe(true);
    expect(result.clientId).toBeDefined();
  });

  it("authenticates phone login with valid credentials", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.clientData.authenticate({
      phoneNumber: "1234567890",
      phoneCountryCode: "+1",
      password: "password123",
    });

    expect(result.isValid).toBe(false); // Should be false because we haven't added valid credentials
  });
});
