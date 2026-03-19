"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const items = [
  { href: "/", label: "Topup" },
  { href: "/riwayat", label: "Riwayat Order" },
  { href: "/reseller", label: "Reseller" },
  { href: "/kalkulator", label: "Kalkulator" },
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

  const [me, setMe] = useState<Me>({ user: null });
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<GameSearchRow[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="siteTopbar" ref={mobileMenuRef}>
      <div className="siteTopbarRow">
        <Link href="/" className="siteBrand" aria-label="CarenPedia">
          <div className="siteBrandLogo">C</div>
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

      <div className={`siteMobilePanel ${mobileMenuOpen ? "isOpen" : ""}`}>
        <div className="siteMobileLocale">ID / IDR</div>

        <nav className="siteMobileNav">
          {items.map((it) => {
            const active = isActivePath(pathname, it.href);

            return (
              <Link
                key={it.href}
                href={it.href}
                className={`siteMobileNavItem ${active ? "active" : ""}`}
              >
                {it.label}
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
    </header>
  );
}