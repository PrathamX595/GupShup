const Reactions = ({ onReactionClick }: { onReactionClick: (emoji: string) => void }) => {
    const reactions = ["😂", "😮", "😢",  "👍",  "❤️", "👋"];
    
    return (
    <div className="bg-white border rounded-lg p-3  grid grid-cols-3 gap-1">
      <div className="col-span-3 text-center text-sm mb-2 text-black">
        Quick Reactions
      </div>
      {reactions.map((emoji, index) => (
        <button
          key={index}
          onClick={() => onReactionClick(emoji)}
          className="text-lg p-2 hover:bg-gray-200 rounded-lg transition-colors hover:border-gray-300 flex justify-center"
          title={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export default Reactions;