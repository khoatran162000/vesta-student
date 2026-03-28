// FILE: src/app/(protected)/thong-bao/page.tsx — Thong bao hoc vien
"use client";
import { useState, useEffect } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student/notifications").then((res) => {
      if (res.success) { setNotifications(res.data); setUnread(res.unreadCount); }
    }).finally(() => setLoading(false));
  }, []);

  async function handleReadAll() {
    await api.patch("/student/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gold" /></div>;

  return (
    <div className="mx-auto max-w-[700px]">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-royal">Thông báo</h1>
          {unread > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[0.6rem] font-bold text-white">{unread} mới</span>}
        </div>
        {unread > 0 && (
          <button onClick={handleReadAll} className="btn-secondary text-xs"><CheckCheck size={13} />Đọc tất cả</button>
        )}
      </div>
      <div className="card !p-0 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="py-16 text-center"><Bell size={32} className="mx-auto mb-3 text-silver" /><p className="text-muted">Chưa có thông báo.</p></div>
        ) : (
          <div className="divide-y divide-silver/10">
            {notifications.map((n) => (
              <div key={n.id} className={`px-5 py-4 ${n.isRead ? "" : "bg-gold/5"}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-royal">{n.title}</p>
                  <span className="text-xs text-muted">{new Date(n.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{n.message}</p>
                <span className="mt-1 inline-block rounded bg-cream-dark px-2 py-0.5 text-[0.6rem] text-muted">
                  {n.type === "SYSTEM_AUTO" ? "Hệ thống" : "Giáo viên"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}