import React, { useEffect, useState } from "react";
import {
  X,
  LogOut,
  User,
  Mail,
  Lock,
  Camera,
  ShieldCheck,
  ChevronRight,
  Loader2,
  ArrowLeft,
  BadgeCheck,
  Award,
} from "lucide-react"; // Thêm icon Award vào đây nè ní
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate để chuyển trang
import { toggleAuthPopup } from "../../store/slices/popupSlice";
import {
  logout,
  updatePassword,
  updateProfile,
} from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import Avatar from "boring-avatars";

const ProfilePanel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Khởi tạo điều hướng

  // Lấy dữ liệu từ Redux
  const { isAuthPopupOpen } = useSelector((state) => state.popup);
  const { authUser, isUpdatingProfile, isUpdatingPassword } = useSelector(
    (state) => state.auth,
  );

  const [view, setView] = useState("overview");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [preview, setPreview] = useState("");
  const [avatar, setAvatar] = useState("");
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Cập nhật dữ liệu vào Form khi authUser thay đổi
  useEffect(() => {
    if (authUser) {
      setName(authUser.name || "");
      setEmail(authUser.email || "");
      setPreview(authUser.avatar || "");
    }
  }, [authUser]);

  const handleClose = () => dispatch(toggleAuthPopup());

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    dispatch(updateProfile({ name, email, avatar }));
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match!");
    }
    try {
      await dispatch(updatePassword(passwordData)).unwrap();
      setView("overview");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error || "Failed to update password");
    }
  };

  if (!isAuthPopupOpen || !authUser) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/70 z-[120] backdrop-blur-sm transition-all"
        onClick={handleClose}
      />

      {/* Side Panel */}
      <aside className="fixed right-0 top-0 h-full w-full sm:w-[440px] z-[130] bg-white dark:bg-[#080808] shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        {/* Top Header */}
        <div className="relative p-8 pt-12">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 hover:rotate-90 transition-all"
          >
            <X size={24} strokeWidth={1.5} />
          </button>

          <div className="space-y-1">
            <h2 className="text-3xl font-light tracking-tight dark:text-white">
              {view === "overview" ? "My Account" : "Security"}
            </h2>
            <p className="text-sm font-serif italic text-[#77cd3a]">
              {view === "overview"
                ? `Welcome back, ${authUser.name?.split(" ")[0]}`
                : "Protect your digital presence"}
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-4 scrollbar-hide">
          {view === "overview" ? (
            <div className="space-y-10">
              {/* Avatar Section */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-50 dark:border-white/5 shadow-inner p-1 bg-white dark:bg-gray-900 transition-all group-hover:border-[#77cd3a]/30">
                    {preview ? (
                      <img
                        src={preview}
                        className="w-full h-full object-cover rounded-full"
                        alt="avatar"
                      />
                    ) : (
                      <Avatar
                        size={110}
                        name={authUser.name}
                        variant="beam"
                        colors={[
                          "#77cd3a",
                          "#264653",
                          "#2a9d8f",
                          "#e9c46a",
                          "#f4a261",
                        ]}
                      />
                    )}
                  </div>
                  <label className="absolute bottom-1 right-1 p-2.5 bg-[#77cd3a] text-white rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg border-2 border-white dark:border-black">
                    <Camera size={14} />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-900 dark:text-white font-medium">
                    {authUser.name}{" "}
                    <BadgeCheck
                      size={16}
                      className="text-[#77cd3a]"
                      fill="currentColor"
                      fillOpacity={0.2}
                    />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-1">
                    Verified Member
                  </p>
                </div>
              </div>

              {/* Information Form */}
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">
                      Full Identity
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent focus-within:border-[#77cd3a]/50 transition-all">
                      <User size={18} className="text-gray-400" />
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-transparent w-full outline-none text-sm dark:text-white"
                        placeholder="Full Name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent focus-within:border-[#77cd3a]/50 transition-all">
                      <Mail size={18} className="text-gray-400" />
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-transparent w-full outline-none text-sm dark:text-white"
                        placeholder="Email"
                      />
                    </div>
                  </div>
                </div>

                <button
                  disabled={isUpdatingProfile}
                  className="w-full py-4 bg-[#77cd3a] text-white rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] hover:shadow-[0_10px_20px_rgba(119,205,58,0.3)] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdatingProfile ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Save Settings"
                  )}
                </button>
              </form>

              {/* CỤM MENU SHORTCUT (ĐÃ THÊM NÚT BẢNG VÀNG) */}
              <div className="space-y-3 pt-4">
                {/* Nút Security ban đầu của ní */}
                <button
                  onClick={() => setView("security")}
                  className="w-full flex items-center justify-between p-5 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:text-[#77cd3a]">
                      <Lock size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium dark:text-white">
                        Security & Password
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Change your secret key
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-gray-300 group-hover:translate-x-1 transition-transform"
                  />
                </button>

                {/* NÚT "BẢNG VÀNG CHI TIÊU" MỚI TINH */}
                <button
                  onClick={() => {
                    handleClose(); // Tắt popup/sidebar đi cho đỡ vướng
                    navigate("/my-analytics"); // Chuyển hướng thẳng sang route analytics
                  }}
                  className="w-full flex items-center justify-between p-5 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:text-[#77cd3a]">
                      <Award size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium dark:text-white">
                        Customer Spending Leaderboard
                      </p>
                      <p className="text-[11px] text-gray-400">
                        View personal shopping achievements
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-gray-300 group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-10 duration-500">
              <button
                onClick={() => setView("overview")}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#77cd3a] mb-8 transition-colors"
              >
                <ArrowLeft size={16} /> Back to Overview
              </button>

              <form onSubmit={handleUpdatePassword} className="space-y-6">
                {/* Password Fields */}
                {["oldPassword", "newPassword", "confirmPassword"].map(
                  (field, idx) => (
                    <div key={field} className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">
                        {idx === 0
                          ? "Current Password"
                          : idx === 1
                            ? "New Secret Key"
                            : "Confirm New Key"}
                      </label>
                      <input
                        type="password"
                        required
                        className="w-full px-4 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl outline-none dark:text-white border border-transparent focus:border-[#77cd3a]/50"
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            [field]: e.target.value,
                          })
                        }
                      />
                    </div>
                  ),
                )}

                <button
                  disabled={isUpdatingPassword}
                  className="w-full py-4 bg-[#77cd3a] text-white rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                >
                  {isUpdatingPassword ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Update Secret Key"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
          <button
            onClick={() => {
              dispatch(logout());
              handleClose();
            }}
            className="w-full flex items-center gap-3 text-red-500 text-[11px] uppercase font-bold tracking-[0.2em] hover:text-red-600 transition-colors"
          >
            <LogOut size={18} /> Sign Out Account
          </button>

          <div className="mt-6 flex items-center gap-2 opacity-30 text-[9px] dark:text-gray-400 tracking-wider">
            <ShieldCheck size={12} />
            <span>Data protected by Veggies Security Protocol</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ProfilePanel;
