import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteUser, fetchAllUsers } from "../store/slices/adminSlice";
import { Trash2, UserPlus, Eye, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import FloatingVegetables from "./Fruit/FloatingVegetables";
import UserDetailsModal from "../modals/UserDetailsModal";
import FruitLoader from "./Fruit/FruitLoader";

const Users = () => {
  const dispatch = useDispatch();
  const { loading, users, totalUsers } = useSelector((state) => state.admin);

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);

  // Lắng nghe thay đổi của page, search, filter để gọi API (Đã có debounce 500ms)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      dispatch(
        fetchAllUsers({
          page,
          search: searchTerm,
          role: filterRole === "All" ? "" : filterRole,
        })
      );
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [dispatch, page, searchTerm, filterRole]);

  const maxPage = Math.ceil(totalUsers / 10) || 1;

  // --- LOGIC PHÂN TRANG RÚT GỌN ---
  const renderPageNumbers = () => {
    const pages = [];
    if (maxPage <= 5) {
      for (let i = 1; i <= maxPage; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      let start = Math.max(2, page - 1);
      let end = Math.min(maxPage - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < maxPage - 2) pages.push("...");
      pages.push(maxPage);
    }
    return pages;
  };

  const handleDeleteUser = (id) => {
    if (window.confirm("Ní có chắc muốn tiễn hội viên này khỏi khu vườn không?")) {
      dispatch(deleteUser(id));
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fcfdfd] font-['Fredoka'] pb-20">
      <FloatingVegetables activeColor="#77cd3af2" />

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-light text-gray-800 leading-tight">
              Community <span className="text-[#77cd3af2] font-serif italic font-normal">Members</span>
            </h1>
            <p className="text-gray-400 text-[10px] font-black mt-1 tracking-[0.3em] uppercase opacity-70">
              Veggies Mart Admin Portal
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3.5 bg-[#77cd3af2] text-white rounded-[22px] font-bold shadow-lg shadow-green-100 hover:scale-105 active:scale-95 transition-all">
            <UserPlus size={18} /> <span className="text-sm">Add Member</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="relative flex-1 min-w-[300px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#77cd3af2] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-6 py-4 bg-white/80 backdrop-blur-md border-none rounded-[25px] shadow-sm focus:ring-4 focus:ring-[#77cd3a15] transition-all text-sm"
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 rounded-[25px] shadow-sm border border-white">
            <Filter size={16} className="text-[#77cd3af2]" />
            <select
              className="border-none bg-transparent py-4 text-xs font-black text-gray-500 focus:ring-0 cursor-pointer uppercase tracking-widest"
              onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="User">Users</option>
            </select>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-[40px] shadow-2xl shadow-gray-200/50 border border-white overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8faf9]/80 text-[10px] uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50">
              <tr>
                <th className="px-10 py-7 font-black">Member Profile</th>
                <th className="px-6 py-7 font-black">Role</th>
                <th className="px-6 py-7 text-center font-black">Contribution</th>
                <th className="px-6 py-7 text-center font-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-medium">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20"><FruitLoader /></td>
                </tr>
              ) : users && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-[#fcfdfd] group transition-all duration-300">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-[20px] bg-[#77cd3a1a] flex items-center justify-center text-[#77cd3af2] font-black text-xl border border-[#77cd3a15]">
                          {user.name ? user.name.charAt(0) : "U"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-base">{user.name}</p>
                          <p className="text-gray-400 text-[10px] tracking-tight">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-8">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-widest ${user.role?.toLowerCase() === "admin" ? "bg-purple-50 text-purple-500 border-purple-100" : "bg-blue-50 text-blue-500 border-blue-100"}`}>
                        {user.role}
                      </span>
                    </td>
                    {/* KHÚC NÀY: Bốc thẳng totalSpent từ Backend, không cần tính toán cồng kềnh */}
                    <td className="px-6 py-8 text-center font-black text-[#77cd3af2] text-base">
                      ${(user.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-8">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => setSelectedUser(user)} className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-800 hover:text-white transition-all shadow-sm active:scale-90">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => handleDeleteUser(user._id)} className="p-3.5 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-20 text-gray-400 italic">No members found.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* PAGINATION UI */}
          {maxPage > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-10 py-8 bg-gray-50/50 border-t border-gray-50 gap-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Page <span className="text-gray-800 text-sm">{page}</span> / {maxPage}
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm disabled:opacity-30 border border-gray-100 text-gray-400 hover:text-[#77cd3af2]"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1.5">
                  {renderPageNumbers().map((p, i) => (
                    p === "..." ? (
                      <span key={i} className="text-gray-300 px-1">...</span>
                    ) : (
                      <button
                        key={i}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${page === p ? "bg-[#77cd3af2] text-white shadow-lg" : "bg-white text-gray-400 border border-gray-100"}`}
                      >
                        {p}
                      </button>
                    )
                  ))}
                </div>

                <button
                  disabled={page === maxPage}
                  onClick={() => setPage(p => Math.min(p + 1, maxPage))}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm disabled:opacity-30 border border-gray-100 text-gray-400 hover:text-[#77cd3af2]"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
};

export default Users;