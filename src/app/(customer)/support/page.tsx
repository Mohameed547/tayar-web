"use client";

import { Headphones, Mail, Phone, MessageSquare, Plus } from "lucide-react";

export default function SupportPage() {
  const tickets = [
    {
      id: "tkt-9021",
      subject: "Shipment delayed - SC-00412",
      status: "open",
      date: "Jun 5, 2026",
    },
    {
      id: "tkt-8810",
      subject: "Cashback mismatch issue",
      status: "resolved",
      date: "May 29, 2026",
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-zinc-100 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold tracking-tight">Customer Support</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Contact Channels Grid */}
        <div className="md:col-span-1 bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between min-h-[220px] shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Headphones className="h-4.5 w-4.5" />
              <span>Contact Us</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">
              Need immediate assistance? Our support agents are available 24/7.
            </p>

            <div className="flex flex-col gap-2.5 mt-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <Phone className="h-3.5 w-3.5 text-zinc-500" />
                <span>19999 (Hotline)</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Mail className="h-3.5 w-3.5 text-zinc-500" />
                <span>support@shipconnect.com</span>
              </div>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900 transition-all focus:outline-none mt-4">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Start Live Chat</span>
          </button>
        </div>

        {/* Support Tickets list */}
        <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                My Support Tickets
              </h2>
              <button className="flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:text-blue-400">
                <Plus className="h-3 w-3" />
                <span>Create Ticket</span>
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              {tickets.map((tkt) => {
                const isOpen = tkt.status === "open";

                return (
                  <div
                    key={tkt.id}
                    className="flex items-center justify-between border-b border-zinc-850 pb-3 last:border-none last:pb-0"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-zinc-200">
                        {tkt.subject}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        ID: {tkt.id} • {tkt.date}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isOpen
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {tkt.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
