import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getCategories, Category, getChannels, Channel } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import RenameIcon from '@/assets/icons/rename.svg';
import EditIcon from '@/assets/icons/edit.svg';
import DeleteIcon from '@/assets/icons/delete.svg';
import DeleteHoveredIcon from '@/assets/icons/delete_hover.svg';
import PlusIcon from '@/assets/icons/plus.svg';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isChannelsLoading, setIsChannelsLoading] = useState(false);
  const [channelsError, setChannelsError] = useState<string | null>(null);
  const channelsRef = useRef<HTMLDivElement>(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [hoveredChannelId, setHoveredChannelId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
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
                <div className="flex justify-start w-4/5" onClick={() => handleCategoryClick(category.id)}>
                  <span>{category.name}</span>
                </div>
                <div className="flex justify-end space-x-2">
                  <div className="relative group">
                    <img src={RenameIcon} alt="Перейменувати" className="w-5 h-5 cursor-pointer filter group-hover:brightness-200 transition-all duration-200"/>
                  </div>
                  <div className="relative group">
                    <img src={EditIcon} alt="Змінити" className="w-5 h-5 cursor-pointer filter group-hover:brightness-200 transition-all duration-200"/>
                  </div>
                  <div className="relative group">
                    <img
                      src={hoveredCategoryId === category.id ? DeleteHoveredIcon : DeleteIcon}
                      alt="Видалити"
                      className="w-5 h-5 cursor-pointer filter transition-all duration-200"
                      onMouseEnter={() => setHoveredCategoryId(category.id)}
                      onMouseLeave={() => setHoveredCategoryId(null)}
                    />
                  </div>
                </div>
              </div>
              {openCategoryId === category.id && (
                <div ref={channelsRef}
                     className="mt-2 overflow-hidden transition-max-height duration-300 ease-in-out">
                  {isChannelsLoading ? (
                      <div className="flex justify-center items-center p-2">
                        <LoadingSpinner/>
                      </div>
                  ) : channelsError ? (
                      <div className="text-red-500 p-2">Помилка завантаження каналів: {channelsError}</div>
                  ) : (
                      <>
                        {channels.length > 0 && (
                          <ul className="space-y-1">
                            {channels.map((channel) => (
                              <li key={channel.id} className="p-1 bg-[#2f3136] hover:bg-[#2a2c31] rounded ml-4 flex items-center justify-between pr-2">
                                <div className="flex justify-start w-4/5">
                                  <span>{channel.name.charAt(0).toUpperCase() + channel.name.slice(1)}</span>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <div className="relative group">
                                    <img
                                      src={RenameIcon}
                                        alt="Перейменувати"
                                        className="w-4 h-4 cursor-pointer filter group-hover:brightness-200 transition-all duration-200"
                                    />
                                  </div>
                                  <div className="relative group">
                                    <img
                                      src={hoveredChannelId === channel.id ? DeleteHoveredIcon : DeleteIcon}
                                      alt="Видалити"
                                      className="w-4 h-4 cursor-pointer filter transition-all duration-200"
                                      onMouseEnter={() => setHoveredChannelId(channel.id)}
                                      onMouseLeave={() => setHoveredChannelId(null)}
                                    />
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="flex items-center justify-center p-1 border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-gray-100 border rounded cursor-pointer mt-2 ml-4">
                            <img src={PlusIcon} alt="Створити канал" className="w-4 h-4"/>
                        </div>
                      </>
                  )}
                </div>
              )}
            </div>
          ))}
          {!isLoading && !error && (
              <div
                  className="w-full flex items-center justify-center p-2 border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-gray-100 border rounded cursor-pointer">
                  <img src={PlusIcon} alt="Створити категорію" className="w-5 h-5"/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}