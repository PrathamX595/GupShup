interface ButtonProps {
  buttonText: string;
  onClick?: () => void;
  className?: string;
  imgSrc?: string;
  type?: "submit" | "reset" | "button" | undefined;
}

export function Button({
  type,
  buttonText,
  onClick,
  className,
  imgSrc,
}: ButtonProps) {
  return (
    <div className={`relative inline h-fit ${className}`}>
      <div className="absolute bg-black w-full h-full z-0 -translate-x-1 translate-y-1"></div>
      <button type={type}
        className={`flex justify-center items-center gap-2 sm:gap-3 relative z-10 hover:cursor-pointer text-base sm:text-lg md:text-xl border-2 sm:border-4 border-black bg-[#FDC62E] px-4 sm:px-6 md:px-8 pt-2 sm:pt-3 pb-3 sm:pb-4 md:pb-5 hover:bg-[#FCBC0D] ${className}`}
        onClick={onClick}
      >
        {imgSrc && <img src={imgSrc} alt="buttom img" className="w-4 h-4 sm:w-5 sm:h-5" />}
        {buttonText}
      </button>
    </div>
  );
}