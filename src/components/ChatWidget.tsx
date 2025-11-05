// ChatWidget.tsx (đặt tại src/components/ChatWidget/ChatWidget.tsx)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Avatar, Spin, Badge, Tooltip } from "antd";
import { SendOutlined, CloseOutlined, MessageOutlined, MinusOutlined } from "@ant-design/icons";
import "./chat-widget.css";

export type ChatMessage = { id: string; role: "user" | "assistant" | "system"; content: string };

export interface ChatWidgetProps {
  /** Tiêu đề header */
  title?: string;
  /** System prompt để định hướng bot */
  systemPrompt?: string;
  /** Endpoint server proxy tới ChatGPT (mặc định: /api/chat) */
  endpoint?: string;
  /** Bật sẵn khi mount */
  defaultOpen?: boolean;
  /** Vị trí nút/khung chat */
  position?: { right?: number; bottom?: number };
  /** Z-index nếu trang có overlay cao */
  zIndex?: number;
}

const sanitize = (html: string) => html.replace(/<script/gi, "&lt;script").replace(/<iframe/gi, "&lt;iframe");

const ChatWidget: React.FC<ChatWidgetProps> = ({
  title = "Trợ lý AI",
  systemPrompt,
  endpoint = "/api/chat",
  defaultOpen = false,
  position = { right: 18, bottom: 18 },
  zIndex = 1000,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<ChatMessage[]>(
    systemPrompt ? [{ id: "sys", role: "system", content: systemPrompt }] : []
  );
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(() => messages.filter((m) => m.role !== "system"), [messages]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [visible.length, loading]);

  const send = async () => {
    const content = draft.trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = { id: `${Date.now()}-u`, role: "user", content };
    setDraft("");
    setMessages((p) => [...p, userMsg]);

    try {
      setLoading(true);
      const body = {
        messages: visible.concat(userMsg).map(({ role, content }) => ({ role, content })),
        system: systemPrompt,
      };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const reply: string = data?.reply ?? "Xin lỗi, hiện không nhận được phản hồi.";
      setMessages((p) => [...p, { id: `${Date.now()}-a`, role: "assistant", content: reply }]);
      if (!open) setUnread((n) => n + 1);
    } catch (e: any) {
      setMessages((p) => [
        ...p,
        {
          id: `${Date.now()}-e`,
          role: "assistant",
          content: "Có lỗi khi gọi API. Vui lòng thử lại hoặc kiểm tra máy chủ /api/chat.",
        },
      ]);
      if (!open) setUnread((n) => n + 1);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="chat-widget-root" style={{ right: position.right, bottom: position.bottom, zIndex }}>
      {!open && (
        <Badge count={unread} overflowCount={9} offset={[0, 6]}>
          <Button size="large" type="primary" className="chat-toggle" icon={<MessageOutlined />} onClick={() => setOpen(true)}>
            Chat
          </Button>
        </Badge>
      )}

      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-left">
              <Avatar size={28}>AI</Avatar>
              <div className="chat-title">
                <div className="name">{title}</div>
                <div className="online"><span className="dot" /> Online</div>
              </div>
            </div>
            <div className="chat-header-actions">
              <Tooltip title="Thu nhỏ">
                <Button type="text" size="small" icon={<MinusOutlined />} onClick={() => setOpen(false)} />
              </Tooltip>
              <Tooltip title="Đóng">
                <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setOpen(false)} />
              </Tooltip>
            </div>
          </div>

          <div className="chat-list" ref={listRef}>
            {visible.length === 0 && <div className="chat-empty">Hãy hỏi tôi bất cứ điều gì…</div>}
            {visible.map((m) => (
              <div key={m.id} className={`msg ${m.role}`}>
                {m.role === "assistant" && <Avatar size={26} className="av">AI</Avatar>}
                <div className="bubble" dangerouslySetInnerHTML={{ __html: sanitize(m.content) }} />
              </div>
            ))}
            {loading && (
              <div className="typing"><Spin size="small" /> đang soạn…</div>
            )}
          </div>

          <div className="chat-input">
            <Input placeholder="Nhập tin nhắn và nhấn Enter…" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKeyDown} disabled={loading} />
            <Button type="primary" icon={<SendOutlined />} onClick={send} disabled={loading || !draft.trim()} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;

