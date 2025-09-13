import Link from "next/link"

export function Footer() {
  return (
    <div className="bg-black text-white">
        <div className="pt-6 sm:pt-10 pl-4 sm:pl-10 font-[family-name:var(--font-love-ya)] text-2xl sm:text-3xl md:text-4xl">
            GupShup
        </div>
        <div className="flex flex-col lg:flex-row pt-4 sm:pt-8 pb-4 sm:pb-6 gap-6 lg:gap-20 pl-4 sm:pl-8 lg:pl-20 pr-4 sm:pr-8">
            <div className="flex flex-col text-lg sm:text-xl lg:text-2xl gap-2 order-2 lg:order-1">
                <Link href={"/settings"}>Settings</Link>
                <Link href={"/settings/guide"}>Community Guidelines</Link>
                <Link href={"/settings/policy"}>Privacy Policy</Link>
                <Link href={"/settings/terms"}>Terms of Service</Link>
            </div>
            <div className="flex gap-2 order-1 lg:order-2">
                <a href="https://github.com/PrathamX595/GupShup" target="_blank"><img src="icons8-github-64 1.svg" alt="github" className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16" /></a>
                <a href="https://www.linkedin.com/in/prtm-sth/" target="_blank"><img src="icons8-linkedin 1.svg" alt="linkedin" className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16" /></a>
                <a href="https://x.com/Pratham_595" target="_blank"><img src="icons8-twitterx (1) 1.svg" alt="twitter" className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16" /></a>
            </div>
        </div>
        <hr className="border-white border-2"/>
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center items-center py-2 px-4 text-sm sm:text-base">
            <span>Made by <a href="https://github.com/PrathamX595" target="_blank"><u>Pratham</u></a> on</span>
            <img src="coffee.svg" alt="coffee" className="w-4 h-4 sm:w-6 sm:h-6" />
        </div>
    </div>
  )
}