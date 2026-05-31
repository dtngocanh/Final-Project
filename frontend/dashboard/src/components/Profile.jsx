import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import defaultAvatar from "../assets/avatar.jpg";
import { toast } from "react-toastify";
import { ArrowLeft, User, Mail, Lock, Camera, CheckCircle, Loader2 } from "lucide-react";
import { toggleComponent } from "../store/slices/extraSlice";
import FloatingVegetables from "./Fruit/FloatingVegetables";
import { updatePassword } from "../store/slices/authSlice";

const Profile = () => {
  const { user, isUpdatingPassword } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editData, setEditData] = useState({ name: "", email: "", avatar: null });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    setEditData({
      name: user?.name || "Admin Seller",
      email: user?.email || "admin@example.com",
      avatar: null,
    });
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar" && files && files[0]) {
      const file = files[0];
      setEditData((prev) => ({ ...prev, avatar: file }));
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setEditData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const updateProfile = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("Hệ thống Veganic đã lưu rồi nhé ní! 🌿");
      setLoading(false);
    }, 800);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match!");
    }
    try {
      await dispatch(updatePassword(passwordData)).unwrap();
      setView("overview");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error || "Failed to update password");
    }
  };

  return (
    <div className="relative min-h-screen w-full py-6 md:py-10 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-700 font-['Fredoka']">

      {/* NỀN RAU CỦ DẬP DÌU */}
      <FloatingVegetables />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-6 mb-8 md:mb-12">
          <button
            onClick={() => dispatch(toggleComponent("Dashboard"))}
            className="flex items-center gap-2 text-gray-400 hover:text-[#77cd3af2] transition-all group self-start sm:self-auto"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Dashboard</span>
          </button>

          <div className="text-center sm:text-right">
            <h1 className="text-2xl md:text-3xl font-light text-gray-900 dark:text-white leading-tight">
              Account <span className="font-serif italic text-[#77cd3af2]">Settings</span>
            </h1>
            <p className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-[0.3em] mt-1 font-bold">Veganic Admin Portal</p>
          </div>
        </div>

        <div className="space-y-8">

          {/* CỤM BASIC INFO: GỒM CẢ ẢNH VÀ INPUT */}
          <div className="bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-10 border border-white/20 dark:border-white/5 shadow-2xl shadow-black/5">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2 rounded-lg bg-[#77cd3af2]/10 text-[#77cd3af2]">
                <User size={18} />
              </div>
              <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-400">Basic Information</h3>
            </div>

            {/* BỐ CỤC FLEX CHO ẢNH VÀ INPUT */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 md:gap-16">

              {/* PHẦN ẢNH ĐẠI DIỆN */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group size-32 md:size-40">
                  <div className="w-full h-full rounded-full p-1.5 border-2 border-dashed border-[#77cd3af2]/30 group-hover:border-[#77cd3af2] transition-all duration-500">
                    <img
                      src={previewUrl || user?.avatar?.url || "/tmt.jpg"}
                      alt="profile"
                      className="w-full h-full rounded-full object-cover bg-gray-50 dark:bg-gray-800 transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                  <label className="absolute bottom-2 right-2 p-3 bg-[#77cd3af2] text-white rounded-full cursor-pointer hover:scale-110 transition-all shadow-lg border-4 border-white dark:border-[#0a0a0a]">
                    <Camera size={18} />
                    <input type="file" name="avatar" hidden accept="image/*" onChange={handleProfileChange} />
                  </label>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-[#77cd3af2] font-black uppercase tracking-widest">Verified Seller</p>
                </div>
              </div>

              {/* PHẦN CÁC Ô NHẬP LIỆU */}
              <div className="flex-1 w-full space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest font-black text-gray-400 ml-1">Full Name</label>
                    <div className="relative group">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#77cd3af2] transition-colors" />
                      <input
                        name="name"
                        value={editData.name}
                        onChange={handleProfileChange}
                        className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-[#77cd3af2]/50 transition-all dark:text-white"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest font-black text-gray-400 ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#77cd3af2] transition-colors" />
                      <input
                        name="email"
                        value={editData.email}
                        onChange={handleProfileChange}
                        className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-[#77cd3af2]/50 transition-all dark:text-white"
                        placeholder="Email"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center lg:justify-start">
                  <button
                    onClick={updateProfile}
                    disabled={loading}
                    className="group flex items-center justify-center gap-3 px-12 py-4 bg-[#77cd3af2] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#68b432] active:scale-95 transition-all shadow-lg shadow-[#77cd3af2]/20"
                  >
                    {loading ? "Saving..." : "Save Profile Details"}
                    <CheckCircle size={14} className="group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CỤM SECURITY - GIỮ RIÊNG 1 CARD PHÍA DƯỚI CHO RÕ RÀNG */}
          <div className="bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-10 border border-white/20 dark:border-white/5 shadow-2xl shadow-black/5">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                <Lock size={18} />
              </div>
              <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-400">Security & Password</h3>
            </div>

            {/* <div className="space-y-6">
              <div className="max-w-md space-y-6">
                <input
                  type="password"
                  placeholder="Current Password"
                  className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-4 text-sm outline-none focus:border-red-400/30 transition-all dark:text-white"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="password"
                    placeholder="New Password"
                    className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-4 text-sm outline-none focus:border-red-400/30 transition-all dark:text-white"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New"
                    className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-4 text-sm outline-none focus:border-red-400/30 transition-all dark:text-white"
                  />
                </div>
              </div>
            </div>

            <button className="mt-8 px-10 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all">
              Update Password
            </button> */}
            <form onSubmit={handleUpdatePassword} className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-8">
                <div className="group relative border-b border-gray-100 dark:border-white/5 pb-2">
                  <label className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">Current Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter your current password"
                    className="w-full bg-transparent outline-none py-2 dark:text-white font-light placeholder:opacity-20"
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  />
                </div>

                <div className="group relative border-b border-gray-100 dark:border-white/5 pb-2">
                  <label className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter your new password"
                    className="w-full bg-transparent outline-none py-2 dark:text-white font-light placeholder:opacity-20"
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>

                <div className="group relative border-b border-gray-100 dark:border-white/5 pb-2">
                  <label className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter your new password"
                    className="w-full bg-transparent outline-none py-2 dark:text-white font-light placeholder:opacity-20"
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full py-4 rounded-xl bg-[#77cd3af2] text-gray-950 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2"
              >
                {isUpdatingPassword ? <Loader2 className="animate-spin" size={16} /> : "Update Password"}
              </button>
            </form>
          </div>



        </div>
      </div>
    </div>
  );
};

export default Profile;