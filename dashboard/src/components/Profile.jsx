import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import defaultAvatar from "../assets/avatar.jpg";

const Profile = () => {
  const { user } = useSelector((state) => state.auth); 
  const dispatch = useDispatch();

  const HARDCODED_SELLER = {
    name: "Admin Seller",
    email: "admin@example.com",
  };

  // States
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    avatar: null,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // ĐỒNG BỘ DỮ LIỆU: Cập nhật form khi thông tin user từ Redux thay đổi
  useEffect(() => {
    setEditData({
      name: user?.name || HARDCODED_SELLER.name,
      email: user?.email || HARDCODED_SELLER.email,
      avatar: null,
    });
  }, [user]);

  // Xử lý thay đổi thông tin & Preview ảnh
  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "avatar" && files && files[0]) {
      const file = files[0];
      setEditData((prev) => ({ ...prev, avatar: file }));
      
      // Cleanup URL cũ trước khi tạo URL mới để tránh tốn RAM
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setEditData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const updateProfile = () => {
    setLoading(true);
    // Sau này thay đoạn này bằng dispatch(updateAdminProfile(formData))
    setTimeout(() => {
      console.log("Dữ liệu cập nhật:", editData);
      alert("Cập nhật thông tin thành công!");
      setLoading(false);
    }, 800);
  };

  const updatePassword = () => {
    if (!passwordData.newPassword) return alert("Vui lòng nhập mật khẩu mới");
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      return alert("Mật khẩu xác nhận không khớp!");
    }
    
    setLoading(true);
    setTimeout(() => {
      alert("Đổi mật khẩu thành công!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 animate-in fade-in duration-700">
      {/* Identity Section */}
      <section className="flex items-center gap-8 mb-16">
        <div className="relative group size-24 rounded-full overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
          <img
            src={previewUrl || user?.avatar?.url || defaultAvatar}
            alt="profile"
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
             <span className="text-[10px] text-white font-bold uppercase">Change</span>
          </div>
          <input 
            type="file" 
            name="avatar"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer" 
            onChange={handleProfileChange}
          />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-light tracking-tight text-black">
            {editData.name || "User"}
          </h2>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            {loading ? "Processing..." : "Profile Management"}
          </p>
        </div>
      </section>

      <div className="space-y-16">
        <section className="space-y-6">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-300">Basic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input
              name="name"
              placeholder="Full Name"
              value={editData.name}
              onChange={handleProfileChange}
              className="w-full bg-gray-50/50 border-none rounded-none px-4 py-3 text-sm focus:ring-1 focus:ring-gray-200 outline-none transition-all"
            />
            <input
              name="email"
              placeholder="Email Address"
              value={editData.email}
              onChange={handleProfileChange}
              className="w-full bg-gray-50/50 border-none rounded-none px-4 py-3 text-sm focus:ring-1 focus:ring-gray-200 outline-none transition-all"
            />
          </div>
          <button 
            onClick={updateProfile}
            disabled={loading}
            className="px-8 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            Update Profile
          </button>
        </section>

        <section className="space-y-6">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-300">Security</h3>
          <div className="space-y-5">
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              placeholder="Current Password"
              onChange={handlePasswordChange}
              className="w-full bg-gray-50/50 border-none rounded-none px-4 py-3 text-sm focus:ring-1 focus:ring-gray-200 outline-none transition-all"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                placeholder="New Password"
                onChange={handlePasswordChange}
                className="w-full bg-gray-50/50 border-none rounded-none px-4 py-3 text-sm focus:ring-1 focus:ring-gray-200 outline-none transition-all"
              />
              <input
                type="password"
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                placeholder="Confirm New Password"
                onChange={handlePasswordChange}
                className="w-full bg-gray-50/50 border-none rounded-none px-4 py-3 text-sm focus:ring-1 focus:ring-gray-200 outline-none transition-all"
              />
            </div>
          </div>
          <button 
            onClick={updatePassword}
            disabled={loading}
            className="px-8 py-2.5 bg-gray-200 text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gray-300 transition-all disabled:opacity-50"
          >
            Change Password
          </button>
        </section>
      </div>
    </div>
  );
};

export default Profile;