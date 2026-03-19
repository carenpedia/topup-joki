import Link from "next/link";
import type { Game } from "./data";

export default function GameCard({ game }: { game: Game }) {
  return (
    <Link href={`/topup/${game.slug}`} className="modernGameCard group">
      <div className="mgCover">
        {/* Glow effect on hover inside cover */}
        <div className="mgGlow" aria-hidden="true" />
        
        {/* Render Image or Logo Text */}
        {game.imageUrl ? (
          <img src={game.imageUrl} alt={game.name} className="mgImage" />
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

