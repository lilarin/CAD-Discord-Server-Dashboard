import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import ReorderIcon from "@/assets/icons/reorder.svg";
import RenameIcon from "@/assets/icons/rename.svg";
import EditIcon from "@/assets/icons/edit.svg";
import DeleteIcon from "@/assets/icons/delete.svg";
import React from "react";

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
        <button className="relative group" onClick={() => onActionTriggered('rename', 'category', category)}>
        <img
            src={RenameIcon}
            alt="Перейменувати"
            className="w-5 h-5 cursor-pointer filter group-hover:brightness-200 transition-all duration-300"
          />
        </button>
        <button className="relative group" onClick={() => onActionTriggered('edit', 'category', category)}>
          <img
            src={EditIcon}
            alt="Змінити"
            className="w-5 h-5 cursor-pointer filter group-hover:brightness-200 transition-all duration-300"
          />
        </button>
        <button className="relative group" onClick={() => onActionTriggered('delete', 'category', category)}>
          <img
            src={DeleteIcon}
            alt="Видалити"
            className="w-5 h-5 cursor-pointer filter group-hover:brightness-200 transition-all duration-300"
          />
        </button>
      </div>
    </div>
  );
}

export default DraggableCategory;