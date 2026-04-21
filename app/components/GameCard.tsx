import Link from "next/link";

export type GameDisplay = {
  slug: string;
  name: string;
  tag?: string;
  category: "populer" | "lain";
  logoText: string;
  imageUrl?: string | null;
  targetType: string;
};

function getPublisher(slug: string) {
  if (slug === "mobile-legends") return "Moonton";
  if (slug === "free-fire") return "Garena";
  if (slug === "pubg-mobile") return "Tencent Games";
  if (slug === "genshin-impact" || slug === "honkai-star-rail") return "HoYoverse";
  if (slug === "valorant") return "Riot Games";
  if (slug === "codm") return "Activision";
  return "Global Publisher";
}

function getAbbr(slug: string) {
  if (slug === "mobile-legends") return "MLBB";
  if (slug === "free-fire") return "FF";
  if (slug === "pubg-mobile") return "PUBGM";
  if (slug === "genshin-impact") return "GENSHIN";
  if (slug === "valorant") return "VAL";
  if (slug === "honkai-star-rail") return "HSR";
  if (slug === "codm") return "CODM";
  return slug.substring(0, 4).toUpperCase();
}

export default function GameCard({ 
  game, 
  variant = "vertical", 
  index = 0 
}: { 
  game: GameDisplay; 
  variant?: "vertical" | "horizontal";
  index?: number;
}) {
  const animationDelay = `${index * 0.04}s`;

  const destination = game.targetType === "JOKI_TYPE" ? `/joki/${game.slug}` : `/topup/${game.slug}`;

  if (variant === "horizontal") {
    return (
      <Link 
        href={destination} 
        className="gameCardHorizontal group animateCard"
        style={{ animationDelay }}
      >
        <div className="gchImageCol">
          {game.imageUrl ? (
            <img src={game.imageUrl} alt={game.name} className="gchImage" referrerPolicy="no-referrer" />
          ) : (
            <div className="gchLogoWrap"><div className="gchLogo">{game.logoText}</div></div>
          )}
          {game.tag === "Hemat" && (
            <div className="gchFlashTag">
               <span className="gchF1">FLASH</span><br/><span className="gchF2">SALE</span>
            </div>
          )}
        </div>
        
        <div className="gchContentCol">
          <div className="gchInfo">
            <div className="gchName">{game.name}</div>
            <div className="gchPublisher">{getPublisher(game.slug)}</div>
          </div>
          
          <div className="gchActionRow">
            <div className="gchTopupBtn">
              <div className="gchPlusIcon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </div>
              <span>TOP UP</span>
            </div>
            <div className="gchAbbr">{getAbbr(game.slug)}</div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      href={destination} 
      className="modernGameCard group animateCard"
      style={{ animationDelay }}
    >
      <div className="mgCover">
        {/* Glow effect on hover inside cover */}
        <div className="mgGlow" aria-hidden="true" />
        
        {/* Render Image or Logo Text */}
        {game.imageUrl ? (
          <img src={game.imageUrl} alt={game.name} className="mgImage" referrerPolicy="no-referrer" />
        ) : (
          <div className="mgLogoWrap">
            <div className="mgLogo">{game.logoText}</div>
          </div>
        )}
        
        {game.tag && <span className="mgTag">{game.tag}</span>}
      </div>

      <div className="mgInfo">
        <div className="mgName">{game.name}</div>
        <div className="mgAction">Top up</div>
      </div>
    </Link>
  );
}

