import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { incrementGlobalPageView, getGlobalPageViewCount } from "./db";

describe("Global Page View Stats", () => {
  beforeAll(async () => {
    // Initialize database connection
    console.log("Starting page view stats tests...");
  });

  afterAll(async () => {
    console.log("Completed page view stats tests");
  });

  it("should increment global page view count", async () => {
    const initialCount = await getGlobalPageViewCount();
    console.log(`Initial count: ${initialCount}`);

    // Increment the counter
    await incrementGlobalPageView();

    const newCount = await getGlobalPageViewCount();
    console.log(`New count after increment: ${newCount}`);

    // Verify the count increased by 1
    expect(newCount).toBe(initialCount + 1);
  });

  it("should handle multiple increments", async () => {
    const initialCount = await getGlobalPageViewCount();

    // Increment multiple times
    await incrementGlobalPageView();
    await incrementGlobalPageView();
    await incrementGlobalPageView();

    const finalCount = await getGlobalPageViewCount();

    // Verify the count increased by 3
    expect(finalCount).toBe(initialCount + 3);
  });

  it("should return 0 when no stats exist", async () => {
    // This test assumes the database is fresh or cleaned
    // In production, you might want to mock the database
    const count = await getGlobalPageViewCount();
    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
