import React, { useState, useEffect } from "react";
import { UserCircle } from "lucide-react";
import { Button } from "@/components/Button.tsx";
import LogOutIcon from "@/assets/icons/logout.svg";
import { useAuth } from "@/contexts/AuthContext";
import { getUser } from "@/lib/api";
import { User } from "@/lib/types";

export const Header = () => {
  const { signOut, loading, user } = useAuth();
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState<boolean>(false);
  const [isInitiated, setIsInitiated] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user?.user_metadata?.provider_id) {
        if (!userDetails && !isInitiated) {
          setIsLoadingUserDetails(true);
          try {
            const fetchedUser = await getUser(user.user_metadata.provider_id);
            setUserDetails(fetchedUser);
          } catch (error) {
            console.error("Error fetching user details:", error);
          } finally {
            setIsLoadingUserDetails(false);
            setIsInitiated(true);
          }
        }
      }
    };

    fetchUserDetails();
  }, [isInitiated, user, userDetails]);

  const userName = () => {
    if (userDetails?.name) {
      return userDetails.name;
    }
    return user.user_metadata.full_name;
  };

  const userAvatarUrl = () => {
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    return null;
  };


  return (
    <header className="bg-[#292B2F]">
      <div className="flex h-14 items-center justify-between">
        <div className="w-1/6 flex justify-center">
          <div className="flex items-center gap-3">
            {userAvatarUrl() ? (
              <img
                src={userAvatarUrl()}
                alt="Аватар користувача"
                className="rounded-full h-8 w-8"
              />
            ) : (
              <UserCircle className="h-8 w-8 text-gray-400" />
            )}
            <div className="text-sm">
              <p className="font-medium text-gray-200">{isLoadingUserDetails ? "Завантаження..." : userName()}</p>
            </div>
          </div>
        </div>
        <div className="pr-2">
          <Button
            variant="ghost"
            size="default"
            className="text-gray-400 hover:text-gray-200 rounded flex items-center gap-2 transition-all duration-300"
            onClick={handleSignOut}
            disabled={loading}
          >
            <img src={LogOutIcon} alt="Вийти з системи" className="w-5 h-5 cursor-pointer" />
            {loading ? "Вихід..." : "Вийти з системи"}
          </Button>
        </div>
      </div>
    </header>
  );
};