interface BoxProps {
  boxText: string;
  className?: string;
}

export function Box({ boxText, className }: BoxProps) {
  return (
    <div className="relative inline w-[35%] h-fit">
      <div className="absolute bg-white w-full h-full z-0 -translate-x-1 translate-y-1">
      </div>
      <div className={`relative z-10 hover:cursor-pointer text-xl border-2 border-black bg-[#FDC62E] px-10 py-12 hover:bg-[#FCBC0D] ${className}`}>
        {boxText}
      </div>
    </div>
  )
}