"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supportTicketSchema } from "@/lib/validation/common";
import { z } from "zod";
import { Headphones, Mail, Phone, MessageSquare, Plus, X, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { createTicket } from "@/features/support";

type TicketFormValues = z.infer<typeof supportTicketSchema>;

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  time: string;
}

export default function SupportView() {
  const t = useTranslations("customer.support");
  const validation = useTranslations("validation");

  const [tickets, setTickets] = useState(() => [
    {
      id: "tkt-9021",
      subject: t("ticketDelayed"),
      status: "open",
      date: t("ticketDate1"),
      shipmentId: "SC-00412",
    },
    {
      id: "tkt-8810",
      subject: t("ticketCashback"),
      status: "resolved",
      date: t("ticketDate2"),
      shipmentId: "SC-00408",
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
    {
      id: "m1",
      sender: "agent",
      text: t("welcome"),
      time: t("justNow"),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showLiveChat) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, showLiveChat, isTyping]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TicketFormValues>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: { subject: "", category: "delay", shipmentId: "", message: "" },
  });

  const handleCreateTicket = async (data: TicketFormValues) => {
    setSubmittingTicket(true);
    try {
      await createTicket({
        subject: data.subject,
        category: data.category,
        message: data.message,
        shipmentId: data.shipmentId,
      });
      const newTicket = {
        id: `tkt-${9022 + tickets.length}`,
        subject: data.subject,
        status: "open",
        date: t("ticketDateNew"),
        shipmentId: data.shipmentId,
      };
      setTickets((prev) => [newTicket, ...prev]);
      reset();
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create support ticket, using mock fallback:", err);
      const newTicket = {
        id: `tkt-${9022 + tickets.length}`,
        subject: data.subject,
        status: "open",
        date: t("ticketDateNew"),
        shipmentId: data.shipmentId,
      };
      setTickets((prev) => [newTicket, ...prev]);
      reset();
      setShowCreateModal(false);
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const inputVal = chatInput.toLowerCase();
    setChatInput("");

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let replyText = t("defaultReply");
      
      if (inputVal.includes("sc-00412") || inputVal.includes("412") || inputVal.includes("delayed")) {
        replyText = t("delayedReply");
      } else if (inputVal.includes("cashback") || inputVal.includes("refund")) {
        replyText = t("cashbackReply");
      } else if (inputVal.includes("hello") || inputVal.includes("hi")) {
        replyText = t("greetingReply");
      }

      const agentMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "agent",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, agentMsg]);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 text-zinc-100 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="md:col-span-1 bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between min-h-[220px] shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Headphones className="h-4.5 w-4.5" />
              <span>{t("contactUs")}</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">
              {t("contactDescription")}
            </p>

            <div className="flex flex-col gap-2.5 mt-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <Phone className="h-3.5 w-3.5 text-zinc-500" />
                <span>{t("hotline")}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Mail className="h-3.5 w-3.5 text-zinc-500" />
                <span>support@deliveryhub.com</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowLiveChat(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900 transition-all focus:outline-none mt-4"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{t("startChat")}</span>
          </button>
        </div>

        <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                {t("tickets")}
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:text-blue-400"
              >
                <Plus className="h-3 w-3" />
                <span>{t("createTicket")}</span>
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              {tickets.map((tkt) => {
                const isOpen = tkt.status === "open";

                return (
                  <div
                    key={tkt.id}
                    className="flex items-center justify-between border-b border-zinc-855 pb-3 last:border-none last:pb-0"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-zinc-200">
                        {tkt.subject}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        ID: {tkt.id} • {t("shipmentId")}: {tkt.shipmentId} • {tkt.date}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isOpen
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {isOpen ? t("open") : t("resolved")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-4 text-zinc-100">
            <button
              onClick={() => {
                setShowCreateModal(false);
                reset();
              }}
              className="absolute right-4 top-4 p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-base font-bold text-zinc-100">{t("createTitle")}</h2>
            <p className="text-xs text-zinc-400">
              {t("createSubtitle")}
            </p>
            <form onSubmit={handleSubmit(handleCreateTicket)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400">{t("subject")}</label>
                <input
                  type="text"
                  {...register("subject")}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                  placeholder={t("subjectPlaceholder")}
                />
                {errors.subject && (
                  <span className="text-[11px] text-red-400 font-medium">
                    {validation(errors.subject.message as never)}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400">{t("category")}</label>
                <select
                  {...register("category")}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 transition-colors cursor-pointer"
                >
                  <option value="delay" className="bg-zinc-900 text-zinc-200">{t("delay")}</option>
                  <option value="billing" className="bg-zinc-900 text-zinc-200">{t("billing")}</option>
                  <option value="damage" className="bg-zinc-900 text-zinc-200">{t("damage")}</option>
                  <option value="other" className="bg-zinc-900 text-zinc-200">{t("other")}</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400">{t("shipmentId")}</label>
                <input
                  type="text"
                  {...register("shipmentId")}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                  placeholder={t("shipmentIdPlaceholder")}
                />
                {errors.shipmentId && (
                  <span className="text-[11px] text-red-400 font-medium">
                    {validation(errors.shipmentId.message as never)}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400">{t("messageDetails")}</label>
                <textarea
                  {...register("message")}
                  rows={4}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                  placeholder={t("messagePlaceholder")}
                />
                {errors.message && (
                  <span className="text-[11px] text-red-400 font-medium">
                    {validation(errors.message.message as never)}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={submittingTicket}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-2.5 rounded-lg text-xs transition-all duration-200 shadow-md focus:outline-none"
              >
                {submittingTicket ? "..." : t("submitTicket")}
              </button>
            </form>
          </div>
        </div>
      )}

      {showLiveChat && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border-l border-zinc-800 max-w-md w-full h-full flex flex-col text-zinc-100 shadow-2xl relative">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    SC
                  </div>
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border border-zinc-900" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-100">{t("liveAgent")}</span>
                  <span className="text-[9px] text-zinc-500">{t("alwaysOnline")}</span>
                </div>
              </div>
              <button
                onClick={() => setShowLiveChat(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-zinc-950/20">
              {chatMessages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${
                      isUser ? "self-end items-end" : "self-start items-start"
                    }`}
                  >
                    <div
                      className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${
                        isUser
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700/50"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-zinc-500 mt-1 px-1 font-medium">
                      {msg.time}
                    </span>
                  </div>
                );
              })}
              {isTyping && (
                <div className="self-start flex flex-col items-start max-w-[80%]">
                  <div className="bg-zinc-800 text-zinc-400 px-3 py-2 rounded-xl rounded-bl-none border border-zinc-700/50 text-xs flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800 bg-zinc-900 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t("typeMessage")}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors focus:outline-none"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
