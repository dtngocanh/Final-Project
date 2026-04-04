import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "../store/slices/adminSlice"; 
import { 
  Trash2, UserPlus, Eye, Search, Filter 
} from "lucide-react";
import FloatingVegetables from "./Fruit/FloatingVegetables"; 
import UserDetailsModal from "./UserDetailsModal"; 

const MOCK_USERS = [
  {
    _id: "7e69e797a45149c687cee079",
    name: "Muhammad Zeeshan Khan",
    email: "zeeshan.khan@veganic.com",
    phone: "98777989123",
    role: "User",
    address: "123 Green Street, Peshawar, KPK",
    totalSpent: 113.0,
    createdAt: "2025-08-24"
  },
  {
    _id: "661234567890abcdef123456",
    name: "Le Thanh",
    email: "lethanh.dev@university.edu.vn",
    phone: "0905123456",
    role: "Admin",
    address: "71 Ngu Hanh Son, Da Nang, VN",
    totalSpent: 0.0,
    createdAt: "2026-01-15"
  }
];

const Users = () => {
  const dispatch = useDispatch();
  const { loading, users = [], totalUsers } = useSelector((state) => state.admin || {});
  
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);

  // Gọi API khi component mount
  useEffect(() => {
    if (typeof fetchAllUsers === 'function') {
      dispatch(fetchAllUsers());
    }
  }, [dispatch]);

  const displayUsers = (users && users.length > 0) ? users : MOCK_USERS;

  const filteredUsers = displayUsers.filter(u => {
    const matchesRole = filterRole === "All" || u.role === filterRole;
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const maxPage = Math.ceil(filteredUsers.length / 10) || 1;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fcfdfd] font-['Fredoka']">
      <FloatingVegetables activeColor="#77cd3af2" />

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-light text-gray-800 leading-tight">
              Community <span className="text-[#77cd3af2] font-serif italic font-normal">Members</span>
            </h1>
            <p className="text-gray-400 text-[10px] font-black mt-1 tracking-[0.3em] uppercase opacity-70">Veganic Mart Admin Portal</p>
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
              type="text" placeholder="Search by name or email..."
              className="w-full pl-12 pr-6 py-4 bg-white/80 backdrop-blur-md border-none rounded-[25px] shadow-sm focus:ring-4 focus:ring-[#77cd3a15] transition-all text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 rounded-[25px] shadow-sm border border-white">
            <Filter size={16} className="text-[#77cd3af2]" />
            <select 
              className="border-none bg-transparent py-4 text-xs font-black text-gray-500 focus:ring-0 cursor-pointer uppercase tracking-widest"
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Admin">Sellers</option>
              <option value="User">Users</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-[40px] shadow-2xl shadow-gray-200/50 border border-white overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#f8faf9]/80 text-[10px] uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50">
              <tr>
                <th className="px-10 py-7 font-black">Member Profile</th>
                <th className="px-6 py-7 font-black">Role</th>
                <th className="px-6 py-7 text-center font-black">Contribution</th>
                <th className="px-6 py-7 text-center font-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm italic font-medium">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-white/80 group transition-all duration-300">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-[20px] bg-[#77cd3a1a] flex items-center justify-center text-[#77cd3af2] font-black text-xl border border-[#77cd3a15]">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-base not-italic">{user.name}</p>
                        <p className="text-gray-400 text-[10px] tracking-tight">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-widest ${
                      user.role === 'Admin' ? 'bg-purple-50 text-purple-500 border-purple-100' : 'bg-blue-50 text-blue-500 border-blue-100'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-8 text-center font-black text-[#77cd3af2] not-italic text-base">
                    ${user.totalSpent?.toFixed(2)}
                  </td>
                  <td className="px-6 py-8">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => setSelectedUser(user)} className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-800 hover:text-white transition-all shadow-sm">
                        <Eye size={18}/>
                      </button>
                      <button className="p-3.5 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {maxPage > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            {[...Array(maxPage)].map((_, i) => (
              <button 
                key={i} onClick={() => setPage(i + 1)}
                className={`h-2 rounded-full transition-all duration-300 ${page === i + 1 ? 'w-10 bg-[#77cd3af2]' : 'w-2 bg-gray-200'}`} 
              />
            ))}
          </div>
        )}
      </div>

      <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
};

export default Users;