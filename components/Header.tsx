"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const pathname = usePathname();

  const getNavStyle = (path: string) => {
    const isActive =
      (path === "/" && pathname === "/") ||
      (path !== "/" && pathname.includes(path));

    return `text-xl transition-all duration-300 ease-in-out relative 
      ${
        isActive
          ? "text-yellow-400 font-semibold scale-105 drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]"
          : "text-white font-light"
      } 
      hover:text-yellow-300 hover:scale-105 
      before:content-[''] before:absolute before:h-[2px] before:w-0 before:bottom-[-4px] 
      before:left-0 before:bg-yellow-300 before:transition-all before:duration-300 
      hover:before:w-full ${
        isActive ? "before:w-full before:bg-yellow-400" : ""
      }`;
  };

  return (
    <header className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <img
          src="/assets/images/Bee.png"
          alt="Bee logo"
          width={100}
          height={100}
          className="mr-4"
        />
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-[#FBBC05]">
          GesturBee
        </h1>
      </div>

      <div className="flex-row flex flex-1 justify-end space-x-10">
        <Link href="/">
          <div className="p-4">
            <h4 className={getNavStyle("/")}>Home</h4>
          </div>
        </Link>
        <Link href="/online/practice">
          <div className="p-4">
            <h4 className={getNavStyle("online")}>Game</h4>
          </div>
        </Link>
      </div>
    </header>
  );
}
