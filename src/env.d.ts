/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    supabase?: import("@supabase/supabase-js").SupabaseClient;
    editor?: { id: string; email: string; role: "admin" | "editor" };
  }
}

interface Window {
  __tttMotion?: boolean;
}
