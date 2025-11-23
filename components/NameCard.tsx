import React from 'react';
import { Player } from '../types';

interface NameCardProps {
  player: Player;
  hasDrawn: boolean;
  onSelect: (player: Player) => void;
}

export const NameCard: React.FC<NameCardProps> = ({ player, hasDrawn, onSelect }) => {
  return (
    <button
      onClick={() => !hasDrawn && onSelect(player)}
      disabled={hasDrawn}
      className={`
        relative w-full aspect-[3/4] rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-lg transition-all duration-300
        ${hasDrawn 
          ? 'bg-gray-200/50 opacity-70 border-gray-400 cursor-not-allowed scale-95 grayscale' 
          : 'bg-xmasCream cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:bg-white border-xmasGold'
        }
        border-4
      `}
    >
      {/* Decorative ribbons - only visible if active */}
      {!hasDrawn && (
        <>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-full bg-xmasRed opacity-10" />
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-8 bg-xmasRed opacity-10" />
        </>
      )}

      {/* Icon */}
      <div className="mb-4 text-4xl">
        {hasDrawn ? '✅' : '🎄'}
      </div>

      <h3 className={`font-christmas text-2xl font-bold z-10 break-words w-full px-2 ${hasDrawn ? 'text-gray-600' : 'text-xmasGreen'}`}>
        {hasDrawn ? `Már húzott (${player.name})` : player.name}
      </h3>
      
      <p className="mt-2 text-sm font-body text-gray-600 z-10">
        {hasDrawn ? '' : 'Ez én vagyok!'}
      </p>
    </button>
  );
};