export const TypingAnimation = () => {
  return (
    <div className="flex gap-1 items-center rounded-lg p-2 text-xs max-w-[60%] bg-zinc-800 text-zinc-200">
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]"></span>
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]"></span>
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"></span>
    </div>
  );
}; 