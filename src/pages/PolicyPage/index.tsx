// src/pages/PolicyVnpayPage.tsx
import {
  DownloadOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Flex, Input, Layout, message, Spin } from "antd";
import { PageTitleHOC } from "src/components/PageTitleHOC";

const PolicyPage: React.FC = () => {
  const [rawHtml, setRawHtml] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [q, setQ] = useState<string>("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  // NOTE: Đặt file bạn đã tải ở: public/vnpay.html
  const POLICY_PUBLIC_PATH = "/policy.html";

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(POLICY_PUBLIC_PATH, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();

        // Lọc bỏ script để tránh chạy JS lạ trong trang gốc
        const sanitized = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
        setRawHtml(sanitized);
      } catch (err: any) {
        console.error(err);
        message.error("Không tải được nội dung chính sách (vnpay.html).");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Tạo bản có highlight tìm kiếm đơn giản (bôi vàng)
  const highlightedHtml = useMemo(() => {
    if (!q.trim()) return rawHtml;
    try {
      const esc = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(${esc})`, "gi");
      return rawHtml.replace(
        re,
        '<mark class="policy-mark">$1</mark>'
      );
    } catch {
      return rawHtml;
    }
  }, [rawHtml, q]);

  // Cuộn tới kết quả đầu tiên khi tìm kiếm
  useEffect(() => {
    if (!q.trim()) return;
    const host = containerRef.current;
    if (!host) return;
    const first = host.querySelector(".policy-mark") as HTMLElement | null;
    if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [q]);

  return (
    <PageTitleHOC title="Chính sách bảo vệ dữ liệu cá nhân - VNPAY">
      <Layout style={{ minHeight: "100vh", background: "#0f172a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 24 }}>
          <Card
            className="accountDetail"
            style={{ overflow: "hidden" }}
            bodyStyle={{ padding: 0 }}
          >
            {loading ? (
              <div style={{ padding: 32, textAlign: "center" }}>
                <Spin />
              </div>
            ) : (
              <div
                ref={containerRef}
                className="policy-content"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            )}
          </Card>
        </div>
      </Layout>
    </PageTitleHOC>
  );
};

export default PolicyPage;
