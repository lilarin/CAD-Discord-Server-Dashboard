import React, {useState, useEffect, useMemo, useRef} from 'react';
import {Category, Channel, Role, getCategoryAccessRoles, editCategoryPermissions, getRoles} from "@/lib/api.ts";
import HintIcon from "@/assets/icons/hint.svg";
import DeleteIcon from "@/assets/icons/delete.svg";
import AddRoleIcon from "@/assets/icons/add_role.svg";
import { ChannelLoadingSpinner } from '@/components/LoadingSpinner';
import toast from "react-hot-toast";

export type ActionType = 'create' | 'rename' | 'edit' | 'delete' | null;
export type ActionTarget = 'category' | 'channel' | 'role' | null;

interface ActionSidebarProps {
  action: ActionType;
  target: ActionTarget;
  item: Category | Channel | Role | null;
  onCancel: () => void;
  onDeleteCategory?: (id: number) => void;
  onDeleteChannel?: (id: number) => void;
    onDeleteRole?: (id: number) => void;
  onCreateCategory?: (name: string) => void;
  onCreateChannel?: (name: string, type: 'text' | 'voice') => void;
  onRenameCategory?: (id: number, newName: string) => void;
  onRenameChannel?: (id: number, newName: string) => void;
  onRenameRole?: (id: number, newName: string) => void;
}

function ActionSidebar({ action, target, item, onCancel, onDeleteCategory, onDeleteChannel, onCreateCategory, onCreateChannel, onRenameCategory, onRenameChannel, onDeleteRole, onRenameRole }: ActionSidebarProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'text' | 'voice'>('text');
  const [renameCategoryName, setRenameCategoryName] = useState('');
  const [renameChannelName, setRenameChannelName] = useState('');
    const [renameRoleName, setRenameRoleName] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [initialRoles, setInitialRoles] = useState<Role[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [isRoleListOpen, setIsRoleListOpen] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [allRolesList, setAllRolesList] = useState<Role[]>([]);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (action === 'rename') {
      if (target === 'category' && item) {
        setRenameCategoryName(item.name);
      } else if (target === 'channel' && item) {
        setRenameChannelName(item.name);
      } else if (target === 'role' && item) {
          setRenameRoleName(item.name)
      }
    }
  }, [action, target, item]);

  useEffect(() => {
    const fetchAllRoles = async () => {
      try {
        const fetchedAllRoles = await getRoles();
        setAllRolesList(fetchedAllRoles);
      } catch (error) {
        toast.error("Не вдалося завантажити список ролей", {
          position: "bottom-right",
          duration: 5000
        });
        setAllRolesList([]);
      }
    };

    if (action === 'edit' && target === 'category' && item) {
      const fetchRoles = async () => {
        setIsLoadingPermissions(true);
        try {
          const fetchedRoles = await getCategoryAccessRoles(item.id);
          setRoles(fetchedRoles);
          setInitialRoles([...fetchedRoles]);
        } catch (error) {
          toast.error(error.message, {
            position: "bottom-right",
            duration: 10000
          });
          setRoles([]);
        } finally {
          setIsLoadingPermissions(false);
        }
      };
      fetchRoles().then(r => {});
      fetchAllRoles().then(r => {});
    } else {
      setRoles([]);
      setInitialRoles([]);
      setIsRoleListOpen(false);
      setAvailableRoles([]);
    }
  }, [action, target, item]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isRoleListOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsRoleListOpen(false);
      }
    }

    if (isRoleListOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isRoleListOpen]);


    const actionTextMap = {
    create: {
      category: 'Створення нової категорії',
      channel: 'Створення нового каналу',
    },
    rename: {
      category: `Перейменування категорії "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"`,
      channel: `Перейменування каналу "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"`,
        role: `Перейменування ролі "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"`,
    },
    edit: {
      category: `Редагування доступу ролей до категорії "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"`,
    },
    delete: {
      category: `Видалити категорію "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"?`,
      channel: `Видалити канал "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"?`,
        role: `Видалити роль "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"?`,
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
    edit: {
      category: 'Оберіть ролі для доступу до категорії та всіх її каналів',
    },
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
    } else if(target === 'role' && item) {
        onDeleteRole?.(item.id)
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
    } else if(target === 'role' && item) {
        onRenameRole?.(item.id, renameRoleName)
    }
  };

  const handleSavePermissions = async () => {
    if (action === 'edit' && target === 'category' && item) {
      onCancel();
      try {
        const roleIds = roles.map(role => role.id);
        if (!isEditCategoryDisabled) {
          await editCategoryPermissions(item.id, roleIds);
          setInitialRoles([...roles]);
        }
      } catch (error) {
        toast.error(error.message, {
          position: "bottom-right",
          duration: 10000
        });
        const fetchedRoles = await getCategoryAccessRoles(item.id);
        setRoles(fetchedRoles);
      }
    }
  };

  const handleRemoveRole = (roleId: number) => {
    setRoles(roles.filter(role => role.id !== roleId));
  };

  const handleAddRole = () => {
    if (action === 'edit' && target === 'category') {
      const available = allRolesList.filter(allRole => !roles.some(selectedRole => selectedRole.id === allRole.id));
      setAvailableRoles(available);
      setIsRoleListOpen(true);
      setShowHint(false);
      setRoleSearchTerm('');
    }
  };

  const handleSelectAvailableRole = (roleToAdd: Role) => {
    setRoles([...roles, roleToAdd]);
    setAvailableRoles(availableRoles.filter(role => role.id !== roleToAdd.id));
    setIsRoleListOpen(false);
  };

  const filteredAvailableRoles = useMemo(() => {
    const term = roleSearchTerm.toLowerCase();
    return availableRoles.filter(role => role.name.toLowerCase().includes(term));
  }, [availableRoles, roleSearchTerm]);


  const isRenameCategoryDisabled = !renameCategoryName.trim() || (item && renameCategoryName.trim().toLowerCase() === item.name.toLowerCase());
  const isRenameChannelDisabled = !renameChannelName.trim() || (item && renameChannelName.trim().toLowerCase() === item.name.toLowerCase());
    const isRenameRoleDisabled = !renameRoleName.trim() || (item && renameRoleName.trim().toLowerCase() === item.name.toLowerCase());

  const isEditCategoryDisabled = useMemo(() => {
    if (action === 'edit' && target === 'category') {
      if (!initialRoles || !roles) return true;
      if (initialRoles.length !== roles.length) return false;
      const initialRoleIds = initialRoles.map(r => r.id).sort();
      const currentRoleIds = roles.map(r => r.id).sort();
      return initialRoleIds.every((id, index) => id === currentRoleIds[index]);
    }
    return true;
  }, [action, target, initialRoles, roles]);

  // Sort roles by name
  const sortedRoles = useMemo(() => {
    return [...roles].sort((a, b) => a.name.localeCompare(b.name));
  }, [roles]);


  return (
    <div className="w-full h-full">
      <div className="bg-[#2F3136] rounded p-4">
        <span className="text-lg font-semibold mb-2">{text}</span>
        {action === 'delete' && (
            <div className="flex justify-between items-center pt-4 pb-1">
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
                    <img src={HintIcon} alt="Інформація" className="w-6 h-6"/>
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
              <div className="flex justify-between items-center pt-4 pb-1">
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
                      <img src={HintIcon} alt="Інформація" className="w-6 h-6"/>
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
              <div className="flex justify-between items-center pt-4 pb-1">
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
                      <img src={HintIcon} alt="Інформація" className="w-6 h-6"/>
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
              <div className="flex justify-between items-center pt-4 pb-1">
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
                      <img src={HintIcon} alt="Інформація" className="w-6 h-6"/>
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
              <div className="flex justify-between items-center pt-4 pb-1">
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
                      <img src={HintIcon} alt="Інформація" className="w-6 h-6"/>
                    </button>
                )}
              </div>
            </div>
        )}
          {action === 'rename' && target === 'role' && item && (
              <div>
                  <div className="space-y-2 mt-4">
                      <input
                          type="text"
                          placeholder="Нова назва ролі"
                          className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
                          value={renameRoleName}
                          onChange={(e) => setRenameRoleName(e.target.value)}
                      />
                  </div>
                  <div className="flex justify-between items-center pt-4 pb-1">
                      <div className="flex justify-start space-x-3">
                          <button
                              onClick={handleRenameAction}
                              disabled={isRenameRoleDisabled}
                              className={`bg-green-600 ${
                                  (!isRenameRoleDisabled) ? 'hover:bg-green-700' : ''
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
                              <img src={HintIcon} alt="Інформація" className="w-6 h-6"/>
                          </button>
                      )}
                  </div>
              </div>
          )}
        {action === 'edit' && target === 'category' && item && (
            <div>
              {isLoadingPermissions ? (
                  <div className="flex justify-center items-center p-2">
                    <ChannelLoadingSpinner/>
                  </div>
              ) : sortedRoles.length > 0 ? (
                  <ul className="space-y-2 mt-2">
                    <h3 className="font-light">Ролі з доступом:</h3>
                    {sortedRoles.map(role => (
                        <li key={role.id}
                            className="bg-[#36393F] rounded pl-2 p-1.5 flex justify-between items-center hover:bg-[#3e4147] pr-1.5">
                          {role.name}
                          <button onClick={() => handleRemoveRole(role.id)}>
                            <img
                                src={DeleteIcon}
                                alt="Видалити"
                                className="w-5 h-5 cursor-pointer hover:brightness-200 transition-all duration-200"
                            />
                          </button>
                        </li>
                    ))}
                  </ul>
              ) : (
                  <div className="text-gray-400 mt-2 mb-2">Немає ролей з доступом до цієї категорії</div>
              )}
              {!isLoadingPermissions && (
                  <div
                      className="flex justify-center p-2 border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-gray-100 border rounded cursor-pointer mt-2"
                      onClick={handleAddRole}>
                    <img src={AddRoleIcon} alt="Додати роль" className="w-4 h-4 mr-2"/>
                  </div>
              )}
              <div className="flex justify-between items-center pt-4 pb-1">
                <div className="flex justify-start space-x-3">
                  <button
                      onClick={handleSavePermissions}
                      disabled={isEditCategoryDisabled}
                      className={`bg-green-600 ${
                          (!isEditCategoryDisabled) ? 'hover:bg-green-700' : ''
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
                      <img src={HintIcon} alt="Інформація" className="w-6 h-6"/>
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
      {isRoleListOpen && availableRoles.length > 0 && (
        <div ref={dropdownRef} className="w-full pt-5 relative">
          <div className="bg-[#2F3136] rounded p-4">
            <div className="border-gray-500">
              <input
                  type="text"
                  placeholder="Пошук за назвою ролі..."
                  className="w-full mb-1 p-2 rounded bg-[#292B2F] text-white focus:outline-none"
                  value={roleSearchTerm}
                  onChange={(e) => setRoleSearchTerm(e.target.value)}
              />
            </div>
            <ul className="space-y-2 mt-2 max-h-32 overflow-y-auto">
              {filteredAvailableRoles.length > 0 ? (
                  filteredAvailableRoles.map(role => (
                      <li key={role.id}
                          onClick={() => handleSelectAvailableRole(role)}
                          className="bg-[#36393F] rounded pl-2 p-1.5 flex items-center hover:bg-[#3e4147] cursor-pointer">
                        {role.name}
                      </li>
                  ))
              ) : (
                  <li className="text-gray-400 p-2">Немає ролей</li>
              )}
            </ul>
          </div>
        </div>
    )}
    {isRoleListOpen && availableRoles.length === 0 && (
        <div ref={dropdownRef} className="w-full pt-5 relative">
          <div className="bg-[#2F3136] rounded p-4 text-gray-400">
            <h3 className="font-semibold mb-2">Доступні ролі</h3>
            <div className="mt-2">Немає ролей для додавання</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActionSidebar;