import type { FastifyInstance } from "fastify";

/**
 * Registry that imports and registers all tool routes.
 * Each tool uses the createToolRoute factory from tool-factory.ts.
 *
 * Tools will be added here as they are implemented in Phase 2 Tasks 4-10.
 */
export async function registerToolRoutes(app: FastifyInstance): Promise<void> {
  // Tool routes will be registered here as they are implemented.
  // Example:
  //   const { registerResizeTool } = await import("./resize.js");
  //   registerResizeTool(app);
  app.log.info("Tool routes registered");
}
