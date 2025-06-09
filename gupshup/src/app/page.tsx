'use client'

import { Button } from "./components/Button";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Box } from "./components/Box";
import { useRouter } from "next/navigation";


export default function Home() {
  var router = useRouter()
  return (
    <div className="text-black flex flex-col w-fit font-[family-name:var(--font-kiwi-regular)] inset-0 -z-10 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_2px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_2px)] bg-[size:6rem_6rem]">
      <Header/>
      <main>
        <div className="flex flex-col items-center gap-20 pt-16 pb-32">
          <div className="text-7xl text-center font-[family-name:var(--font-kiwi-medium)]">
            Talk to the world<br/>one  stranger at a time.
          </div>
            <Button buttonText="Start Talking ➜" onClick={() => router.push("/chat")}/>
          <div className="text-2xl text-center">
            GupShup is your gateway to spontaneous conversations<br/>with strangers around the world.
          </div>
        </div>
        <div className="w-screen bg-black flex items-center justify-center py-32">
          <div className="flex justify-center">
            <div className="flex flex-col w-[45%] pr-20 justify-center">
              <div className="text-[#FDC62E] text-xl">Spontaneous Connections</div>
              <div className="text-white text-4xl">Talk Freely, Meet Randomly</div>
              <div className="text-white text-xl"> Bite-sized conversations with strangers spark new stories, laughs, and ideas— without the awkward intros or commitments.</div>
            </div>
            <Box boxText="“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor. ”"/>
          </div>
        </div>
        <div className="flex flex-col items-center gap-20 pt-16 pb-32">
          <div className="text-7xl">
            How It Works?
          </div>
          <div className="flex flex-col gap-36">
            <div className="flex justify-between w-screen px-36">
              <div className="flex flex-col justify-center gap-5">
                <div className="font-[family-name:var(--font-kiwi-medium)] text-3xl">
                  1. Click “Start Talking”
                </div>
                <div className="text-2xl pl-18">
                  Instantly connect, no login required
                </div>
              </div>
              <img src="buttonClick.svg" alt="button Clicking img" />
            </div>
            <div className="flex justify-between w-screen px-36">
              <div className="flex flex-col justify-center gap-5">
                <div className="font-[family-name:var(--font-kiwi-medium)] text-3xl">
                  2. Get Paired Randomly
                </div>
                <div className="text-2xl pl-18">
                  Meet someone new from anywhere in the world
                </div>
              </div>
              <img src="userConnect.svg" alt="Connecting users img" />
            </div><div className="flex justify-between w-screen px-36">
              <div className="flex flex-col justify-center gap-5">
                <div className="font-[family-name:var(--font-kiwi-medium)] text-3xl">
                  3. Chat Freely
                </div>
                <div className="text-2xl pl-18">
                  Text or video chat, anonymously and safely.
                </div>
              </div>
              <img src="chat.svg" alt="chat symbols img" />
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
}
