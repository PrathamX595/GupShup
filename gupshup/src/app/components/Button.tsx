interface ButtonProps {
  buttonText: string;
  onClick?: () => void;
  className?: string;
}

export function Button({ buttonText, onClick, className }: ButtonProps) {
  return (
    <div className="relative inline h-fit">
      <div className="absolute bg-black w-full h-full z-0 -translate-x-1 translate-y-1">
      </div>
      <button className={`relative z-10 hover:cursor-pointer text-xl border-4 border-black bg-[#FDC62E] px-8 pt-3 pb-5 hover:bg-[#FCBC0D] ${className}`} onClick={onClick}>
        {buttonText}
      </button>
    </div>
  )
}