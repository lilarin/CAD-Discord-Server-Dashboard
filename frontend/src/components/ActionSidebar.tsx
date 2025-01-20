import React, { useState, useEffect } from 'react';
import {Category, Channel} from "@/lib/api.ts";
import HintIcon from "@/assets/icons/hint.svg";

type ActionType = 'create' | 'rename' | 'edit' | 'delete' | null;
type ActionTarget = 'category' | 'channel' | null;

interface ActionSidebarProps {
  action: ActionType;
  target: ActionTarget;
  item: Category | Channel | null;
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
  const [showHint, setShowHint] = useState(false);

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
      category: `Редагування доступу ролей до категорії "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"`,
    },
    delete: {
      category: `Видалити категорію "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"?`,
      channel: `Видалити канал "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"?`,
    },
  };

  const hintTextMap = {
    create: {
      category: 'Категорію варто сприймати як дисципліну, чи розділ зі своїми каналами та доступом',
      channel: 'Введіть назву для каналу та оберіть його тип',
    },
    rename: {
      category: 'Регістр для назви каналу не враховується та обробляється автоматично',
      channel: 'Регістр для назви категорії не враховується та обробляється автоматично',
    },
    edit: {},
    delete: {
      category: 'При видаленні категорії всі канали в ній також будуть видалені',
    },
  };

  const text = action && target ? actionTextMap[action][target] : '';
  const hintText = action && target ? hintTextMap[action][target] : '';

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
        <span className="text-lg font-semibold mb-2">{text}</span>
        {action === 'delete' && (
          <div className="flex justify-between items-center pt-3 pb-1">
            <div className="flex justify-start space-x-3">
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
            {hintText && (
              <button
                onMouseEnter={() => setShowHint(true)}
                onMouseLeave={() => setShowHint(false)}
                className="focus:outline-none"
              >
                <img src={HintIcon} alt="Інформація" className="w-6 h-6" />
              </button>
            )}
          </div>
        )}
        {action === 'create' && target === 'category' && (
          <div>
            <div className="space-y-2 mt-4">
              <input
                  type="text"
                  placeholder="Назва категорії"
                  className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            </div>
            <div className="flex justify-between items-center pt-3 pb-1">
              <div className="flex justify-start space-x-3">
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
              {hintText && (
                <button
                  onMouseEnter={() => setShowHint(true)}
                  onMouseLeave={() => setShowHint(false)}
                  className="focus:outline-none"
                >
                  <img src={HintIcon} alt="Інформація" className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        )}
        {action === 'create' && target === 'channel' && (
          <div>
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
              </div>
            <div className="flex justify-between items-center pt-3 pb-1">
              <div className="flex justify-start space-x-3">
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
              {hintText && (
                <button
                  onMouseEnter={() => setShowHint(true)}
                  onMouseLeave={() => setShowHint(false)}
                  className="focus:outline-none"
                >
                  <img src={HintIcon} alt="Інформація" className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        )}
        {action === 'rename' && target === 'category' && item && (
          <div>
            <div className="space-y-2 mt-4">
                <input
                    type="text"
                    placeholder="Нова назва категорії"
                    className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
                    value={renameCategoryName}
                    onChange={(e) => setRenameCategoryName(e.target.value)}
                />
            </div>
            <div className="flex justify-between items-center pt-3 pb-1">
              <div className="flex justify-start space-x-3">
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
              {hintText && (
                <button
                  onMouseEnter={() => setShowHint(true)}
                  onMouseLeave={() => setShowHint(false)}
                  className="focus:outline-none"
                >
                  <img src={HintIcon} alt="Інформація" className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        )}
        {action === 'rename' && target === 'channel' && item && (
          <div>
            <div className="space-y-2 mt-4">
                <input
                    type="text"
                    placeholder="Нова назва каналу"
                    className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
                    value={renameChannelName}
                    onChange={(e) => setRenameChannelName(e.target.value)}
                />
            </div>
            <div className="flex justify-between items-center pt-3 pb-1">
              <div className="flex justify-start space-x-3">
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
              {hintText && (
                <button
                  onMouseEnter={() => setShowHint(true)}
                  onMouseLeave={() => setShowHint(false)}
                  className="focus:outline-none"
                >
                  <img src={HintIcon} alt="Інформація" className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {showHint && hintText && (
        <div className="w-full pt-5">
          <div className="bg-[#2F3136] rounded p-4">
            <h3 className="font-semibold mb-2">Підказка</h3>
            <h3 className="font-light">{hintText}</h3>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActionSidebar;