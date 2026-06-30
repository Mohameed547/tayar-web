import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { DelixLogo } from "@/shared/ui/DelixLogo";

export default function Footer() {
    const t = useTranslations("footer");
    const common = useTranslations("common");
    const locale = useLocale();
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
        <footer className="border-t border-[var(--dh-border)] bg-[var(--dh-bg-topbar)]">
            <div className="max-w-6xl mx-auto px-10 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="flex flex-col gap-4">
                    <DelixLogo className="h-7 w-7" textClassName="font-display font-extrabold text-lg text-[var(--dh-text-main)] tracking-tight" />
                    <p className="text-sm text-[var(--dh-text-sub)] mt-2">
                        {t("description")}
                    </p>
                    <div className="flex gap-3 mt-2">
                        {["Facebook", "Instagram", "LinkedIn"].map((social) => (
                            <Link
                                key={social}
                                href="#"
                                aria-label={social}
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs transition-all border border-[var(--dh-border)] text-[var(--dh-text-sub)] hover:text-[var(--dh-text-main)] hover:border-[var(--dh-brand)] hover:bg-[var(--dh-brand-subtle)]"
                            >
                                {social[0]}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="text-sm font-semibold text-[var(--dh-text-main)] font-display">
                        {t("company")}
                    </div>
                    <ul className="flex flex-col gap-3 list-none p-0">
                        {companyLinks.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className="text-sm text-[var(--dh-text-sub)] hover:text-[var(--dh-text-main)] transition-colors"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="text-sm font-semibold text-[var(--dh-text-main)] font-display">
                        {t("legal")}
                    </div>
                    <ul className="flex flex-col gap-3 list-none p-0">
                        {legalLinks.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className="text-sm text-[var(--dh-text-sub)] hover:text-[var(--dh-text-main)] transition-colors"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="border-t border-[var(--dh-border)] px-10 py-5 flex items-center justify-between">
                <span className="text-sm text-[var(--dh-text-dim)]">
                    © {new Date().getFullYear()} {locale === 'ar' ? 'طيار' : 'TAYAR'}. {common("copyright")}
                </span>
                <div className="flex gap-4">
                    {[
                        { label: t("privacy"), href: "#" },
                        { label: t("terms"), href: "#" },
                    ].map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="text-sm text-[var(--dh-text-dim)] hover:text-[var(--dh-text-main)] transition-colors"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
}
