// FILE: src/app/(protected)/ho-so/page.tsx — Ho so hoc vien (chi cap nhat avatar)
"use client";

import { useState, useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";
import { api, getImageUrl } from "@/lib/api";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/auth/me").then((res) => { if (res.success) setUser(res.data); }).finally(() => setLoading(false));
  }, []);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setMsg("");
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("fullName", user.fullName); // giữ nguyên tên
    try {
      const data = await api.put("/auth/profile", formData);
      if (data.success) { setUser(data.data); setMsg("✅ Cập nhật ảnh đại diện thành công!"); }
      else setMsg(`❌ ${data.message}`);
    } catch { setMsg("❌ Lỗi upload"); }
    finally { setUploading(false); }
    e.target.value = "";
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gold" /></div>;
  if (!user) return null;

  return (
    <div className="mx-auto max-w-[550px]">
      <h1 className="mb-6 text-2xl font-bold text-royal">Hồ sơ cá nhân</h1>

      <div className="card space-y-5">
        {/* Avatar — có thể thay đổi */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {user.avatarUrl ? (
              <img src={getImageUrl(user.avatarUrl)} alt={user.fullName} className="h-24 w-24 rounded-full object-cover border-2 border-gold/30" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-royal/10 text-3xl font-bold text-royal">{user.fullName.charAt(0)}</div>
            )}
            <button onClick={() => document.getElementById("avatar-input")?.click()} disabled={uploading}
              className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-gold p-2 text-navy shadow-md hover:scale-110 transition-transform disabled:opacity-50">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            </button>
            <input id="avatar-input" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <p className="text-xs text-muted">Bấm vào biểu tượng máy ảnh để thay đổi ảnh đại diện</p>
        </div>

        {msg && (
          <p className={`rounded-lg px-4 py-2.5 text-center text-sm ${msg.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{msg}</p>
        )}

        {/* Thông tin cá nhân — chỉ đọc */}
        <div className="space-y-3 rounded-lg bg-cream p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Họ và tên</span>
            <span className="font-semibold text-[#1a1a2e]">{user.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Mã học viên</span>
            <span className="font-mono font-bold text-royal">{user.studentCode}</span>
          </div>
          {user.email && (
            <div className="flex justify-between">
              <span className="text-muted">Email</span>
              <span>{user.email}</span>
            </div>
          )}
          {user.phone && (
            <div className="flex justify-between">
              <span className="text-muted">Số điện thoại</span>
              <span>{user.phone}</span>
            </div>
          )}
          {user.address && (
            <div className="flex justify-between">
              <span className="text-muted">Địa chỉ</span>
              <span className="text-right max-w-[250px]">{user.address}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted">Ngày tham gia</span>
            <span>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</span>
          </div>
        </div>

        <p className="text-center text-xs text-muted">
          Thông tin cá nhân và mật khẩu được quản lý bởi trung tâm.<br />
          Liên hệ giáo viên hoặc quản trị viên để cập nhật.
        </p>
      </div>
    </div>
  );
}