import Link from "next/link";

export default function Footer() {
    return (
        <footer
            className="border-t"
            style={{
                borderColor: "var(--border)",
                background: "var(--navy-mid)",
            }}
        >
            {/* Top */}
            <div className="max-w-6xl mx-auto px-10 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Brand */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                                background: "var(--blue)",
                                boxShadow: "0 0 20px var(--blue-glow)",
                            }}
                        >
                            <span className="text-white text-sm">🚚</span>
                        </div>
                        <span
                            className="font-bold text-lg text-white"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            DeliveryHub
                        </span>
                    </div>
                    <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                    >
                        {
                            "Egypt's marketplace for delivery. Connecting customers and offices in one transparent platform."
                        }
                    </p>
                    {/* Socials */}
                    <div className="flex gap-3">
                        {["Facebook", "Instagram", "LinkedIn"].map((s) => (
                            <Link
                                key={s}
                                href="#"
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all"
                                style={{
                                    border: "1px solid var(--border)",
                                    color: "var(--text-muted)",
                                }}
                            >
                                {s[0]}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Company */}
                <div className="flex flex-col gap-4">
                    <div
                        className="text-sm font-semibold text-white"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        Company
                    </div>
                    <ul className="flex flex-col gap-3 list-none">
                        {["About Us", "How it Works", "Contact"].map((item) => (
                            <li key={item}>
                                <Link
                                    href="#"
                                    className="text-sm hover:text-white transition-colors"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Legal */}
                <div className="flex flex-col gap-4">
                    <div
                        className="text-sm font-semibold text-white"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        Legal
                    </div>
                    <ul className="flex flex-col gap-3 list-none">
                        {["Privacy Policy", "Terms of Service"].map((item) => (
                            <li key={item}>
                                <Link
                                    href="#"
                                    className="text-sm hover:text-white transition-colors"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Bottom */}
            <div
                className="border-t px-10 py-5 flex items-center justify-between"
                style={{ borderColor: "var(--border)" }}
            >
                <span className="text-sm" style={{ color: "var(--text-dim)" }}>
                    © 2025 DeliveryHub. All rights reserved.
                </span>
                <div className="flex gap-4">
                    {["Privacy", "Terms"].map((item) => (
                        <Link
                            key={item}
                            href="#"
                            className="text-sm hover:text-white transition-colors"
                            style={{ color: "var(--text-dim)" }}
                        >
                            {item}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
}
