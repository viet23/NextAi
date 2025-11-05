// src/components/ChatWidget/ChatWidget.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Avatar, Spin, Badge, Tooltip } from "antd";
import { SendOutlined, CloseOutlined, MessageOutlined, MinusOutlined } from "@ant-design/icons";
import "./chat-widget.css";

// Thêm đoạn này TRƯỚC export default ChatWidget;
const style = document.createElement("style");
style.innerHTML = `
  .chat-input-field::placeholder {
    color: #ffffff !important;
    opacity: 0.8;
  }
`;
document.head.appendChild(style);


export type ChatMessage = { id: string; role: "user" | "assistant" | "system"; content: string };

export interface ChatWidgetProps {
  title?: string;
  systemPrompt?: string;
  endpoint?: string;
  defaultOpen?: boolean;
  position?: { right?: number; bottom?: number };
  zIndex?: number;
}

const sanitize = (html: string) =>
  html.replace(/<script/gi, "&lt;script").replace(/<iframe/gi, "&lt;iframe");

// CRA: webpack sẽ replace env ở build-time
const API_KEY = (process.env.REACT_APP_OPENAI_API_KEY as string) || "";
const MODEL = "gpt-5";

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
  const visible = useMemo(() => messages.filter((m) => m.role !== "system"), [messages]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [visible.length, loading]);

  /** ✅ Hàm gọi OpenAI Responses API (gpt-5) và parse đúng output */
  async function callOpenAI(inputItems: { role: string; content: string }[]) {
    if (!API_KEY) throw new Error("Thiếu REACT_APP_OPENAI_API_KEY trong .env");

    const body: Record<string, any> = { model: MODEL, input: inputItems };
    if (lastResponseIdRef.current) body.previous_response_id = lastResponseIdRef.current;

    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`OpenAI HTTP ${res.status}: ${t}`);
    }

    const data = await res.json();
    if (data?.id) lastResponseIdRef.current = String(data.id);

    // ✅ GPT-5 Responses format: output[] -> type: "message" -> content[].text
    const messagePart = data.output?.find((o: any) => o.type === "message");
    const textPart = messagePart?.content?.find((c: any) => c.type === "output_text")?.text;

    return textPart || "";
  }

  const send = async () => {
    const content = draft.trim();
    if (!content || loading) return;

    setApiError(null);
    const userMsg: ChatMessage = { id: `${Date.now()}-u`, role: "user", content };
    setDraft("");
    setMessages((p) => [...p, userMsg]);

    try {
      setLoading(true);
      const isFirstTurn = !lastResponseIdRef.current;
      const input = isFirstTurn
        ? [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          ...visible.concat(userMsg).map(({ role, content }) => ({ role, content })),
        ]
        : [{ role: "user", content }];

      const reply = await callOpenAI(input);
      const safe = reply || "Xin lỗi, hiện không nhận được phản hồi.";
      setMessages((p) => [...p, { id: `${Date.now()}-a`, role: "assistant", content: safe }]);
      if (!open) setUnread((n) => n + 1);
    } catch (e: any) {
      const msg =
        "Có lỗi khi gọi OpenAI trực tiếp từ trình duyệt.\n" +
        "- Kiểm tra API key và hạn mức.\n" +
        "- Có thể bị chặn CORS tùy thời điểm/chính sách.\n" +
        "Khuyên dùng serverless endpoint cho sản xuất.";
      setApiError(e?.message || "Lỗi không xác định");
      setMessages((p) => [...p, { id: `${Date.now()}-e`, role: "assistant", content: msg }]);
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
            {visible.length === 0 && (
              <div className="chat-empty">
                {API_KEY ? "Hãy hỏi tôi bất cứ điều gì…" : "Thiếu REACT_APP_OPENAI_API_KEY trong .env"}
              </div>
            )}
            {visible.map((m) => (
              <div key={m.id} className={`msg ${m.role}`}>
                {m.role === "assistant" && <Avatar size={26} className="av">AI</Avatar>}
                <div className="bubble" dangerouslySetInnerHTML={{ __html: sanitize(m.content) }} />
              </div>
            ))}
            {loading && <div className="typing"><Spin size="small" /> đang soạn…</div>}
            {apiError && <div className="chat-error" style={{ color: "#cf1322", whiteSpace: "pre-wrap" }}>{apiError}</div>}
          </div>

          <div className="chat-input">
            <Input
              placeholder={API_KEY ? "Nhập tin nhắn và nhấn Enter…" : "Thiếu REACT_APP_OPENAI_API_KEY trong .env"}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={loading || !API_KEY}
              style={{
                backgroundColor: "#1f1f1f", // nền tối
                color: "#fff",              // chữ trắng khi gõ
                borderColor: "#333",
              }}
              className="chat-input-field"
            />

            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={send}
              disabled={loading || !draft.trim() || !API_KEY}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
