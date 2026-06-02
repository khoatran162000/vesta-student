// FILE: src/hooks/useAuth.ts — GHI ĐÈ
// Mở rộng AuthUser với course + regStatus + isPaid để phân biệt paid/unpaid
"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export interface AuthUser {
  id: string;
  email: string | null;
  studentCode: string | null;
  fullName: string;
  role: string;
  avatarUrl: string | null;
  course?: string | null;
  regStatus?: string | null;
  isPaid?: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoading(false);
          return;
        }
        const data = await api.get("/auth/me");
        if (data.success) {
          const u: AuthUser = data.data;
          // Học viên đã thanh toán: regStatus = CONFIRMED hoặc PAID
          u.isPaid = u.regStatus === "CONFIRMED" || u.regStatus === "PAID";
          setUser(u);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/dang-nhap";
  }

  return { user, loading, logout };
}