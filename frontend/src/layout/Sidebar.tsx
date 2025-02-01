import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

import DisciplinesIcon from "@/assets/icons/disciplines.svg";
import GroupsIcon from "@/assets/icons/groups.svg";
import UsersIconIcon from "@/assets/icons/users.svg";
import EventsIcon from "@/assets/icons/events.svg";
import LogsIcon from "@/assets/icons/logs.svg";

const navigation = [
  { name: "Категорії", href: "/disciplines", icon: DisciplinesIcon },
  { name: "Групи", href: "/groups", icon: GroupsIcon },
  { name: "Користувачі", href: "/users", icon: UsersIconIcon },
  { name: "Заходи", href: "/events", icon: EventsIcon },
  { name: "Логи", href: "/logs", icon: LogsIcon },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-1/6 bg-[#2F3136]">
        <div className="px-4 pb-5 pt-6">
            <h1 className="text-lg font-semibold text-gray-200 text-center pb-2">Панель керування</h1>
            <div className="mt-3 border-t border-gray-600"></div>
        </div>
        <div className="sticky top-2 flex flex-1 flex-col gap-3 p-3 ">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors",
              location.pathname === item.href
                ? "bg-[#36393F] text-gray-200"
                : "text-gray-400 hover:bg-[#36393F] hover:text-gray-200 hover:rounded transition-all duration-200"
            )}
          >
            <img src={item.icon} alt={item.name} className="h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
};