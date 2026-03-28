// FILE: src/hooks/useAuth.ts — Auth hook cho Student
"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export interface AuthUser {
  id: string; email: string | null; studentCode: string | null;
  fullName: string; role: string; avatarUrl: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) { setLoading(false); return; }
        const data = await api.get("/auth/me");
        if (data.success) setUser(data.data);
      } catch {} finally { setLoading(false); }
    }
    fetchUser();
  }, []);
  function logout() { localStorage.removeItem("accessToken"); localStorage.removeItem("refreshToken"); window.location.href = "/dang-nhap"; }
  return { user, loading, logout };
}