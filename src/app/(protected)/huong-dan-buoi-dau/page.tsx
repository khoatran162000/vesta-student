// FILE: src/app/(protected)/huong-dan-buoi-dau/page.tsx — Hướng dẫn nhập học buổi đầu (chỉ HS đóng phí)
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function HuongDanBuoiDauPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [html, setHtml] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "empty">("loading");

  useEffect(() => {
    if (loading) return;
    // Chặn: chỉ HS đóng phí mới xem được
    if (!user?.isPaid) { setStatus("empty"); return; }
    (async () => {
      try {
        const json = await apiFetch("/site-content/guide_first_day", { needsAuth: false });
        const content = json?.data?.data?.html || "";
        if (content) { setHtml(content); setStatus("ok"); }
        else setStatus("empty");
      } catch { setStatus("empty"); }
    })();
  }, [loading, user]);

  if (loading || status === "loading") {
    return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-gold" /></div>;
  }

  // Không phải HS đóng phí
  if (!user?.isPaid) {
    return (
      <div className="mx-auto max-w-[600px] py-20 text-center">
        <Lock size={40} className="mx-auto mb-3 text-muted" />
        <p className="text-lg font-semibold text-royal">Nội dung dành cho học viên đã ghi danh</p>
        <p className="mt-2 text-sm text-muted">Trang hướng dẫn nhập học buổi đầu chỉ hiển thị cho học viên đã hoàn tất học phí. Nếu bạn đã đăng ký, vui lòng liên hệ VESTA để được kích hoạt.</p>
        <button onClick={() => router.push("/dashboard")} className="btn-secondary mt-5">Về Tổng quan</button>
      </div>
    );
  }

  if (status === "empty" || !html) {
    return <div className="mx-auto max-w-[600px] py-20 text-center text-muted">Nội dung hướng dẫn đang được cập nhật.</div>;
  }

  return (
    <div className="-mx-4 -my-6 sm:-mx-6 lg:-mx-8">
      <iframe srcDoc={html} title="Hướng dẫn nhập học buổi đầu" className="h-[calc(100vh-2px)] w-full border-0" />
    </div>
  );
}
