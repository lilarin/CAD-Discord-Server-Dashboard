import React, { useState, useEffect } from 'react';
import {Category, Channel} from "@/lib/api.ts";

type ActionType = 'create' | 'rename' | 'edit' | 'delete' | null;
type ActionTarget = 'category' | 'channel' | null;

interface ActionSidebarProps {
  action: ActionType;
  target: ActionTarget;
  item: Category | Channel
  onCancel: () => void;
  onDeleteCategory?: (id: number) => void;
  onDeleteChannel?: (id: number) => void;
  onCreateCategory?: (name: string) => void;
  onCreateChannel?: (name: string, type: 'text' | 'voice') => void;
  onRenameCategory?: (id: number, newName: string) => void;
  onRenameChannel?: (id: number, newName: string) => void;
}

function ActionSidebar({ action, target, item, onCancel, onDeleteCategory, onDeleteChannel, onCreateCategory, onCreateChannel, onRenameCategory, onRenameChannel }: ActionSidebarProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'text' | 'voice'>('text');
  const [renameCategoryName, setRenameCategoryName] = useState('');
  const [renameChannelName, setRenameChannelName] = useState('');

    useEffect(() => {
        if (action === 'rename') {
            if (target === 'category' && item) {
                setRenameCategoryName(item.name);
            } else if (target === 'channel' && item) {
                setRenameChannelName(item.name);
            }
        }
    }, [action, target, item]);

    const actionTextMap = {
    create: {
      category: 'Створення нової категорії',
      channel: 'Створення нового каналу',
    },
    rename: {
      category: `Перейменування категорії "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"`,
      channel: `Перейменування каналу "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"`,
    },
    edit: {
      category: `Редагування категорії "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"`,
    },
    delete: {
      category: `Видалити категорію "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"?`,
      channel: `Видалити канал "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"?`,
    },
  };

  const text = action && target ? actionTextMap[action][target] : '';

  const handleDeleteAction = () => {
    if (target === 'category' && item) {
      onDeleteCategory?.(item.id);
    } else if (target === 'channel' && item) {
      onDeleteChannel?.(item.id);
    }
  };

  const handleCreateAction = () => {
    if (target === 'category') {
      onCreateCategory?.(newCategoryName);
    }
    if (target === 'channel') {
      onCreateChannel?.(newChannelName, newChannelType);
    }
  };

  const handleRenameAction = () => {
    if (target === 'category' && item) {
      onRenameCategory?.(item.id, renameCategoryName);
    } else if (target === 'channel' && item) {
      onRenameChannel?.(item.id, renameChannelName);
    }
  };

  const isRenameCategoryDisabled = !renameCategoryName.trim() || (item && renameCategoryName.trim().toLowerCase() === item.name.toLowerCase());
  const isRenameChannelDisabled = !renameChannelName.trim() || (item && renameChannelName.trim().toLowerCase() === item.name.toLowerCase());

  return (
    <div className="w-full h-full pt-5 pr-5">
      <div className="bg-[#2F3136] rounded p-4">
        <h3 className="text-lg font-semibold mb-2">{text}</h3>
        {action === 'delete' && (
            <div className="flex justify-start space-x-3 pt-3 pb-1">
              <button
                  onClick={handleDeleteAction}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Видалити
              </button>
              <button
                  onClick={onCancel}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Скасувати
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
            <div className="flex justify-start space-x-3 pt-3 pb-1">
              <button
                  onClick={handleCreateAction}
                  disabled={!newCategoryName.trim()}
                  className={`bg-green-600 ${
                      (newCategoryName.trim()) ? 'hover:bg-green-700' : ''
                  } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-40`}
              >
                Створити
              </button>
              <button
                  onClick={onCancel}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Скасувати
              </button>
            </div>
          </div>
        )}
        {action === 'create' && target === 'channel' && (
            <div className="space-y-2 mt-4">
              <input
                  type="text"
                  placeholder="Назва каналу"
                  className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
            />
            <div className="flex justify-start space-x-3 p-1">
              Тип каналу
            </div>
            <select
              className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
              value={newChannelType}
              onChange={(e) => setNewChannelType(e.target.value as 'text' | 'voice')}
            >
              <option value="text">Текстовий</option>
              <option value="voice">Голосовий</option>
            </select>
              <div className="flex justify-start space-x-3 pt-3 pb-1">
                <button
                    onClick={handleCreateAction}
                    disabled={!newChannelName.trim()}
                    className={`bg-green-600 ${
                        (newChannelName.trim()) ? 'hover:bg-green-700' : ''
                    } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-40`}
                >
                  Створити
                </button>
                <button
                    onClick={onCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Скасувати
                </button>
              </div>
            </div>
        )}
        {action === 'rename' && target === 'category' && item && (
            <div className="space-y-2 mt-4">
                <input
                    type="text"
                    placeholder="Нова назва категорії"
                    className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
                    value={renameCategoryName}
                    onChange={(e) => setRenameCategoryName(e.target.value)}
                />
                <div className="flex justify-start space-x-3 pt-3 pb-1">
                    <button
                        onClick={handleRenameAction}
                        disabled={isRenameCategoryDisabled}
                        className={`bg-green-600 ${
                            (!isRenameCategoryDisabled) ? 'hover:bg-green-700' : ''
                        } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-40`}
                    >
                        Зберегти
                    </button>
                    <button
                        onClick={onCancel}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Скасувати
                    </button>
                </div>
            </div>
        )}
        {action === 'rename' && target === 'channel' && item && (
            <div className="space-y-2 mt-4">
                <input
                    type="text"
                    placeholder="Нова назва каналу"
                    className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
                    value={renameChannelName}
                    onChange={(e) => setRenameChannelName(e.target.value)}
                />
                <div className="flex justify-start space-x-3 pt-3 pb-1">
                    <button
                        onClick={handleRenameAction}
                        disabled={isRenameChannelDisabled}
                        className={`bg-green-600 ${
                            (!isRenameChannelDisabled) ? 'hover:bg-green-700' : ''
                        } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-40`}
                    >
                        Зберегти
                    </button>
                    <button
                        onClick={onCancel}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Скасувати
                    </button>
                </div>
            </div>
        )}
        {action !== 'delete' && action !== 'create' && action !== 'rename' && (
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

export default ActionSidebar;