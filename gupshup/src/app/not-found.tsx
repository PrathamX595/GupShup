'use client'

import Link from "next/link";
import { Button } from "./components/Button";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter()

  return (
    <div className="text-black flex flex-col min-h-screen font-[family-name:var(--font-kiwi-regular)]">
      <div className="flex flex-col items-center w-screen item">
        <div className="bg-[#FDC62E] min-w-full h-6">  
        </div>
        <div className="flex items-center justify-between w-full h-full mt-5 px-10">
          <Link href="/"><img src="/fullLogo.svg" alt="logo" className="w-fit h-fit" /></Link>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex justify-center">
          <img src="gupshupLogo.svg" alt="gupshupLogo" className="w-32 rotate-180"/>
          <div className="font-[family-name:var(--font-love-ya)] text-8xl">~ 404 ~</div>
          <img src="gupshupLogo.svg" alt="gupshupLogo" className="w-32 rotate-180 scale-x-[-1]"/>
        </div>
        <div className="flex justify-center text-3xl mt-5">
          woops looks like we don't have that
        </div>
        <div className="flex justify-center mt-10">
          <Button buttonText="Back to Home" onClick={() => router.push('/')}/>
        </div>
      </div>
      </div>
  );
}