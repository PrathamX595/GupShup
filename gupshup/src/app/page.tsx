'use client'

import { Button } from "./components/Button";
import { Header } from "./components/Header";
import { redirect } from "next/navigation";


export default function Home() {
  return (
    <div className="text-black flex flex-col w-fit font-[family-name:var(--font-kiwi-regular)] inset-0 -z-10 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_2px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_2px)] bg-[size:6rem_6rem]">
      <Header/>
      <main>
        <div className="flex flex-col items-center gap-20 pt-16 pb-32">
          <div className="text-7xl text-center font-[family-name:var(--font-kiwi-medium)]">
            Talk to the world<br/>one  stranger at a time.
          </div>
            <Button buttonText="Start Talking ➜" onClick={transferToChat}/>
          <div className="text-2xl text-center">
            GupShup is your gateway to spontaneous conversations<br/>with strangers around the world.
          </div>
        </div>
        <div className="w-screen bg-black flex items-center justify-center py-36">
          <div className="flex gap-20">
            <div className="flex flex-col w-[40%]">
              <div className="text-[#FDC62E] text-xl">Spontaneous Connections</div>
              <div className="text-white text-4xl">Talk Freely, Meet Randomly</div>
              <div className="text-white text-xl"> Bite-sized conversations with strangers spark new stories, laughs, and ideas— without the awkward intros or commitments.</div>
            </div>
            <div className=" text-white">
              kjvnlsv
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

var transferToChat = () =>{
  redirect('/chat')
}
