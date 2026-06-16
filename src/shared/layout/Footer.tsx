import Link from "next/link";
import { Truck } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Footer() {
    const t = useTranslations("footer");
    const common = useTranslations("common");
    const companyLinks = [
        { label: t("about"), href: "#about" },
        { label: t("howItWorks"), href: "#how-it-works" },
        { label: t("contact"), href: "#contact" },
    ];
    const legalLinks = [
        { label: t("privacyPolicy"), href: "#" },
        { label: t("termsOfService"), href: "#" },
    ];

    return (
        <footer
            className="border-t"
            style={{
                borderColor: "var(--border)",
                background: "var(--navy-mid)",
            }}
        >
            <div className="max-w-6xl mx-auto px-10 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                                background: "var(--blue)",
                                boxShadow: "0 0 20px var(--blue-glow)",
                            }}
                        >
                            <Truck className="h-4 w-4 text-white" aria-hidden="true" />
                        </div>
                        <span
                            className="font-bold text-lg text-[var(--landing-text)]"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            DeliveryHub
                        </span>
                    </div>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        {t("description")}
                    </p>
                    <div className="flex gap-3">
                        {["Facebook", "Instagram", "LinkedIn"].map((social) => (
                            <Link
                                key={social}
                                href="#"
                                aria-label={social}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all"
                                style={{
                                    border: "1px solid var(--border)",
                                    color: "var(--text-muted)",
                                }}
                            >
                                {social[0]}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div
                        className="text-sm font-semibold text-[var(--landing-text)]"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        {t("company")}
                    </div>
                    <ul className="flex flex-col gap-3 list-none">
                        {companyLinks.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className="text-sm hover:text-[var(--landing-text)] transition-colors"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-col gap-4">
                    <div
                        className="text-sm font-semibold text-[var(--landing-text)]"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        {t("legal")}
                    </div>
                    <ul className="flex flex-col gap-3 list-none">
                        {legalLinks.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className="text-sm hover:text-[var(--landing-text)] transition-colors"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div
                className="border-t px-10 py-5 flex items-center justify-between"
                style={{ borderColor: "var(--border)" }}
            >
                <span className="text-sm" style={{ color: "var(--text-dim)" }}>
                    © 2026 DeliveryHub. {common("copyright")}
                </span>
                <div className="flex gap-4">
                    {[
                        { label: t("privacy"), href: "#" },
                        { label: t("terms"), href: "#" },
                    ].map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="text-sm hover:text-[var(--landing-text)] transition-colors"
                            style={{ color: "var(--text-dim)" }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
}
