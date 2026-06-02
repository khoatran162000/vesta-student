// FILE: src/app/(protected)/hoc-thu/page.tsx — Học thử cho học viên chưa thanh toán
"use client";
import { useAuth } from "@/hooks/useAuth";
import { PlayCircle, ExternalLink, MessageCircle } from "lucide-react";
import Link from "next/link";

// Tài liệu demo công khai (có thể đổi sang fetch từ API sau)
const TRIAL_MATERIALS = [
  {
    title: "Video giới thiệu phương pháp VESTA",
    desc: "Tổng quan về lộ trình IELTS tại trung tâm",
    url: "https://www.facebook.com/vestauni",
    icon: PlayCircle,
  },
  {
    title: "Bài giảng demo: Writing Task 2 - Argumentative",
    desc: "Xem trước cách giáo viên dạy mở bài argumentative",
    url: "#",
    icon: PlayCircle,
  },
  {
    title: "Thử bài Reading mẫu",
    desc: "Làm thử 1 đề Reading để biết trình độ hiện tại",
    url: "/de-thi",
    icon: PlayCircle,
  },
];

export default function TrialPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-[800px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-royal">Học thử miễn phí</h1>
        <p className="mt-1 text-sm text-muted">
          Trải nghiệm bài giảng demo trước khi quyết định ghi danh
        </p>
      </div>

      {/* Banner */}
      <div className="card mb-6 border-l-4 border-amber-500 bg-amber-50">
        <p className="text-sm text-amber-900">
          👋 Xin chào <strong>{user?.fullName}</strong>! Bạn đang ở chế độ <strong>học thử</strong>.
          Sau khi hoàn tất thanh toán, bạn sẽ truy cập được lộ trình đầy đủ, tài liệu lớp, và phản hồi từ giáo viên.
        </p>
      </div>

      {/* Trial materials */}
      <h2 className="mb-3 text-base font-bold text-royal">📚 Tài liệu demo</h2>
      <div className="mb-6 space-y-3">
        {TRIAL_MATERIALS.map((m, i) => (
          <a key={i} href={m.url} target={m.url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
            className="group card flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
              <m.icon size={22} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#1a1a2e]">{m.title}</p>
              <p className="text-xs text-muted">{m.desc}</p>
            </div>
            <ExternalLink size={14} className="text-muted opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        ))}
      </div>

      {/* CTA */}
      <div className="card text-center" style={{ background: "linear-gradient(135deg, #FFFBF0, #FFF5DC)" }}>
        <h3 className="mb-2 text-lg font-bold text-royal">🎓 Sẵn sàng ghi danh?</h3>
        <p className="mb-4 text-sm text-muted">
          Liên hệ giáo viên để được tư vấn lộ trình và đăng ký lớp phù hợp với trình độ của bạn.
        </p>
        <a href="https://www.facebook.com/vestauni" target="_blank" rel="noopener noreferrer"
          className="btn-primary inline-flex">
          <MessageCircle size={16} />Liên hệ tư vấn
        </a>
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        Sau khi thanh toán và được xác nhận, hệ thống sẽ tự động mở khoá các tab học chính.
      </p>
    </div>
  );
}