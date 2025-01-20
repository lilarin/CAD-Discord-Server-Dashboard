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
} from '@/lib/api';
import { ChannelLoadingSpinner, ComponentLoadingSpinner } from '@/components/LoadingSpinner';
import RenameIcon from '@/assets/icons/rename.svg';
import EditIcon from '@/assets/icons/edit.svg';
import DeleteIcon from '@/assets/icons/delete.svg';
import CreateCategory from '@/assets/icons/create_category.svg';
import CreateChannel from '@/assets/icons/create_channel.svg';
import TextIcon from '@/assets/icons/text.svg';
import VoiceIcon from '@/assets/icons/voice.svg';
import ReorderIcon from '@/assets/icons/reorder.svg';
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

type ActionType = 'create' | 'rename' | 'edit' | 'delete' | null;
type ActionTarget = 'category' | 'channel' | null;

function DraggableCategory({
  category,
  handleCategoryClick,
  onActionTriggered,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { border: 'dashed 2px #6b727f' } : {}),
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
          <img
              src={ReorderIcon}
              alt="Перемістити"
              className="w-5 h-5 cursor-grab"
          />
        </span>
        <span>{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</span>
      </div>
      <div className="flex justify-end space-x-2">
        <div className="relative group" onClick={() => onActionTriggered('rename', 'category', category)}>
        <img
            src={RenameIcon}
            alt="Перейменувати"
            className="w-5 h-5 cursor-pointer filter group-hover:brightness-200 transition-all duration-200"
          />
        </div>
        <div className="relative group" onClick={() => onActionTriggered('edit', 'category', category)}>
          <img
            src={EditIcon}
            alt="Змінити"
            className="w-5 h-5 cursor-pointer filter group-hover:brightness-200 transition-all duration-200"
          />
        </div>
        <div className="relative group" onClick={() => onActionTriggered('delete', 'category', category)}>
          <img
            src={DeleteIcon}
            alt="Видалити"
            className="w-5 h-5 cursor-pointer filter group-hover:brightness-200 transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
}

function DraggableChannel({
  channel,
  onActionTriggered,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: channel.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { border: 'dashed 2px #6b727f', zIndex: 9999 } : {}),
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="p-1 bg-[#2f3136] hover:bg-[#2a2c31] rounded ml-4 flex items-center justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-start w-4/5 items-center">
        <span className="cursor-grab mr-2" {...attributes} {...listeners}>
          <img
              src={ReorderIcon}
              alt="Перемістити"
              className="w-5 h-5 cursor-grab"
          />
        </span>
        {channel.type === 'text' && (
            <img src={TextIcon} alt="Текстовий канал" className="w-4 h-4 mr-1"/>
        )}
        {channel.type === 'voice' && (
          <img src={VoiceIcon} alt="Голосовий канал" className="w-4 h-4 mr-1" />
        )}
        <span>{channel.name.charAt(0).toUpperCase() + channel.name.slice(1)}</span>
      </div>
      <div className={`flex justify-end space-x-2 pr-1 ${isHovered ? '' : 'opacity-0'}`}>
        <div className="relative group" onClick={() => onActionTriggered('rename', 'channel', channel)}>
          <img
            src={RenameIcon}
            alt="Перейменувати"
            className="w-4 h-4 cursor-pointer filter group-hover:brightness-200 transition-all duration-200"
          />
        </div>
        <div className="relative group" onClick={() => onActionTriggered('delete', 'channel', channel)}>
          <img
            src={DeleteIcon}
            alt="Видалити"
            className="w-4 h-4 cursor-pointer filter group-hover:brightness-200 transition-all duration-200"
          />
        </div>
      </div>
    </li>
  );
}

function ActionSidebar({ action, target, item, onCancel, onDeleteCategory, onDeleteChannel, onCreateCategory }) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const actionTextMap = {
    create: {
      category: 'Створення нової категорії',
      channel: 'Створення нового каналу',
    },
    rename: {
      category: `Перейменування категорії "${item?.name || ''}"`,
      channel: `Перейменування каналу "${item?.name || ''}"`,
    },
    edit: {
      category: `Редагування категорії "${item?.name || ''}"`,
    },
    delete: {
      category: `Видалити категорію "${item?.name || ''}"?`,
      channel: `Видалити канал "${item?.name || ''}"?`,
    },
  };

  const text = action && target ? actionTextMap[action][target] : '';

  const handleDeleteAction = () => {
    if (target === 'category' && item) {
      onDeleteCategory(item.id);
    } else if (target === 'channel' && item) {
      onDeleteChannel(item.id);
    }
  };

  const handleCreateAction = () => {
    if (target === 'category') {
      onCreateCategory(newCategoryName);
    }
  };

  return (
    <div className="w-full h-full pt-5 pr-5">
      <div className="bg-[#2F3136] rounded p-4">
        <h3 className="text-lg font-semibold mb-2">{text}</h3>
        {action === 'delete' && (
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={onCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Скасувати
            </button>
            <button
              onClick={handleDeleteAction}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Видалити
            </button>
          </div>
        )}
        {action === 'create' && target === 'category' && (
          <div className="space-y-2 mt-4">
            <input
              type="text"
              placeholder="Назва категорії"
              className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={onCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Скасувати
              </button>
              <button
                onClick={handleCreateAction}
                disabled={!newCategoryName.trim()}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              >
                Створити
              </button>
            </div>
          </div>
        )}
        {action !== 'delete' && action !== 'create' && (
          <div className="flex justify-end mt-4">
            <button
              onClick={onCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Закрити
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

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
        await createCategory(categoryName);
      } catch (error) {
        toast.error(error.message, {
          position: "bottom-right",
          duration: 10000
        });
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } finally {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      }
    },
    []
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
      setChannels((prevChannels) => prevChannels.filter((channel) => channel.id !== channelId));
      setActionSidebar({ action: null, target: null, item: null });

      try {
        await deleteChannel(channelId);
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
              <div className="mb-2">
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
                                  <ul className="mt-1">
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
                                <img src={CreateChannel} alt="Створити канал" className="w-4 h-4" />
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {!isLoading && filteredCategories.length > 0 && (
                    <div className="w-full flex items-center justify-center p-2 border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-gray-100 border rounded cursor-pointer" onClick={() => handleActionTriggered('create', 'category', null)}>
                      <img src={CreateCategory} alt="Створити категорію" className="w-5 h-5" />
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
          />
        </div>
      )}
    </div>
  );
}