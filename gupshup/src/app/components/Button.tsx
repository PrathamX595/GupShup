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
        className={` flex justify-center items-center gap-3 relative z-10 hover:cursor-pointer text-xl border-4 border-black bg-[#FDC62E] px-8 pt-3 pb-5 hover:bg-[#FCBC0D] ${className}`}
        onClick={onClick}
      >
        {imgSrc && <img src={imgSrc} alt="buttom img" />}
        {buttonText}
      </button>
    </div>
  );
}
