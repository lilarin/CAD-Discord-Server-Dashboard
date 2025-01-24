import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

import DisciplinesIcon from "@/assets/icons/disciplines.svg";
import GroupsIcon from "@/assets/icons/groups.svg";
import UsersIconIcon from "@/assets/icons/users.svg";
import EventsIcon from "@/assets/icons/events.svg";
import ArchivationIcon from "@/assets/icons/archivation.svg";
import LogsIcon from "@/assets/icons/logs.svg";

const navigation = [
  { name: "Категорії", href: "/disciplines", icon: DisciplinesIcon },
  { name: "Групи", href: "/groups", icon: GroupsIcon },
  { name: "Користувачі", href: "/users", icon: UsersIconIcon },
  { name: "Заходи", href: "/events", icon: EventsIcon },
  { name: "Архівація", href: "/archivation", icon: ArchivationIcon },
  { name: "Логи", href: "/logs", icon: LogsIcon },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="sticky top-0 flex w-1/6 flex-col bg-[#2F3136] border-r border-border/40">
      <div className="px-4 pb-5 pt-6 sticky top-0 bg-[#2F3136] z-10">
        <h1 className="text-lg font-semibold text-gray-200 text-center pb-2">Панель керування</h1>
        <div className="mt-3 border-t border-gray-600"></div>
          <div className="flex flex-1 flex-col gap-3 pt-3 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors",
                  location.pathname === item.href
                    ? "bg-[#36393F] text-gray-200"
                    : "text-gray-400 hover:bg-[#36393F] hover:text-gray-200 hover:rounded"
                )}
              >
              <img src={item.icon} alt={item.name} className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
      </div>
    </div>
  );
};