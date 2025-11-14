// src/components/ChatWidget/ChatWidget.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Avatar, Spin, Badge, Tooltip } from "antd";
import {
  SendOutlined,
  CloseOutlined,
  MessageOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import "./chat-widget.css";
import { useOpenaiChatWidgetMutation } from "src/store/api/openaiApi";

// Thêm đoạn này TRƯỚC export default ChatWidget;
const style = document.createElement("style");
style.innerHTML = `
  .chat-input-field::placeholder {
    color: #ffffff !important;
    opacity: 0.8;
  }
`;
document.head.appendChild(style);

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

export interface ChatWidgetProps {
  title?: string;
  systemPrompt?: string;
  /** Giữ lại prop endpoint nếu sau này muốn override route BE, hiện tại chưa dùng */
  endpoint?: string;
  defaultOpen?: boolean;
  position?: { right?: number; bottom?: number };
  zIndex?: number;
}

const sanitize = (html: string) =>
  html.replace(/<script/gi, "&lt;script").replace(/<iframe/gi, "&lt;iframe");

const ChatWidget: React.FC<ChatWidgetProps> = ({
  title = "Trợ lý AI",
  systemPrompt,
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
  const [apiError, setApiError] = useState<string | null>(null);

  const lastResponseIdRef = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const visible = useMemo(
    () => messages.filter((m) => m.role !== "system"),
    [messages]
  );

  // RTK Query mutation gọi BE: /api/v1/openai/chat-widget
  const [openaiChatWidget] = useOpenaiChatWidgetMutation();

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

    setApiError(null);
    const userMsg: ChatMessage = {
      id: `${Date.now()}-u`,
      role: "user",
      content,
    };
    setDraft("");
    setMessages((p) => [...p, userMsg]);

    try {
      setLoading(true);

      const isFirstTurn = !lastResponseIdRef.current;

      // Build lịch sử gửi lên BE
      const inputMessages =
        isFirstTurn
          ? [
              ...(systemPrompt
                ? [{ role: "system", content: systemPrompt }]
                : []),
              ...visible
                .concat(userMsg)
                .map(({ role, content }) => ({ role, content })),
            ]
          : [{ role: "user", content }];

      const res = await openaiChatWidget({
        messages: inputMessages,
        previousResponseId: lastResponseIdRef.current,
      }).unwrap();

      if (res.responseId) {
        lastResponseIdRef.current = res.responseId;
      }

      const safe =
        res.reply || "Xin lỗi, hiện không nhận được phản hồi.";
      setMessages((p) => [
        ...p,
        { id: `${Date.now()}-a`, role: "assistant", content: safe },
      ]);
      if (!open) setUnread((n) => n + 1);
    } catch (e: any) {
      console.error("ChatWidget error:", e);
      const msg =
        "Có lỗi khi gọi API backend.\n" +
        "- Kiểm tra server / route / OPENAI_API_KEY.\n" +
        "- Khuyên dùng serverless endpoint cho sản xuất.";
      setApiError(e?.data?.error || e?.message || "Lỗi không xác định");
      setMessages((p) => [
        ...p,
        { id: `${Date.now()}-e`, role: "assistant", content: msg },
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
    <div
      className="chat-widget-root"
      style={{ right: position.right, bottom: position.bottom, zIndex }}
    >
      {!open && (
        <Badge count={unread} overflowCount={9} offset={[0, 6]}>
          <Button
            size="large"
            type="primary"
            className="chat-toggle"
            icon={<MessageOutlined />}
            onClick={() => setOpen(true)}
          >
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
                <div className="online">
                  <span className="dot" /> Online
                </div>
              </div>
            </div>
            <div className="chat-header-actions">
              <Tooltip title="Thu nhỏ">
                <Button
                  type="text"
                  size="small"
                  icon={<MinusOutlined />}
                  onClick={() => setOpen(false)}
                />
              </Tooltip>
              <Tooltip title="Đóng">
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => setOpen(false)}
                />
              </Tooltip>
            </div>
          </div>

          <div className="chat-list" ref={listRef}>
            {visible.length === 0 && (
              <div className="chat-empty">
                Hãy hỏi tôi bất cứ điều gì…
              </div>
            )}
            {visible.map((m) => (
              <div key={m.id} className={`msg ${m.role}`}>
                {m.role === "assistant" && (
                  <Avatar size={26} className="av">
                    AI
                  </Avatar>
                )}
                <div
                  className="bubble"
                  dangerouslySetInnerHTML={{ __html: sanitize(m.content) }}
                />
              </div>
            ))}
            {loading && (
              <div className="typing">
                <Spin size="small" /> đang soạn…
              </div>
            )}
            {apiError && (
              <div
                className="chat-error"
                style={{ color: "#cf1322", whiteSpace: "pre-wrap" }}
              >
                {apiError}
              </div>
            )}
          </div>

          <div className="chat-input">
            <Input
              placeholder="Nhập tin nhắn và nhấn Enter…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={loading}
              style={{
                backgroundColor: "#1f1f1f", // nền tối
                color: "#fff", // chữ trắng
                borderColor: "#333",
              }}
              className="chat-input-field"
            />

            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={send}
              disabled={loading || !draft.trim()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
