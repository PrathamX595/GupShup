"use client";

import { Button } from "./components/Button";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Box } from "./components/Box";
import { useRouter } from "next/navigation";

export default function Home() {
  var router = useRouter();
  return (
    <div className="text-black flex flex-col w-full font-[family-name:var(--font-kiwi-regular)] inset-0 -z-10 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_2px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_2px)] bg-[size:6rem_6rem] sm:bg-[size:4rem_4rem]">
      <Header />
      <main>
        <div className="flex flex-col items-center gap-12 sm:gap-20 pt-8 sm:pt-16 pb-16 sm:pb-32 px-4 sm:px-6 lg:px-8">
          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-center font-[family-name:var(--font-kiwi-medium)] leading-tight">
            Talk to the world
            <br />
            one stranger at a time.
          </div>
          <Button
            buttonText="Start Talking ➜"
            onClick={() => router.push("/chat")}
          />
          <div className="text-base sm:text-lg md:text-xl lg:text-2xl text-center px-4 max-w-4xl leading-relaxed">
            GupShup is your gateway to spontaneous conversations
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            with strangers around the world.
          </div>
        </div>
        <div className="w-full bg-black flex items-center justify-center py-12 sm:py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse lg:flex-row justify-center items-center max-w-7xl w-full gap-6 sm:gap-8 lg:gap-16">
            <div className="flex flex-col w-full lg:w-[45%] justify-center text-center lg:text-left order-2 lg:order-1">
              <div className="text-[#FDC62E] text-base sm:text-lg xl:text-xl mb-2 sm:mb-4">
                Spontaneous Connections
              </div>
              <div className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-3 sm:mb-4 lg:mb-6 font-[family-name:var(--font-kiwi-medium)] leading-tight">
                Talk Freely, Meet Randomly
              </div>
              <div className="text-white text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                Bite-sized conversations with strangers spark new stories,
                laughs, and ideas without the awkward intros or commitments.
              </div>
            </div>
            <div className="w-full lg:w-[55%] flex justify-center order-1 lg:order-2">
              <div className="w-full max-w-sm sm:max-w-md lg:max-w-none">
                <Box
                  boxText="Your next conversation is waiting. Meet someone new with just a click. Whether you're looking for a quick chat, a laugh, or a deep conversation, the perfect connection is just a moment away. "
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-8 sm:gap-12 lg:gap-16 xl:gap-20 pt-12 sm:pt-16 pb-16 sm:pb-32 px-4 sm:px-6 lg:px-8">
          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-center font-[family-name:var(--font-kiwi-medium)]">
            How It Works?
          </div>
          <div className="flex flex-col gap-12 sm:gap-16 lg:gap-24 xl:gap-36 max-w-7xl w-full">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 sm:gap-8 lg:gap-4">
              <div className="flex flex-col justify-center gap-2 sm:gap-3 lg:gap-5 text-center lg:text-left flex-1">
                <div className="font-[family-name:var(--font-kiwi-medium)] text-xl sm:text-2xl lg:text-3xl">
                  1. Click "Start Talking"
                </div>
                <div className="text-base sm:text-lg lg:text-xl xl:text-2xl">
                  Instantly connect, no login required
                </div>
              </div>
              <div className="flex-shrink-0">
                <img
                  src="buttonClick.svg"
                  alt="button Clicking img"
                  className="w-32 sm:w-48 md:w-56 lg:w-64 xl:w-auto max-w-full h-auto"
                />
              </div>
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 sm:gap-8 lg:gap-4">
              <div className="flex flex-col justify-center gap-2 sm:gap-3 lg:gap-5 text-center lg:text-left flex-1 lg:order-1">
                <div className="font-[family-name:var(--font-kiwi-medium)] text-xl sm:text-2xl lg:text-3xl">
                  2. Get Paired Randomly
                </div>
                <div className="text-base sm:text-lg lg:text-xl xl:text-2xl">
                  Meet someone new from anywhere in the world
                </div>
              </div>
              <div className="flex-shrink-0 lg:order-2">
                <img
                  src="userConnect.svg"
                  alt="Connecting users img"
                  className="w-32 sm:w-48 md:w-56 lg:w-64 xl:w-auto max-w-full h-auto"
                />
              </div>
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 sm:gap-8 lg:gap-4">
              <div className="flex flex-col justify-center gap-2 sm:gap-3 lg:gap-5 text-center lg:text-left flex-1">
                <div className="font-[family-name:var(--font-kiwi-medium)] text-xl sm:text-2xl lg:text-3xl">
                  3. Chat Freely
                </div>
                <div className="text-base sm:text-lg lg:text-xl xl:text-2xl">
                  Text or video chat, anonymously and safely.
                </div>
              </div>
              <div className="flex-shrink-0">
                <img
                  src="chat.svg"
                  alt="chat symbols img"
                  className="w-32 sm:w-48 md:w-56 lg:w-64 xl:w-auto max-w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
