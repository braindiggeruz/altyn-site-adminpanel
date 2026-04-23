import postgres from "postgres";

const sql = postgres('postgresql://altyn:AltynDB2024SecurePass@shinkansen.proxy.rlwy.net:21223/altyn_bot');

async function initDb() {
  try {
    console.log('🔧 Инициализирую БД на Railway...');
    
    // Пересоздать таблицу users
    console.log('📝 Пересоздаю таблицу users...');
    await sql.unsafe(`DROP TABLE IF EXISTS "users" CASCADE`);
    
    await sql.unsafe(`
      CREATE TABLE "users" (
        "id" serial PRIMARY KEY,
        "openId" varchar(255) NOT NULL UNIQUE,
        "name" varchar(255),
        "email" varchar(255) NOT NULL UNIQUE,
        "passwordHash" varchar(255),
        "loginMethod" varchar(50) DEFAULT 'local',
        "role" varchar(50) DEFAULT 'user',
        "isActive" boolean DEFAULT true,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "lastSignedIn" timestamp
      )
    `);
    
    console.log('✅ Таблица users создана');
    
    // Создать первого admin пользователя
    console.log('👤 Создаю admin пользователя...');
    await sql.unsafe(`
      INSERT INTO "users" (
        "openId", "name", "email", "passwordHash", "loginMethod", "role", "isActive"
      ) VALUES (
        'local_admin@altyn-therapy.uz',
        'Admin',
        'admin@altyn-therapy.uz',
        '$2b$12$Av7QZqzyCSCPpcYXDhTmBOIhjq4z4dyjdbJZMewDRUnI8/AzjR5eW',
        'local',
        'admin',
        true
      )
    `);
    
    console.log('✅ Admin пользователь создан!');
    console.log('');
    console.log('🎉 БД инициализирована успешно!');
    console.log('');
    console.log('📧 Email: admin@altyn-therapy.uz');
    console.log('🔑 Пароль: Admin@123456');
    
    await sql.end();
    process.exit(0);
  } catch (e) {
    console.error('❌ Ошибка:', (e as Error).message);
    process.exit(1);
  }
}

initDb();
