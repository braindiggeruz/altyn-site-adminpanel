import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../drizzle/schema";
import bcrypt from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://altyn:AltynDB2024SecurePass@shinkansen.proxy.rlwy.net:21223/altyn_bot";

async function initDb() {
  console.log("🔧 Инициализирую БД...");
  
  try {
    const client = postgres(DATABASE_URL);
    const db = drizzle(client);
    
    // Создать первого admin пользователя
    const passwordHash = await bcrypt.hash("Admin@123456", 12);
    
    const result = await db
      .insert(users)
      .values({
        email: "admin@altyn-therapy.uz",
        name: "Admin",
        passwordHash,
        openId: "local_admin@altyn-therapy.uz",
        loginMethod: "local",
        role: "admin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing()
      .returning({ id: users.id, email: users.email });
    
    if (result.length > 0) {
      console.log("✅ Admin пользователь создан:", result[0]);
    } else {
      console.log("ℹ️ Admin пользователь уже существует");
    }
    
    await client.end();
    console.log("✅ БД инициализирована успешно!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Ошибка инициализации БД:", error);
    process.exit(1);
  }
}

initDb();
