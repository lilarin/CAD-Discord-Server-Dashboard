import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Category,
  Channel,
  getCategories,
  createCategory,
  deleteCategory,
  getChannels,
  deleteChannel,
  updateCategoryPosition,
  updateChannelPosition,
  createChannel,
  renameChannel,
  renameCategory,
} from '@/lib/api';
import { ChannelLoadingSpinner, ComponentLoadingSpinner } from '@/components/LoadingSpinner';
import CreateCategoryIcon from '@/assets/icons/create_category.svg';
import CreateChannelIcon from '@/assets/icons/create_channel.svg';
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
import toast from 'react-hot-toast';
import DraggableChannel from "@/components/DraggableChannel.tsx";
import DraggableCategory from "@/components/DraggableCategory.tsx";
import ActionSidebar from '@/components//ActionSidebar';

type ActionType = 'create' | 'rename' | 'edit' | 'delete' | null;
type ActionTarget = 'category' | 'channel' | null;

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isChannelsLoading, setIsChannelsLoading] = useState(false);
  const channelsRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDraggingCategory, setIsDraggingCategory] = useState(false);
  const [actionSidebar, setActionSidebar] = useState<{
    action: ActionType;
    target: ActionTarget;
    item: Category | Channel | null;
  }>({ action: null, target: null, item: null });

  const handleActionTriggered = (action: ActionType, target: ActionTarget, item: Category | Channel | null) => {
    setActionSidebar({ action, target, item });
  };

  const handleCancelAction = () => {
    setActionSidebar({ action: null, target: null, item: null });
  };

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

    fetchCategories().then(r => {});
  }, []);

  const handleCategoryClick = useCallback(
    async (categoryId: number) => {
      if (isDraggingCategory) {
        return;
      }
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
    [openCategoryId, isDraggingCategory]
  );

  const handleCreateCategory = useCallback(
    async (categoryName: string) => {
      const tempId = Date.now();
      const newCategory: Category = { id: tempId, name: categoryName };
      setCategories((prevCategories) => [...prevCategories, newCategory]);
      setActionSidebar({ action: null, target: null, item: null });

      try {
        const categories = await createCategory(categoryName);
        setCategories(categories);
      } catch (error) {
        toast.error(error.message, {
          position: "bottom-right",
          duration: 10000
        });
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      }
    },
    []
  );

  const handleCreateChannel = useCallback(
    async (channelName: string, channelType: 'text' | 'voice') => {
      const tempId = Date.now();
      const newChannel: Channel = { id: tempId, name: channelName, type: channelType, position: 100 };
      setChannels((prevChannels) => [...prevChannels, newChannel]);
      setActionSidebar({ action: null, target: null, item: null });

      try {
        const channels = await createChannel(openCategoryId, channelName, channelType);
        setChannels(channels);
      } catch (error) {
        toast.error(error.message, {
          position: "bottom-right",
          duration: 10000,
        });
        const channels = await getChannels(openCategoryId)
        setChannels(channels);
      }
    },
    [openCategoryId]
  );

  const handleRenameCategory = useCallback(
    async (categoryId: number, newName: string) => {
      setCategories(prevCategories =>
          prevCategories.map(category =>
              category.id === categoryId ? { ...category, name: newName } : category
          )
      );
      setActionSidebar({ action: null, target: null, item: null });

      try {
          const updatedCategories = await renameCategory(categoryId, newName);
          setCategories(updatedCategories);
      } catch (error) {
          toast.error(error.message, {
              position: "bottom-right",
              duration: 10000,
          });
          const fetchedCategories = await getCategories();
          setCategories(fetchedCategories);
      }
    },
    []
  );

  const handleRenameChannel = useCallback(
      async (channelId: number, newName: string) => {
          setChannels(prevChannels =>
              prevChannels.map(channel =>
                  channel.id === channelId ? { ...channel, name: newName } : channel
              )
          );
          setActionSidebar({ action: null, target: null, item: null });

          try {
              const updatedChannels = await renameChannel(channelId, newName);
              setChannels(updatedChannels);
          } catch (error) {
              toast.error(error.message, {
                  position: "bottom-right",
                  duration: 10000,
              });
              const fetchedChannels = await getChannels(openCategoryId);
              setChannels(fetchedChannels);
          }
      },
      [openCategoryId]
  );

  const handleDeleteCategory = useCallback(
    async (categoryId: number) => {
      if (openCategoryId === categoryId) {
        setOpenCategoryId(null);
        setChannels([]);
      }
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category.id !== categoryId)
      );
      setActionSidebar({ action: null, target: null, item: null });

      try {
        const categories = await deleteCategory(categoryId);
        setCategories(categories);
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
      setChannels((prevChannels) => prevChannels.filter((channel) => channel.id !== channelId));
      setActionSidebar({ action: null, target: null, item: null });

      try {
        const channels = await deleteChannel(channelId);
        setChannels(channels);
      } catch (error) {
        toast.error(error.message, {
          position: "bottom-right",
          duration: 10000
        });
        const fetchedChannels = await getChannels(openCategoryId);
        setChannels(fetchedChannels);
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

  const handleDragStart = useCallback(({ active }) => {
    if (categories.find((cat) => cat.id === active.id)) {
      setIsDraggingCategory(true);
    }
  }, [categories]);

  const handleDragEnd = useCallback(
    async ({ active, over }) => {
      setIsDraggingCategory(false);
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
    <div className="flex">
      <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={sensors}>
        <div className="p-5 w-2/3">
          {isLoading ? (
              <ComponentLoadingSpinner/>
          ) : (
            <div>
              <div className="mb-5">
                <input
                  type="text"
                  placeholder="Пошук за назвою категорії..."
                  className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>

              <SortableContext items={filteredCategories.map((cat) => cat.id)}>
                <div className="space-y-2">
                  {filteredCategories.length === 0 && !isLoading && (
                    <div className="text-gray-400">Категорій немає</div>
                  )}
                  {filteredCategories.map((category) => (
                    <div key={category.id}>
                      <DraggableCategory
                        category={category}
                        handleCategoryClick={handleCategoryClick}
                        onActionTriggered={handleActionTriggered}
                      />
                      {openCategoryId === category.id && !isDraggingCategory && (
                        <div
                          ref={channelsRef}
                          className="overflow-hidden transition-max-height duration-300 ease-in-out"
                        >
                          {isChannelsLoading ? (
                            <ChannelLoadingSpinner />
                          ) : (
                            <>
                              {textChannels.length > 0 && (
                                <SortableContext items={textChannels.map((channel) => channel.id)}>
                                  <ul className="space-y-1 mt-1">
                                    {textChannels.map((channel) => (
                                      <DraggableChannel
                                        key={channel.id}
                                        channel={channel}
                                        onActionTriggered={handleActionTriggered}
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
                                        onActionTriggered={handleActionTriggered}
                                      />
                                    ))}
                                  </ul>
                                </SortableContext>
                              )}
                              {textChannels.length === 0 && voiceChannels.length === 0 && (
                                <div className="flex items-center justify-left ml-4 mt-2 mb-2 text-gray-400">
                                  Каналів немає
                                </div>
                              )}
                              <div className="flex justify-center p-1.5 border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-gray-100 border rounded cursor-pointer mt-1.5 ml-4" onClick={() => handleActionTriggered('create', 'channel', null)}>
                                <img src={CreateChannelIcon} alt="Створити канал" className="w-4 h-4" />
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {!isLoading && filteredCategories.length > 0 && (
                    <div className="w-full flex items-center justify-center p-2 border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-gray-100 border rounded cursor-pointer" onClick={() => handleActionTriggered('create', 'category', null)}>
                      <img src={CreateCategoryIcon} alt="Створити категорію" className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          )}
        </div>
      </DndContext>
      {actionSidebar.action && actionSidebar.target && (
        <div className="w-1/3">
          <ActionSidebar
            action={actionSidebar.action}
            target={actionSidebar.target}
            item={actionSidebar.item}
            onCancel={handleCancelAction}
            onDeleteCategory={handleDeleteCategory}
            onDeleteChannel={handleDeleteChannelFromCategory}
            onCreateCategory={handleCreateCategory}
            onCreateChannel={handleCreateChannel}
            onRenameCategory={handleRenameCategory}
            onRenameChannel={handleRenameChannel}
          />
        </div>
      )}
    </div>
  );
}