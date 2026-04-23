export const ENV = {
  // Core
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  
  // Optional: OpenAI API for AI features
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  
  // Admin registration
  adminRegisterSecret: process.env.ADMIN_REGISTER_SECRET ?? "altyn-admin-2024",
  
  // Legacy Manus variables (for backward compatibility, but no longer used)
  appId: process.env.VITE_APP_ID ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
