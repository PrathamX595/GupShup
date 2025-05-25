import Link from "next/link"

export function Footer() {
  return (
    <div className="bg-black text-white">
        <div className=" pt-10 pl-10 font-[family-name:var(--font-love-ya)] text-4xl">
            GupShup
        </div>
        <div className="flex pt-8 pb-6 gap-20 pl-20">
            <div className="flex flex-col text-2xl gap-2">
                <Link href={"/settings"}>Settings</Link>
                <Link href={"/community_guidelines"}>Community Guidelines</Link>
                <Link href={"/privacy_policy"}>Privacy Policy</Link>
                <Link href={"/terms_of_service"}>Terms of Service</Link>
            </div>
            <div className="flex gap-2">
                <a href="https://github.com/PrathamX595/GupShup" target="_blank"><img src="icons8-github-64 1.svg" alt="github" /></a>
                <a href="https://www.linkedin.com/in/prtm-sth/" target="_blank"><img src="icons8-linkedin 1.svg" alt="linkedin" /></a>
                <a href="https://x.com/Pratham_595" target="_blank"><img src="icons8-twitterx (1) 1.svg" alt="twitter" /></a>
            </div>
        </div>
        <hr className=" border-white border-2"/>
        <div className="flex gap-2 justify-center py-2">
            Made by <a href="https://github.com/PrathamX595" target="_blank"><u>Pratham</u></a> on <img src="coffee.svg" alt="coffee" />
        </div>
    </div>
  )
}
