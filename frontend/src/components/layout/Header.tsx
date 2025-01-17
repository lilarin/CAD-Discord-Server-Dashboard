import { LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
            <LogOut />
            Вийти з системи
          </Button>
        </div>
      </div>
    </header>
  );
};