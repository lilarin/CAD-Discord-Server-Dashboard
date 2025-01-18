import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Category,
  Channel,
  getCategories,
  getChannels,
  deleteCategory,
  deleteChannel,
  updateCategoryPosition,
  updateChannelPosition,
} from '@/lib/api';
import { ChannelLoadingSpinner, ComponentLoadingSpinner } from '@/components/LoadingSpinner';
import RenameIcon from '@/assets/icons/rename.svg';
import EditIcon from '@/assets/icons/edit.svg';
import DeleteIcon from '@/assets/icons/delete.svg';
import DeleteHoveredIcon from '@/assets/icons/delete_hover.svg';
import PlusIcon from '@/assets/icons/plus.svg';
import TextIcon from '@/assets/icons/text.svg';
import VoiceIcon from '@/assets/icons/voice.svg';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';

function DraggableCategory({
  category,
  handleCategoryClick,
  handleDeleteCategory,
  hoveredCategoryId,
  setHoveredCategoryId,
  openCategoryId
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { border: '2px dashed #ccc', opacity: 0.7 } : {}),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-full text-left p-2 bg-[#2F3136] hover:bg-[#292b2f] rounded flex items-center justify-between cursor-pointer"
    >
      <div
        className="flex justify-start items-center w-4/5"
        onClick={() => handleCategoryClick(category.id)}
      >
        <span className="cursor-grab mr-2" {...attributes} {...listeners}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </span>
        <span>{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</span>
      </div>
      <div className="flex justify-end space-x-2">
        <div className="relative group">
          <img
            src={RenameIcon}
            alt="Перейменувати"
            className="w-5 h-5 cursor-pointer filter group-hover:brightness-200 transition-all duration-200"
          />
        </div>
        <div className="relative group">
          <img
            src={EditIcon}
            alt="Змінити"
            className="w-5 h-5 cursor-pointer filter group-hover:brightness-200 transition-all duration-200"
          />
        </div>
        <div className="relative group" onClick={() => handleDeleteCategory(category.id)}>
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
  );
}

function DraggableChannel({
  channel,
  handleDeleteChannel,
  hoveredChannelId,
  setHoveredChannelId,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: channel.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { opacity: 0.7 } : {}),
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="p-1 bg-[#2f3136] hover:bg-[#2a2c31] rounded ml-4 flex items-center justify-between pr-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-start w-4/5 items-center">
        <span className="cursor-grab mr-2" {...attributes} {...listeners}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </span>
        {channel.type === 'text' && (
          <img src={TextIcon} alt="Текстовий канал" className="w-4 h-4 mr-1" />
        )}
        {channel.type === 'voice' && (
          <img src={VoiceIcon} alt="Голосовий канал" className="w-4 h-4 mr-1" />
        )}
        <span>{channel.name.charAt(0).toUpperCase() + channel.name.slice(1)}</span>
      </div>
      <div className={`flex justify-end space-x-2 items-center ${isHovered ? '' : 'opacity-0'}`}>
        <div className="relative group">
          <img
            src={RenameIcon}
            alt="Перейменувати"
            className="w-4 h-4 cursor-pointer filter group-hover:brightness-200 transition-all duration-200"
          />
        </div>
        <div className="relative group" onClick={() => handleDeleteChannel(channel.id)}>
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
  );
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isChannelsLoading, setIsChannelsLoading] = useState(false);
  const channelsRef = useRef<HTMLDivElement>(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(null);
  const [hoveredChannelId, setHoveredChannelId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response);
      } catch (error) {
          toast.error(error.message, {
          position: "bottom-right",
          duration: 10000
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = useCallback(
    async (categoryId: number) => {
      if (openCategoryId === categoryId) {
        setOpenCategoryId(null);
        setChannels([]);
        return;
      }

      setOpenCategoryId(categoryId);
      setIsChannelsLoading(true);
      try {
        const fetchedChannels = await getChannels(categoryId);
        setChannels(fetchedChannels);
      } catch (error) {
        toast.error(error.message, {
          position: "bottom-right",
          duration: 10000
        });
      } finally {
        setIsChannelsLoading(false);
      }
    },
    [openCategoryId]
  );

  const handleDeleteCategory = useCallback(
    async (categoryId: number) => {
        setCategories((prevCategories) =>
          prevCategories.filter((category) => category.id !== categoryId)
        );
        if (openCategoryId === categoryId) {
          setOpenCategoryId(null);
          setChannels([]);
        }
      try {
        await deleteCategory(categoryId);
      } catch (error) {
        toast.error(error.message, {
          position: "bottom-right",
          duration: 10000
        });
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      }
    },
    [openCategoryId]
  );

  const handleDeleteChannelFromCategory = useCallback(
    async (channelId: number) => {
      if (!openCategoryId) {
        return;
      }
      try {
        await deleteChannel(channelId);
        setChannels((prevChannels) => prevChannels.filter((channel) => channel.id !== channelId));
      } catch (error) {
        toast.error(error.message, {
          position: "bottom-right",
          duration: 10000
        });
      }
    },
    [openCategoryId]
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    async ({ active, over }) => {
      if (!over || active.id === over.id) {
        return;
      }

      if (categories.find((cat) => cat.id === active.id)) {
        const activeCategoryIndex = categories.findIndex((category) => category.id === active.id);
        const overCategoryIndex = categories.findIndex((category) => category.id === over.id);

        const newCategories = arrayMove(categories, activeCategoryIndex, overCategoryIndex);
        setCategories(newCategories);

        try {
          await updateCategoryPosition(active.id.toString(), overCategoryIndex);
        } catch (error) {
          toast.error(error.message, {
            position: "bottom-right",
            duration: 10000
          });
          const fetchedCategories = await getCategories();
          setCategories(fetchedCategories);
        }
      } else if (channels.find((channel) => channel.id === active.id) && openCategoryId) {
        const activeChannel = channels.find((channel) => channel.id === active.id);
        const overChannel = channels.find((channel) => channel.id === over.id);

        if (!activeChannel || !overChannel || activeChannel.type !== overChannel.type) {
          return;
        }

        const activeChannelIndex = channels.findIndex((channel) => channel.id === active.id);
        const overChannelIndex = channels.findIndex((channel) => channel.id === over.id);

        const newChannels = arrayMove(channels, activeChannelIndex, overChannelIndex);
        setChannels(newChannels);

        try {
          await updateChannelPosition(activeChannel.id, overChannel.position);
          const fetchedChannels = await getChannels(openCategoryId);
          setChannels(fetchedChannels);
        } catch (error) {
          toast.error(error.message, {
            position: "bottom-right",
            duration: 10000
          });
          const fetchedChannels = await getChannels(openCategoryId);
          setChannels(fetchedChannels);
        }
      }
    },
    [categories, channels, openCategoryId]
  );

  const textChannels = channels.filter((channel) => channel.type === 'text');
  const voiceChannels = channels.filter((channel) => channel.type === 'voice');

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
      <div className="p-6 flex justify-left">
        {isLoading && <ComponentLoadingSpinner />}
        <div className="w-2/3">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Пошук за назвою категорії..."
              className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <SortableContext items={filteredCategories.map((cat) => cat.id)}>
            <div className="mt-4 space-y-2">
              {filteredCategories.length === 0 && !isLoading && (
                <div className="flex items-center justify-left text-gray-400">Категорій немає</div>
              )}
              {filteredCategories.map((category) => (
                <div key={category.id}>
                  <DraggableCategory
                    category={category}
                    handleCategoryClick={handleCategoryClick}
                    handleDeleteCategory={handleDeleteCategory}
                    openCategoryId={openCategoryId}
                    hoveredCategoryId={hoveredCategoryId}
                    setHoveredCategoryId={setHoveredCategoryId}
                  />
                  {openCategoryId === category.id && (
                    <div
                      ref={channelsRef}
                      className="mt-2 overflow-hidden transition-max-height duration-300 ease-in-out"
                    >
                      {isChannelsLoading ? (
                        <div className="flex justify-center items-center p-2">
                          <ChannelLoadingSpinner />
                        </div>
                      ) : (
                        <>
                          {textChannels.length > 0 && (
                            <SortableContext items={textChannels.map((channel) => channel.id)}>
                              <ul className="space-y-1">
                                {textChannels.map((channel) => (
                                  <DraggableChannel
                                    key={channel.id}
                                    channel={channel}
                                    handleDeleteChannel={handleDeleteChannelFromCategory}
                                    hoveredChannelId={hoveredChannelId}
                                    setHoveredChannelId={setHoveredChannelId}
                                  />
                                ))}
                              </ul>
                            </SortableContext>
                          )}
                          {voiceChannels.length > 0 && (
                            <SortableContext items={voiceChannels.map((channel) => channel.id)}>
                              <ul className="space-y-1 mt-1">
                                {voiceChannels.map((channel) => (
                                  <DraggableChannel
                                    key={channel.id}
                                    channel={channel}
                                    handleDeleteChannel={handleDeleteChannelFromCategory}
                                    hoveredChannelId={hoveredChannelId}
                                    setHoveredChannelId={setHoveredChannelId}
                                  />
                                ))}
                              </ul>
                            </SortableContext>
                          )}
                          {textChannels.length === 0 && voiceChannels.length === 0 && (
                            <div className="flex items-center justify-left ml-4 text-gray-400">
                              Каналів немає
                            </div>
                          )}
                          <div className="flex items-center justify-center p-1 border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-gray-100 border rounded cursor-pointer mt-2 ml-4">
                            <img src={PlusIcon} alt="Створити канал" className="w-4 h-4" />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {!isLoading && filteredCategories.length > 0 && (
                <div className="w-full flex items-center justify-center p-2 border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-gray-100 border rounded cursor-pointer">
                  <img src={PlusIcon} alt="Створити категорію" className="w-5 h-5" />
                </div>
              )}
              {!isLoading && filteredCategories.length === 0 && (
                <div className="w-full flex items-center justify-center p-2 border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-gray-100 border rounded cursor-pointer">
                  <img src={PlusIcon} alt="Створити категорію" className="w-5 h-5" />
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      </div>
    </DndContext>
  );
}