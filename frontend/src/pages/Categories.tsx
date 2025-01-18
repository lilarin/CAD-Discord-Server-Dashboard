import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getCategories, Category, getChannels, Channel } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import RenameIcon from '@/assets/icons/rename.svg';
import EditIcon from '@/assets/icons/edit.svg';
import DeleteIcon from '@/assets/icons/delete.svg';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isChannelsLoading, setIsChannelsLoading] = useState(false);
  const [channelsError, setChannelsError] = useState<string | null>(null);
  const channelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getCategories();
        setCategories(response);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = useCallback(async (categoryId: string) => {
    if (openCategoryId === categoryId) {
      setOpenCategoryId(null);
      return;
    }

    setOpenCategoryId(categoryId);
    setIsChannelsLoading(true);
    setChannelsError(null);
    try {
      const fetchedChannels = await getChannels(categoryId);
      setChannels(fetchedChannels);
    } catch (error: any) {
      setChannelsError(error.message);
    } finally {
      setIsChannelsLoading(false);
    }
  }, [openCategoryId]);

  return (
    <div className="p-6 flex justify-left">
      <div className="w-1/2">
        {isLoading && (
          <div className="flex justify-center items-center">
            <LoadingSpinner />
          </div>
        )}
        {error && <div className="text-red-500">Помилка завантаження категорій: {error}</div>}
        <div className="mt-4 space-y-2">
          {categories.map((category) => (
            <div key={category.id}>
              <div
                className="w-full text-left p-2 bg-[#2F3136] hover:bg-[#292b2f] rounded flex items-center justify-between cursor-pointer"
              >
                <div className="flex justify-start w-1/2" onClick={() => handleCategoryClick(category.id)}>
                  <span>{category.name}</span>
                </div>
                <div className="flex justify-end space-x-2">
                  <img src={RenameIcon} alt="Переименовать" className="w-5 h-5 cursor-pointer" />
                  <img src={EditIcon} alt="Изменить" className="w-5 h-5 cursor-pointer" />
                  <img src={DeleteIcon} alt="Удалить" className="w-5 h-5 cursor-pointer" />
                </div>
              </div>
              {openCategoryId === category.id && (
                <div ref={channelsRef} className="mt-2 overflow-hidden transition-max-height duration-300 ease-in-out">
                  {isChannelsLoading ? (
                    <div className="flex justify-center items-center p-2">
                      <LoadingSpinner/>
                    </div>
                  ) : channelsError ? (
                    <div className="text-red-500 p-2">Помилка завантаження каналів: {channelsError}</div>
                  ) : channels.length > 0 ? (
                    <ul className="space-y-1">
                      {channels.map((channel) => (
                        <li key={channel.id} className="p-1 bg-[#2f3136] hover:bg-[#2a2c31] rounded ml-4">
                          <div className="flex justify-start w-full">
                            <span>{channel.name.charAt(0).toUpperCase() + channel.name.slice(1)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-2 text-gray-500 ml-4">Немає каналів у цій категорії.</div>
                  )}
                </div>
              )}
            </div>
          ))}
          <div className="w-full text-center p-2 border-dashed border-gray-500 border rounded cursor-pointer">
            Створити нову категорію
          </div>
        </div>
      </div>
    </div>
  );
}