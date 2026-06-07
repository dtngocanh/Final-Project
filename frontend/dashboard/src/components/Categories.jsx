import React, { useEffect, useState } from "react";
import { Plus, Shapes, Pencil, FolderPlus, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  createCategory,
  fetchCategories,
  updateCategory,
} from "../store/slices/categorySlice";
import {
  setSelectedCategory,
  toggleCreateCategoryModal,
  toggleUpdateCategoryModal,
} from "../store/slices/extraSlice";

const Categories = () => {
  const dispatch = useDispatch();
  const { categories, isLoading } = useSelector((state) => state.category);

  const {
    isCreateCategoryModalOpened,
    isUpdateCategoryModalOpened,
    selectedCategory,
  } = useSelector((state) => state.extra);

  // Tách biệt state cho 2 form riêng để tránh xung đột dữ liệu
  const [createName, setCreateName] = useState("");
  const [parentId, setParentId] = useState("");
  const [updateName, setUpdateName] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // HANDLE MODALS
  const openCreateModal = () => {
    setCreateName("");
    setParentId("");
    dispatch(toggleCreateCategoryModal());
  };

  const closeCreateModal = () => {
    dispatch(toggleCreateCategoryModal());
  };

  const openUpdateModal = (category) => {
    dispatch(setSelectedCategory(category));
    setUpdateName(category.name);
    dispatch(toggleUpdateCategoryModal());
  };

  const closeUpdateModal = () => {
    dispatch(toggleUpdateCategoryModal());
    dispatch(setSelectedCategory(null));
  };

  const handleCreateSubmit = () => {
    if (!createName.trim()) return;
    dispatch(
      createCategory({
        name: createName,
        parent: parentId || null,
      })
    );
    closeCreateModal();
  };

  const handleUpdateSubmit = () => {
    if (!updateName.trim()) return;
    dispatch(
      updateCategory({
        id: selectedCategory._id,
        data: { name: updateName },
      })
    );
    closeUpdateModal();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-100 transition-colors">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 border-b border-gray-100 dark:border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#77cd3af2] mb-1">
            <Shapes size={16} className="animate-pulse" />
            <span className="uppercase tracking-[0.2em] text-[10px] font-bold">
              System Administration
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage product segments and hierarchy tags.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="
            flex items-center justify-center gap-2
            px-5 py-3 rounded-xl font-medium text-sm
            bg-[#025c37] text-white shadow-lg shadow-green-900/10
            hover:bg-[#77cd3af2] hover:text-[#025c37]
            active:scale-98
            transition-all duration-300
          "
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Category List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-gray-400">Loading hierarchy...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <div
              key={category._id}
              className="
                bg-white dark:bg-[#111]
                border border-gray-200/60 dark:border-white/5
                rounded-2xl p-5 shadow-sm
                hover:shadow-md hover:border-gray-300/80 dark:hover:border-white/10
                transition-all duration-200
                flex flex-col justify-between
              "
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-400">
                      <FolderPlus size={18} />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-50">{category.name}</h3>
                  </div>

                  <button
                    onClick={() => openUpdateModal(category)}
                    className="
                      flex items-center gap-1.5
                      px-3 py-1.5 rounded-lg text-xs font-medium
                      bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300
                      hover:bg-[#77cd3af2]/20 hover:text-[#025c37] dark:hover:text-[#77cd3af2]
                      transition-all
                    "
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                </div>

                {/* Subcategories */}
                {category.subcategories?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-gray-100 dark:border-white/5">
                    {category.subcategories.map((sub) => (
                      <span
                        key={sub._id}
                        className="
                          px-2.5 py-1 rounded-md text-xs font-medium
                          bg-green-50/60 dark:bg-green-500/10 
                          text-green-700 dark:text-green-400
                          border border-green-100/50 dark:border-green-500/10
                        "
                      >
                        {sub.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mt-4 italic">No subcategories attached</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateCategoryModalOpened && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121212] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">Create Category</h2>
              <button onClick={closeCreateModal} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Parent Assignment</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#77cd3af2]/50"
                >
                  <option value="" className="dark:bg-[#121212]">-- Top Level (Root Category) --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id} className="dark:bg-[#121212]">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Category Name</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g., Electronics, Fashion..."
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#77cd3af2]/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
              <button
                onClick={closeCreateModal}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubmit}
                disabled={!createName.trim()}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-[#77cd3af2] text-white hover:bg-[#66b330] disabled:opacity-50 disabled:pointer-events-none"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE MODAL */}
      {isUpdateCategoryModalOpened && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121212] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">Update Category</h2>
              <button onClick={closeUpdateModal} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Modify Name</label>
              <input
                type="text"
                value={updateName}
                onChange={(e) => setUpdateName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#77cd3af2]/50"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
              <button
                onClick={closeUpdateModal}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubmit}
                disabled={!updateName.trim()}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-[#77cd3af2] text-white hover:bg-[#66b330] disabled:opacity-50 disabled:pointer-events-none"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;