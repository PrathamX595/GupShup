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
    <div className="text-black font-[family-name:var(--font-kiwi-regular)] flex flex-col min-h-screen lg:h-screen">
      <div>
        <div className="bg-[#FDC62E] min-w-full h-6"></div>
      </div>
      <div className="flex flex-col lg:flex-row flex-grow w-full overflow-hidden">
        <div className="w-full lg:w-1/4 h-auto lg:h-full flex items-end">
          <div className="flex flex-col h-full border-r border-b lg:border-b-0 gap-0 w-full">
            <div className="px-4 pt-4">
              <Link href="/">
                <img
                  src="/fullLogo.svg"
                  alt="logo"
                  className="w-32 sm:w-40 lg:w-full h-16 sm:h-16 lg:h-20 mb-4 lg:mb-8"
                />
              </Link>
            </div>
            <div className="flex-grow overflow-x-auto lg:overflow-x-visible">
              <div className="flex lg:flex-col whitespace-nowrap lg:whitespace-normal">
                {map.map((item, index) => {
                  const [label, href] = Object.entries(item)[0];
                  return (
                    <div key={index} className="relative flex-shrink-0 lg:flex-shrink">
                      {selected === label && (
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#FDC62E] hidden lg:block"></div>
                      )}
                      {selected === label && (
                        <div className="absolute left-0 right-0 bottom-0 h-1 bg-[#FDC62E] block lg:hidden"></div>
                      )}
                      <Link
                        href={`/settings${href}`}
                        className={`block text-sm sm:text-base lg:text-lg py-2 sm:py-3 px-3 sm:px-4 lg:px-6 hover:bg-gray-50 transition-colors ${
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
            </div>
            <div className="p-3 sm:p-4 lg:p-6 text-center text-xs sm:text-sm text-gray-400 hidden lg:block">
              <hr />
              <div className="mt-3">© {new Date().getFullYear()} GupShup</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full flex-grow lg:h-full">
          <div className="text-lg sm:text-xl lg:text-2xl border-b py-3 sm:py-4 lg:py-5 px-3 sm:px-4 lg:px-5 flex-shrink-0">
            <span className="hidden sm:inline">{`Settings > ${selected}`}</span>
            <span className="sm:hidden">{selected || "Settings"}</span>
          </div>
          <div className="flex-grow overflow-y-auto p-3 sm:p-4 lg:p-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}