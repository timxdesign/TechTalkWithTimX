// Creates (or promotes) a Studio editor.
//   npm run editor:add -- you@example.com            → editor, random password printed once
//   npm run editor:add -- you@example.com --admin
//   npm run editor:add -- you@example.com --password "your-own-password"

import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const email = args.find((a) => a.includes("@"));
const role = args.includes("--admin") ? "admin" : "editor";
const pwIndex = args.indexOf("--password");
const password = pwIndex >= 0 ? args[pwIndex + 1] : randomBytes(12).toString("base64url");

if (!email) {
  console.error("Usage: npm run editor:add -- you@example.com [--admin] [--password ...]");
  process.exit(1);
}

const db = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Find an existing auth user with this email, or create one.
let userId;
for (let page = 1; !userId; page++) {
  const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
  if (error) throw error;
  userId = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
  if (data.users.length < 200) break;
}

let created = false;
if (!userId) {
  const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  userId = data.user.id;
  created = true;
} else if (pwIndex >= 0) {
  const { error } = await db.auth.admin.updateUserById(userId, { password });
  if (error) throw error;
}

const { error } = await db.from("editors").upsert({ user_id: userId, role }, { onConflict: "user_id" });
if (error) throw error;

console.log(`✓ ${email} is now a Studio ${role}.`);
if (created || pwIndex >= 0) {
  console.log(`  Password: ${password}`);
  console.log("  Sign in at /studio/login. Change it any time with \"Forgot password?\".");
}
