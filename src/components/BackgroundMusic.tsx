import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function BackgroundMusic() {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      // Set up audio properties
      audioRef.current.volume = 0.3; // Set volume to 30% for background music
      audioRef.current.loop = true; // Loop the music

      if (!isMuted) {
        // Try playing immediately
        audioRef.current.play().catch((error) => {
          console.log("Autoplay blocked. Will play on first click.");
        });
      } else {
        audioRef.current.pause();
      }
      
      // Browser Autoplay Policy workaround: Play the music on the first click anywhere on the screen
      const handleGlobalClick = () => {
        if (!isMuted && audioRef.current && audioRef.current.paused) {
          audioRef.current.play().catch(() => {});
        }
        // Remove listener after first successful click
        document.removeEventListener("click", handleGlobalClick);
      };
      
      document.addEventListener("click", handleGlobalClick);

      return () => document.removeEventListener("click", handleGlobalClick);
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <>
      {/* Audio element */}
      <audio
        ref={audioRef}
        src="/star-wars-theme.mp3"
        preload="auto"
      />

      {/* Floating speaker button */}
      <button
        onClick={toggleMute}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-black border border-white/20 text-white shadow-lg hover:shadow-xl hover:bg-white hover:text-black transition-all duration-300 hover:scale-110 group"
        aria-label={isMuted ? "Unmute background music" : "Mute background music"}
        title={isMuted ? "Click to play Star Wars theme" : "Click to pause music"}
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6 animate-pulse" />
        ) : (
          <Volume2 className="w-6 h-6 animate-bounce" />
        )}
      </button>
    </>
  );
}
