import React, { useState, useEffect, useCallback } from 'react';
import { getEditableRoles, Role } from '@/lib/api';
import { ComponentLoadingSpinner } from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { PaginationControl } from "@/hooks/PaginationControl.tsx";

const usePaginatedRoles = (itemsPerPage: number = 12) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
      const fetchRoles = async () => {
          try {
              const response = await getEditableRoles();
              setRoles(response);
          } catch (error) {
              toast.error(error.message, {
                  position: "bottom-right",
                  duration: 10000
              });
          } finally {
              setIsLoading(false);
          }
      };

      fetchRoles().then(r => { });
  }, []);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
      setCurrentPage(1);
  }, []);

  const filteredRoles = roles.filter((role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filteredRoles.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
      setCurrentPage(pageNumber);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const rolesOnPage = filteredRoles.slice(startIndex, endIndex);

  return {
      rolesOnPage,
      isLoading,
      searchTerm,
      pageCount,
      currentPage,
      handleSearch,
      handlePageChange,
      filteredRoles,
  }
};

export default function Groups({ itemsPerPage = 12 }: { itemsPerPage?: number }) {
  const {
      rolesOnPage,
      isLoading,
      searchTerm,
      pageCount,
      currentPage,
      handleSearch,
      handlePageChange,
      filteredRoles
  } = usePaginatedRoles(itemsPerPage);

  return (
    <div className="p-5 w-1/3 h-full flex flex-col">
      {!isLoading && (
        <div className="mb-5">
            <input
                type="text"
                placeholder="Пошук за назвою групи..."
                className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
                value={searchTerm}
                onChange={handleSearch}
            />
        </div>
      )}


      {isLoading ? (
        <ComponentLoadingSpinner />
      ) : (
        <div className="flex-grow">
          {filteredRoles.length === 0 ? (
            <div className="text-gray-400">Груп немає</div>
          ) : (
            <ul className="list-none p-0">
              {rolesOnPage.map((role) => (
                <li key={role.id} className="py-2 px-4 rounded bg-[#2f3136] text-white mb-2">
                  {role.name}
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
  );
}