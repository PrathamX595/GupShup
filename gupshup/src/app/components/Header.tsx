'use client'
import { useRouter } from "next/navigation";
import { Button } from "./Button"

export function Header() {
  var router = useRouter()
  return (
    <div className="flex flex-col items-center w-screen item">
        <div className="bg-[#FDC62E] min-w-full h-6">  
        </div>
        <div className="flex items-center justify-between w-full h-full mt-5 px-10">
            <img src="/fullLogo.svg" alt="logo" className="w-fit h-fit" />
            <div className="flex items-center gap-10">
              <a className="text-[#5A5A5A] underline-[#5A5A5A] underline underline-offset-3 text-2xl hover:cursor-pointer" href="loginpage">Log In</a>
              <Button buttonText="Start Talking ➜" onClick={() => router.push('/chat')}/>
            </div>
        </div>
    </div>
  )
}
