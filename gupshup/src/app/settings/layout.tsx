"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const map = [
    { "Account": "/account" },
    { "Privacy Policy": "/policy" },
    { "Terms of Service": "/terms" },
    { "Community Guidelines": "/guide" },
  ];
  const pathname = usePathname();
  const query = pathname.split("/")[2];
  
  const getDefSelection = (query: string) => {
    switch (query) {
      case "account":
        return "Account";
      case "policy":
        return "Privacy Policy";
      case "terms":
        return "Terms of Service";
      case "guide":
        return "Community Guidelines";
      default:
        return "";
    }
  };

  const [selected, setSelected] = useState<string>(getDefSelection(query));

  const handleSelected = (label: string) => {
    setSelected(label);
  };

  return (
    <div className="text-black font-[family-name:var(--font-kiwi-regular)] flex flex-col h-screen">
      <div>
        <div className="bg-[#FDC62E] min-w-full h-6"></div>
      </div>
      <div className="flex flex-grow w-full overflow-hidden">
        <div className="w-1/4 h-full flex items-end">
          <div className="flex flex-col h-full border-r gap-0 w-full">
            <div className="px-4 pt-4">
              <Link href="/">
                <img
                  src="/fullLogo.svg"
                  alt="logo"
                  className="w-full h-20 mb-8"
                />
              </Link>
            </div>
            <div className="flex-grow">
              {map.map((item, index) => {
                const [label, href] = Object.entries(item)[0];
                return (
                  <div key={index} className="relative">
                    {selected === label && (
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#FDC62E]"></div>
                    )}
                    <Link
                      href={`/settings${href}`}
                      className={`block text-lg py-3 px-6 hover:bg-gray-50 transition-colors ${
                        selected === label
                          ? "bg-[#F5F5F5] text-black font-medium"
                          : "text-gray-700 hover:text-black"
                      }`}
                      onClick={() => handleSelected(label)}
                    >
                      {label}
                    </Link>
                  </div>
                );
              })}
            </div>
            <div className="p-6 text-center text-sm text-gray-400">
              <hr />
              <div className="mt-3">© {new Date().getFullYear()} GupShup</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full h-full">
          <div className="text-2xl border-b py-5 px-5 flex-shrink-0">
            {`Settings > ${selected}`}
          </div>
          <div className="flex-grow overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
