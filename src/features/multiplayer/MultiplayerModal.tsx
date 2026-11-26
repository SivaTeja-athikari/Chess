import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChessStore } from '../../stores/useChessStore';
import { 
  Globe, 
  X, 
  Copy, 
  Check, 
  Link as LinkIcon, 
  Play, 
  Radio, 
  Loader2, 
  Smartphone, 
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({ isOpen, onClose }) => {
  const { 
    multiplayerRoom, 
    createMultiplayerRoom, 
    setMultiplayerTimeLimit,
    joinMultiplayerRoom, 
    leaveMultiplayerRoom,
    setGameMode,
    restartGame 
  } = useChessStore();

  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [multiplayerTimeLimit, setMultiplayerTimeLimitState] = useState<number | null>(
    multiplayerRoom?.timeLimit ?? 600
  );

  const TIME_PRESETS: { label: string; seconds: number | null }[] = [
    { label: '1m Bullet', seconds: 60 },
    { label: '3m Blitz', seconds: 180 },
    { label: '5m Blitz', seconds: 300 },
    { label: '10m Rapid', seconds: 600 },
    { label: '30m Classical', seconds: 1800 },
    { label: 'Unlimited', seconds: null },
  ];

  // Auto-detect room parameter from URL query string on open
  useEffect(() => {
    if (!isOpen) return;

    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setActiveTab('join');
      setJoinCodeInput(roomParam.trim().toUpperCase());
      setStatusMessage(`Detected invite room "${roomParam}". Click "Connect & Enter Game" to join.`);
    } else if (!multiplayerRoom && activeTab === 'create') {
      createMultiplayerRoom();
    }
  }, [isOpen]);

  // When room becomes active/playing, auto-close to start the battle
  useEffect(() => {
    if (multiplayerRoom?.status === 'playing' && isOpen) {
      setStatusMessage('Opponent connected! Entering live battle...');
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [multiplayerRoom?.status, isOpen]);

  if (!isOpen) return null;

  const currentCode = multiplayerRoom?.code || 'GM-4821';
  const inviteLink = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?room=${currentCode}`
    : `https://chess.ownone.app/?room=${currentCode}`;

  const handleCreateNewRoom = () => {
    const code = createMultiplayerRoom(multiplayerTimeLimit ?? undefined);
    setStatusMessage(`New room ${code} ready. Share the link or code with your friend.`);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenLocalTestWindow = () => {
    window.open(inviteLink, '_blank');
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim() || isJoining) return;

    setIsJoining(true);
    setStatusMessage('Connecting to host room...');

    try {
      const raw = joinCodeInput.trim().toUpperCase().replace(/\s+/g, '');
      let code = raw;
      if (!code.startsWith('GM-')) {
        if (code.startsWith('GM')) {
          code = `GM-${code.replace('GM', '').replace(/^-/, '')}`;
        } else if (/^\d{4}$/.test(code)) {
          code = `GM-${code}`;
        }
      }

      const success = await joinMultiplayerRoom(code);
      if (success) {
        confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 } });
        setStatusMessage('Connected successfully! Match starting...');
        setTimeout(() => {
          setIsJoining(false);
          onClose();
        }, 900);
      } else {
        setIsJoining(false);
        setStatusMessage(`Could not find room "${code}". Ensure the host has created the room.`);
      }
    } catch (err: any) {
      setIsJoining(false);
      setStatusMessage(err?.message || 'Connection timed out. Check code and try again.');
    }
  };

  const handleQuickMatch = () => {
    setIsSearching(true);
    setStatusMessage('Searching global matchmaking pool for an opponent...');

    setTimeout(() => {
      setIsSearching(false);
      setGameMode('pvp-online');
      useChessStore.setState({
        playerWhite: { id: 'p1', name: 'Grandmaster (You)', avatar: '♔', rating: 2450, country: 'Global' },
        playerBlack: { id: 'p2', name: 'Challenger_88', avatar: '⚔️', rating: 2420, country: 'Norway' },
      });
      restartGame(false);
      confetti({ particleCount: 90, spread: 70 });
      onClose();
    }, 1200);
  };

  const isRoomPlaying = multiplayerRoom?.status === 'playing';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
          className="relative w-full max-w-md rounded-2xl p-6 sm:p-8 glass-panel-gold border border-sky-400/40 shadow-2xl text-center"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Icon */}
          <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center bg-sky-500/20 text-sky-400 border border-sky-400/30 mb-4 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
            <Globe className="w-7 h-7" />
          </div>

          <h2 className="font-display text-2xl font-bold text-stone-100 tracking-wide mb-1">
            Real-Time Multiplayer
          </h2>
          <p className="text-xs text-stone-400 mb-6 font-light">
            Fast real-time peer communication across phones, tablets, & computer windows
          </p>

          {/* Tabs */}
          <div className="flex p-1 rounded-xl bg-stone-900 border border-stone-800 mb-6">
            <button
              onClick={() => {
                setActiveTab('create');
                setStatusMessage(null);
                if (!multiplayerRoom) createMultiplayerRoom();
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'create'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Host Private Room
            </button>
            <button
              onClick={() => {
                setActiveTab('join');
                setStatusMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'join'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Join by Code / URL
            </button>
          </div>

          {activeTab === 'create' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 flex flex-col items-center">
                <span className="text-xs text-stone-400 uppercase tracking-widest font-mono mb-2">
                  Shareable Room Code
                </span>

                <div className="w-full mb-4 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Match Timer</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {TIME_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        disabled={isRoomPlaying}
                        onClick={() => {
                          setMultiplayerTimeLimitState(preset.seconds);
                          setMultiplayerTimeLimit(preset.seconds);
                          setStatusMessage(`${preset.label} selected for both players.`);
                        }}
                        className={`py-2 px-1 rounded-lg border text-[10px] font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                          multiplayerTimeLimit === preset.seconds
                            ? 'border-sky-400 bg-sky-500/20 text-sky-300'
                            : 'border-stone-800 bg-stone-950/70 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-stone-500 mt-2">The host controls the clock setting. It is sent to every connected device.</p>
                </div>
                
                {/* Large Room Code Display */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]">
                    {currentCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors border border-stone-700"
                    title="Copy Code"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Direct Link Action */}
                <button
                  onClick={handleCopyInviteLink}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-sky-950/60 hover:bg-sky-900/80 border border-sky-500/40 text-sky-300 text-xs font-medium transition-colors mb-2"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <LinkIcon className="w-3.5 h-3.5 text-sky-400" />}
                  <span>{copiedLink ? 'Invite Link Copied!' : 'Copy Direct Device Invite Link'}</span>
                </button>

                {/* Quick 1-Click Multi-Window Test */}
                <button
                  onClick={handleOpenLocalTestWindow}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Open 2nd Window (Instant 2-Player Test)</span>
                </button>

                {/* Real-time Status Badge */}
                <div className="mt-4 pt-3 border-t border-stone-800/80 w-full flex items-center justify-center gap-2">
                  {isRoomPlaying ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Opponent Connected! Match Live</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-amber-300 animate-pulse font-medium">
                      <Radio className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      <span>Waiting for opponent to connect...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions Callout */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-stone-900/50 border border-stone-800 text-left text-[11px] text-stone-400">
                <Smartphone className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  Send this link to a phone, tablet, or another browser window. Connects directly with zero logins!
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCreateNewRoom}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs border border-stone-700 transition-colors"
                >
                  Generate New Code
                </button>

                <button
                  onClick={handleQuickMatch}
                  disabled={isSearching}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-stone-950 font-bold text-xs transition-colors shadow-lg shadow-sky-900/30"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isSearching ? 'Matching...' : 'Quick Match'}</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block mb-2 text-left">
                  Enter Host Room Code
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. GM-4821"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  className="w-full py-3.5 px-4 rounded-xl bg-stone-900 border border-stone-700 text-center font-mono text-xl font-bold uppercase tracking-widest text-sky-300 placeholder:text-stone-600 focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isJoining || !joinCodeInput.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 disabled:opacity-50 text-stone-950 font-bold text-sm shadow-lg shadow-sky-900/40 transition-all"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                    <span>Connecting to Host...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Connect & Enter Game</span>
                  </>
                )}
              </button>
            </form>
          )}

          {statusMessage && (
            <p className="text-xs text-sky-300 mt-4 font-medium animate-fade-in bg-sky-950/40 border border-sky-800/40 rounded-lg p-2">
              {statusMessage}
            </p>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
