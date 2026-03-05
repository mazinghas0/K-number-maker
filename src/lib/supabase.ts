import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://synnvxrkbuvueybxbynz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bm52eHJrYnV2dWV5YnhieW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MDUzMzQsImV4cCI6MjA4ODI4MTMzNH0.8uxGLjdFeZzlvQKhkKT-xSoE72F8wOA1K_lFoVfKtp4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
