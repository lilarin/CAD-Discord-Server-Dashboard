import { UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import LogOutIcon from "@/assets/icons/logout.svg";
import React from "react";

export const Header = () => {
  return (
    <header className="bg-[#292B2F]">
      <div className="container mx-auto">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCircle className="h-8 w-8 text-gray-400" />
            <div className="text-sm">
              <p className="font-medium text-gray-200">lilarin</p>
              <p className="text-xs text-gray-400">Адміністратор</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="default"
            className="text-gray-400 hover:text-gray-200 rounded">
            <img src={LogOutIcon} alt="Вийти з системи" className="w-5 h-5 cursor-pointer"/>
            Вийти з системи
          </Button>
        </div>
      </div>
    </header>
  );
};