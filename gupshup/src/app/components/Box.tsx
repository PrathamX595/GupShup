interface BoxProps {
  boxText: string;
  className?: string;
}

export function Box({ boxText, className }: BoxProps) {
  return (
    <div className="relative inline w-full sm:w-[80%] md:w-[60%] lg:w-[35%] h-fit">
      <div className="absolute bg-white w-full h-full z-0 -translate-x-1 translate-y-1">
      </div>
      <div className={`relative z-10 hover:cursor-pointer text-base sm:text-lg md:text-xl border-2 border-black bg-[#FDC62E] px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10 lg:py-12 hover:bg-[#FCBC0D] ${className}`}>
        {boxText}
      </div>
    </div>
  )
}