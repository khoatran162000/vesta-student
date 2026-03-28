// FILE: src/app/dang-nhap/page.tsx — Dang nhap bang ma hoc vien
"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [studentCode, setStudentCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const data = await api.post("/auth/login", { studentCode, password });
      if (data.success) {
        if (data.data.user.role !== "STUDENT") { setError("Tài khoản không phải học viên"); setLoading(false); return; }
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        window.location.href = "/dashboard";
      } else { setError(data.message); }
    } catch { setError("Lỗi kết nối server"); } finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-royal">VESTA</h1>
          <p className="mt-1 text-sm text-muted">Student Portal — Đăng nhập</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-royal">Mã học viên</label>
            <input type="text" value={studentCode} onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
              placeholder="VD: VS20250001" required className="input-field font-mono tracking-wider" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-royal">Mật khẩu</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
          <p className="text-center text-xs text-muted">Mã học viên và mật khẩu được cung cấp bởi trung tâm</p>
        </form>
      </div>
    </div>
  );
}