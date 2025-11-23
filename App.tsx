import React, { useState, useEffect } from 'react';
import { Player, DrawingPair } from './types';
import { Button } from './components/Button';
import { NameCard } from './components/NameCard';
import { generateChristmasRhyme } from './services/geminiService';
import { db, isFirebaseConfigured } from './services/firebaseConfig';
import { ref, onValue, set, update } from "firebase/database";

const App: React.FC = () => {
  // Game State
  const [players, setPlayers] = useState<Player[]>([]);
  const [pairs, setPairs] = useState<DrawingPair[]>([]);
  const [drawnByIds, setDrawnByIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  
  // Modal State
  const [activeDrawer, setActiveDrawer] = useState<Player | null>(null);
  const [revealedTarget, setRevealedTarget] = useState<Player | null>(null);
  const [aiMessage, setAiMessage] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  // Initialize and Sync with Firebase
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setDbError(true);
      setLoading(false);
      return;
    }

    const gameRef = ref(db, 'christmas-draw-2024');

    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        // Data exists, load it
        setPlayers(data.players || []);
        setPairs(data.pairs || []);
        
        // Convert object map to Set for drawn statuses
        // Firebase stores: { "id1": true, "id2": true }
        const drawnMap = data.drawnStatus || {};
        const drawnSet = new Set<string>(Object.keys(drawnMap).filter(key => drawnMap[key] === true));
        setDrawnByIds(drawnSet);
        
        setLoading(false);
      } else {
        // Data does not exist, initialize it!
        initializeGameInDb();
      }
    }, (error) => {
      console.error("Firebase read failed", error);
      setDbError(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const initializeGameInDb = () => {
    const initialNames = ["Anya", "Pisti", "Bence", "Balázs", "Zsani", "Bogi", "Marci"];
    const generatedPlayers = initialNames.map(name => ({
      id: crypto.randomUUID(),
      name
    }));

    // Constraints logic
    const forbiddenPairs: Record<string, string[]> = {
      "Bogi": ["Marci"],
      "Marci": ["Bogi"],
      "Balázs": ["Zsani"],
      "Zsani": ["Balázs"]
    };

    let attempts = 0;
    let success = false;
    let generatedPairs: DrawingPair[] = [];

    while (!success && attempts < 2000) {
      attempts++;
      const shuffled = [...generatedPlayers].sort(() => Math.random() - 0.5);
      const currentPairs: DrawingPair[] = [];
      let valid = true;

      for (let i = 0; i < shuffled.length; i++) {
        const drawer = shuffled[i];
        const target = shuffled[(i + 1) % shuffled.length];
        
        if (drawer.id === target.id) {
          valid = false;
          break;
        }

        const forbiddenTargets = forbiddenPairs[drawer.name];
        if (forbiddenTargets && forbiddenTargets.includes(target.name)) {
          valid = false;
          break;
        }

        currentPairs.push({
          drawerId: drawer.id,
          targetId: target.id
        });
      }

      if (valid) {
        generatedPairs = currentPairs;
        success = true;
      }
    }

    if (success) {
      // Save to Firebase
      set(ref(db, 'christmas-draw-2024'), {
        players: generatedPlayers,
        pairs: generatedPairs,
        drawnStatus: {} // Empty initially
      }).catch(err => console.error("Firebase write failed", err));
    } else {
      alert("Nem sikerült érvényes párosítást generálni. Próbáld újra később.");
    }
  };

  const handleCardClick = (player: Player) => {
    if (loading || dbError) return;
    setActiveDrawer(player);
    setShowConfirmModal(true);
  };

  const confirmIdentityAndDraw = async () => {
    if (!activeDrawer) return;

    // Concurrency check (optimistic): Check local state again
    if (drawnByIds.has(activeDrawer.id)) {
      alert("Valaki már húzott ezzel a névvel!");
      setShowConfirmModal(false);
      return;
    }

    setShowConfirmModal(false);
    
    const pair = pairs.find(p => p.drawerId === activeDrawer.id);
    if (!pair) {
      alert("Hiba: Ehhez a névhez nem tartozik pár.");
      return;
    }

    const target = players.find(p => p.id === pair.targetId);
    if (!target) return;

    // Update DB immediately to mark as drawn
    const updates: any = {};
    updates[`christmas-draw-2024/drawnStatus/${activeDrawer.id}`] = true;
    update(ref(db), updates).catch(err => {
        alert("Hiba történt a mentés közben. Ellenőrizd az internetkapcsolatot.");
        console.error(err);
    });

    setRevealedTarget(target);
    setShowResultModal(true);
    
    setIsLoadingAi(true);
    setAiMessage('');
    const rhyme = await generateChristmasRhyme(target.name);
    setAiMessage(rhyme);
    setIsLoadingAi(false);
  };

  const closeResult = () => {
    setShowResultModal(false);
    setRevealedTarget(null);
    setActiveDrawer(null);
    setAiMessage('');
  };

  if (dbError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center text-white bg-xmasGreen">
        <h1 className="text-3xl font-christmas mb-4">Beállítás Szükséges</h1>
        <p className="max-w-md bg-white/10 p-6 rounded-lg mb-4">
          Az alkalmazás "adatbázis szintű" működéséhez be kell állítanod a Firebase kapcsolatot.
        </p>
        <p className="text-sm opacity-80 mb-6">
          Nyisd meg a <code>services/firebaseConfig.ts</code> fájlt, és másold be a saját Firebase projekted adatait.
        </p>
        <Button onClick={() => window.location.reload()}>Újrapróbálkozás</Button>
      </div>
    );
  }

  if (loading) {
     return (
        <div className="min-h-screen flex items-center justify-center text-white font-christmas text-2xl">
            Manók dolgoznak... 🎄
        </div>
     );
  }

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center font-body text-gray-800">
      
      {/* Header */}
      <header className="mb-8 text-center bg-xmasCream/90 p-6 rounded-2xl shadow-xl border-4 border-xmasRed max-w-2xl w-full backdrop-blur-sm z-10">
        <h1 className="font-christmas text-4xl md:text-5xl text-xmasRed font-bold drop-shadow-sm">
          🎄 Karácsonyi Húzás 🎄
        </h1>
        <p className="mt-2 text-xmasGreen font-bold text-lg">
          Mindenki válassza ki a saját nevét!
        </p>
      </header>

      {/* Main Content Area - Cards Grid */}
      <main className="w-full max-w-5xl z-10 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-2">
          {players.map(player => (
            <NameCard
              key={player.id}
              player={player}
              hasDrawn={drawnByIds.has(player.id)}
              onSelect={handleCardClick}
            />
          ))}
        </div>
      </main>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && activeDrawer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-xmasRed animate-bounce-in">
            <h2 className="font-christmas text-3xl text-xmasRed mb-4">Biztos benne?</h2>
            <p className="mb-6 text-lg">
              Valóban te vagy <span className="font-bold text-xmasGreen text-xl">{activeDrawer.name}</span>?
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Csak a saját nevedre kattints, mert ha elhasználod a nevet, más nem tud húzni!
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={confirmIdentityAndDraw}>Igen, én vagyok! 🎁</Button>
              <Button variant="danger" onClick={() => setShowConfirmModal(false)}>Mégsem</Button>
            </div>
          </div>
        </div>
      )}

      {/* RESULT MODAL */}
      {showResultModal && revealedTarget && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-xmasCream rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-8 border-xmasGold relative overflow-hidden">
             {/* Decorative corner ribbons */}
             <div className="absolute -top-10 -right-10 w-24 h-24 bg-xmasRed rotate-45"></div>
             <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-xmasGreen rotate-45"></div>

            <h3 className="font-christmas text-2xl text-gray-600 mb-2">Akit húztál:</h3>
            
            <div className="my-6 transform hover:scale-105 transition-transform duration-500">
              <span className="font-christmas text-5xl md:text-6xl text-xmasRed font-bold block drop-shadow-md">
                {revealedTarget.name}
              </span>
            </div>

            <div className="bg-white/50 p-4 rounded-xl mb-6 min-h-[120px] flex items-center justify-center flex-col shadow-inner">
              {isLoadingAi ? (
                <div className="text-xmasGold animate-pulse flex flex-col items-center">
                  <span className="text-3xl mb-2">✨</span>
                  <p className="text-sm font-bold">A karácsonyi manók írják a versikét...</p>
                </div>
              ) : (
                <>
                  <p className="text-xmasGreen font-christmas text-2xl italic leading-relaxed px-2">
                    "{aiMessage}"
                  </p>
                </>
              )}
            </div>

            <Button onClick={closeResult} className="w-full text-lg">
              Rendben, titokban tartom! 🤫
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="fixed bottom-2 right-4 text-white/50 text-xs z-10 pointer-events-none">
        Boldog Karácsonyt!
      </footer>
    </div>
  );
};

export default App;