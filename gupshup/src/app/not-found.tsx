'use client'

import Link from "next/link";
import { Button } from "./components/Button";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter()

  return (
    <div className="text-black flex flex-col min-h-screen font-[family-name:var(--font-kiwi-regular)]">
      <div className="flex flex-col items-center w-full">
        <div className="bg-[#FDC62E] w-full h-6">  
        </div>
        <div className="flex items-center justify-between w-full h-full mt-3 sm:mt-5 px-4 sm:px-6 lg:px-10">
          <Link href="/"><img src="/fullLogo.svg" alt="logo" className="w-32 sm:w-40 lg:w-fit h-auto" /></Link>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <img src="gupshupLogo.svg" alt="gupshupLogo" className="w-16 sm:w-24 lg:w-32 rotate-180"/>
          <div className="font-[family-name:var(--font-love-ya)] text-4xl sm:text-6xl lg:text-8xl">~ 404 ~</div>
          <img src="gupshupLogo.svg" alt="gupshupLogo" className="w-16 sm:w-24 lg:w-32 rotate-180 scale-x-[-1]"/>
        </div>
        <div className="flex justify-center text-lg sm:text-2xl lg:text-3xl mt-4 sm:mt-5 text-center max-w-md">
          woops looks like we don't have that
        </div>
        <div className="flex justify-center mt-6 sm:mt-8 lg:mt-10">
          <Button buttonText="Back to Home" onClick={() => router.push('/')}/>
        </div>
      </div>
    </div>
  );
}