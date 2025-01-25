import React, { useState, useEffect, useCallback } from 'react';
import {getUsers} from '@/lib/api';
import { ComponentLoadingSpinner } from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { PaginationControl } from "@/hooks/PaginationControl.tsx";
import {User} from "@/lib/types.ts";
import CreateRoleIcon from "@/assets/icons/create_role.svg";


const ITEMS_PER_PAGE = 12;

const usePaginatedUsers = (users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>>, itemsPerPage: number = ITEMS_PER_PAGE) => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
      if(users.length) {
        setIsLoading(false);
      }
    }, [users]);

    const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
      setCurrentPage(1);
    }, []);

    const filteredUsers = users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pageCount = Math.ceil(filteredUsers.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
      setCurrentPage(pageNumber);
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const usersOnPage = filteredUsers.slice(startIndex, endIndex);

    return {
      usersOnPage,
      isLoading,
      searchTerm,
      pageCount,
      currentPage,
      handleSearch,
      handlePageChange,
      filteredUsers,
    }
};

export default function Users({ itemsPerPage = ITEMS_PER_PAGE }: { itemsPerPage?: number }) {
  const [users, setUsers] = useState<User[]>([]);

  const {
    usersOnPage,
    isLoading,
    searchTerm,
    pageCount,
    currentPage,
    handleSearch,
    handlePageChange,
    filteredUsers
  } = usePaginatedUsers(users, setUsers, itemsPerPage);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        // const duplicatedUsers = Array(20).fill(response).flat();
        setUsers(response);
      } catch (error) {
        toast.error(error.message, {
          position: "bottom-right",
          duration: 10000
        });
      }
    };

    fetchUsers().then(r => { });
  }, []);


  return (
    <div className="flex w-2/3 h-full p-5">
      <div className="w-full h-full flex flex-col pr-5">
        {!isLoading && (
            <div className="mb-5 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Пошук за іменем користувача..."
                    className="w-2/3 p-2 rounded bg-[#292B2F] text-white focus:outline-none"
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <div
                    className="flex justify-center p-2 border-dashed border-gray-500 text-gray-300 border rounded cursor-pointer w-1/3 ml-5 transition-all duration-300">
                    <img src={CreateRoleIcon} alt="Створити групу" className="w-5 h-5"/>
                </div>
            </div>
        )}


          {isLoading ? (
              <ComponentLoadingSpinner/>
          ) : (
              <div className="flex-grow">
                  {filteredUsers.length === 0 ? (
                      <div className="text-gray-400">Користувачів немає</div>
                  ) : (
                      <ul className="list-none p-0">
                          {usersOnPage.map((user) => (
                              <li key={user.id}
                      className="py-2 px-4 rounded bg-[#2f3136] text-white mb-2 flex justify-between items-center">
                      {user.name}
                      <div className="text-gray-400">{user.type}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

       {!isLoading && (
        <PaginationControl currentPage={currentPage} pageCount={pageCount} handlePageChange={handlePageChange} />
       )}
      </div>
    </div>
  );
}