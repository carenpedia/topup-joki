"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useConfig } from "./ConfigProvider";

const items = [
  { href: "/", label: "Topup Game", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect><path d="M6 12h4"></path><path d="M8 10v4"></path><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line></svg> },
  { href: "/riwayat", label: "Cek Transaksi", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
  { href: "/reseller", label: "Join Reseller", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> },
  { href: "/kalkulator", label: "Kalkulator WR", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg> },
];

type Me =
  | { user: null }
  | {
    user: {
      id: string;
      username: string;
      role: "MEMBER" | "RESELLER" | "ADMIN" | "JOKI";
      status: "ACTIVE" | "SUSPENDED" | "DELETED";
      carencoinBalance: number;
      pointsBalance: number;
    };
  };

type GameSearchRow = {
  id: string;
  name: string;
  key: string;
  logoUrl?: string | null;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const config = useConfig();

  const [me, setMe] = useState<Me>({ user: null });
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<GameSearchRow[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchRef = useRef<HTMLFormElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (await res.json()) as Me;
        if (alive) setMe(data);
      } catch {
        if (alive) setMe({ user: null });
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchOpen(false);
      }

      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const q = keyword.trim();

    if (!q) {
      setResults([]);
      setSearchOpen(false);
      setSearchLoading(false);
      return;
    }

    let alive = true;
    const t = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await fetch(`/api/games/search?q=${encodeURIComponent(q)}`, {
          cache: "no-store",
        });
        const j = await res.json().catch(() => ({ rows: [] }));
        if (!alive) return;

        const rows = Array.isArray(j?.rows) ? j.rows : [];
        setResults(rows);
        setSearchOpen(true);
      } catch {
        if (!alive) return;
        setResults([]);
        setSearchOpen(true);
      } finally {
        if (alive) setSearchLoading(false);
      }
    }, 250);

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [keyword]);

  const user = "user" in me ? me.user : null;

  const roleLabel = useMemo(() => {
    if (!user) return "";
    if (user.role === "ADMIN") return "ADMIN";
    if (user.role === "RESELLER") return "RESELLER";
    if (user.role === "JOKI") return "JOKI";
    return "MEMBER";
  }, [user]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const first = results[0];
    if (first) {
      setSearchOpen(false);
      router.push(`/topup/${first.key}`);
      return;
    }

    if (keyword.trim()) {
      router.push(`/?q=${encodeURIComponent(keyword.trim())}`);
    }
  }

  return (
    <>
      <header className={`siteTopbar ${isScrolled ? "isScrolled" : ""}`}>
        <div className="siteTopbarRow">
          <Link href="/" className="siteBrand" aria-label={config.SITE_NAME}>
            {config.SITE_LOGO ? (
              <img src={config.SITE_LOGO} alt={config.SITE_NAME} className="siteBrandImg" />
            ) : (
              <div className="siteBrandLogo">{config.SITE_NAME.charAt(0)}</div>
            )}
          </Link>

          <div className="siteSearchWrap">
            <form className="siteSearch" onSubmit={submitSearch} ref={searchRef}>
              <span className="siteSearchIcon">⌕</span>
              <input
                className="siteSearchInput"
                type="text"
                placeholder="Cari Game atau Voucher"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => {
                  if (results.length > 0 || keyword.trim()) setSearchOpen(true);
                }}
              />
            </form>

            {searchOpen ? (
              <div className="siteSearchDropdown">
                {searchLoading ? (
                  <div className="siteSearchEmpty">Mencari game...</div>
                ) : results.length > 0 ? (
                  results.map((game) => (
                    <Link
                      key={game.id}
                      href={`/topup/${game.key}`}
                      className="siteSearchItem"
                      onClick={() => setSearchOpen(false)}
                    >
                      <div className="siteSearchItemThumb">
                        {game.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={game.logoUrl} alt={game.name} className="siteSearchItemImg" />
                        ) : (
                          <div className="siteSearchItemFallback">G</div>
                        )}
                      </div>

                      <div className="siteSearchItemMeta">
                        <div className="siteSearchItemName">{game.name}</div>
                        <div className="siteSearchItemSlug">/topup/{game.key}</div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="siteSearchEmpty">Game tidak ditemukan.</div>
                )}
              </div>
            ) : null}
          </div>

          <div className="siteLocale siteDesktopOnly">ID / IDR</div>

          <button
            type="button"
            className={`siteHamburger ${mobileMenuOpen ? "isOpen" : ""}`}
            aria-label="Buka menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div className="siteMenuRow siteDesktopMenu">
          <div className="siteMenuLeft">
            {items.map((it) => {
              const active = isActivePath(pathname, it.href);

              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`siteMenuItem ${active ? "active" : ""}`}
                >
                  {it.label}
                </Link>
              );
            })}
          </div>

          <div className="siteMenuRight">
            {loading ? (
              <span className="siteMenuItem">...</span>
            ) : user ? (
              <>
                {user.role === "ADMIN" ? (
                  <Link href="/admin" className="siteAuthBtn siteAuthGhost">
                    Admin
                  </Link>
                ) : null}

                <div className="siteUserChip">
                  <span className="siteUserName">{user.username}</span>
                  <span className="siteUserDot">•</span>
                  <span className="siteUserRole">{roleLabel}</span>
                </div>

                <Link href="/user/profile" className="siteAuthBtn siteAuthPrimary">
                  Dashboard
                </Link>
                <Link href="/keluar" className="siteAuthBtn siteAuthGhost">
                  Keluar
                </Link>
              </>
            ) : (
              <>
                <Link href="/masuk" className="siteMenuItem">
                  Masuk
                </Link>
                <Link href="/daftar" className="siteMenuItem">
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div
        className={`siteMobileOverlay ${mobileMenuOpen ? "isOpen" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <div className={`siteMobilePanel ${mobileMenuOpen ? "isOpen" : ""}`}>
        <div className="siteMobilePanelHeader">
          <div className="siteMobileLocale">
            <svg style={{ width: 16, height: 16, marginRight: 6, color: "rgba(255,255,255,0.7)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            ID / IDR
          </div>
          <button className="siteMobileClose" onClick={() => setMobileMenuOpen(false)} aria-label="Tutup menu">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <nav className="siteMobileNav">
          {items.map((it) => {
            const active = isActivePath(pathname, it.href);

            return (
              <Link
                key={it.href}
                href={it.href}
                className={`siteMobileNavItemPlain ${active ? "active" : ""}`}
              >
                <div className="siteMobileNavItemIconWrapPlain">
                  {it.icon}
                </div>
                <div className="siteMobileNavItemTextPlain">
                  {it.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="siteMobileAuth">
          {loading ? (
            <span className="siteAuthLoading">...</span>
          ) : user ? (
            <>
              {user.role === "ADMIN" ? (
                <Link href="/admin" className="siteAuthBtn siteAuthGhost siteMobileBtn">
                  Admin
                </Link>
              ) : null}

              <div className="siteUserChip siteUserChipMobile">
                <span className="siteUserName">{user.username}</span>
                <span className="siteUserDot">•</span>
                <span className="siteUserRole">{roleLabel}</span>
              </div>

              <Link href="/user/profile" className="siteAuthBtn siteAuthPrimary siteMobileBtn">
                Dashboard
              </Link>
              <Link href="/keluar" className="siteAuthBtn siteAuthGhost siteMobileBtn">
                Keluar
              </Link>
            </>
          ) : (
            <>
              <Link href="/masuk" className="siteAuthBtn siteAuthGhost siteMobileBtn">
                Masuk
              </Link>
              <Link href="/daftar" className="siteAuthBtn siteAuthPrimary siteMobileBtn">
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}