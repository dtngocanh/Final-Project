import { useEffect, useState } from "react";
import { X, LogOut, User, Mail, Lock, Camera, ShieldCheck, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleAuthPopup } from "../../store/slices/popupSlice";
import { logout, updatePassword, updateProfile } from "../../store/slices/authSlice";
import toast from "react-hot-toast";

const ProfilePanel = () => {
  const dispatch = useDispatch();
  const activeColor = "#77cd3af2";

  const [view, setView] = useState("overview");

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const { isAuthPopupOpen } = useSelector((state) => state.popup);
  const { authUser, isUpdatingProfile, isUpdatingPassword } = useSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [preview, setPreview] = useState(""); // State để hiển thị ảnh tạm thời
  const [avatar, setAvatar] = useState("");  // State để lưu data ảnh gửi lên server

  useEffect(() => {
    if (authUser) {
      setName(authUser.name || "");
      setEmail(authUser.email || "");
      setPreview(authUser.avatar || "/avatar.png"); 
    }
  }, [authUser]);

  // --- LOGIC CHỌN ẢNH ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result); // Hiển thị ảnh vừa chọn ngay lập tức
        setAvatar(reader.result);  // Lưu vào state để chuẩn bị dispatch
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => dispatch(toggleAuthPopup());

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const updateData = {
      name: name,
      email: email,
      avatar: avatar // Thêm avatar vào đây (Nếu không chọn ảnh mới, avatar sẽ rỗng và backend sẽ giữ ảnh cũ)
    };
    dispatch(updateProfile(updateData));
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

  if (!isAuthPopupOpen || !authUser) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-white/40 dark:bg-gray-950/60 z-[120] backdrop-blur-[4px] cursor-pointer animate-in fade-in duration-500"
        onClick={handleClose}
      />

      <aside className="fixed right-0 top-0 h-full w-full max-w-[400px] md:max-w-[450px] z-[130] bg-white/95 dark:bg-[#050505]/95 backdrop-blur-3xl shadow-[-50px_0_100px_-20px_rgba(0,0,0,0.2)] flex flex-col animate-in slide-in-from-right duration-500 ease-in-out">

        <button
          onClick={handleClose}
          className="absolute top-8 right-8 p-2 text-gray-400 hover:text-red-500 transition-all duration-300 hover:rotate-90 z-[140]"
        >
          <X size={28} strokeWidth={1} />
        </button>

        <div className="p-12 pb-6 flex flex-col items-start gap-4">
          {view === "security" && (
            <button
              onClick={() => setView("overview")}
              className="flex items-center gap-2 text-gray-400 hover:text-[#77cd3af2] transition-colors mb-4 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Back to Overview</span>
            </button>
          )}

          <h2 className="text-3xl font-light text-gray-900 dark:text-white leading-tight">
            {view === "overview" ? (
              <>Account <br /><span className="font-serif italic border-b border-[#77cd3af2]/30 text-[#77cd3af2]">Overview</span></>
            ) : (
              <>Update <br /><span className="font-serif italic border-b border-[#77cd3af2]/30 text-[#77cd3af2]">Password</span></>
            )}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-12 py-6 space-y-12 scrollbar-hide">
          {view === "overview" ? (
            <>
              {/* AVATAR SECTION - ĐÃ UPDATE INPUT CHỌN ẢNH */}
              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-full overflow-hidden border border-gray-100 dark:border-white/10 p-1 group-hover:border-[#77cd3af2]/50 transition-all duration-700">
                    <img
                      src={preview} 
                      alt="avatar"
                      className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-all duration-500 bg-gray-100 dark:bg-gray-800"
                    />
                  </div>
                  <label className="absolute bottom-1 right-1 p-2 bg-white dark:bg-gray-900 shadow-xl rounded-full cursor-pointer hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 duration-300 border border-gray-100 dark:border-white/10">
                    <Camera size={14} className="text-[#77cd3af2]" />
                    <input 
                      type="file" 
                      hidden 
                      accept="image/*" 
                      onChange={handleImageChange} // Gọi hàm khi chọn ảnh
                    />
                  </label>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium dark:text-white tracking-tight">{authUser.name}</h3>
                  <p className="text-[9px] text-gray-400 uppercase tracking-[0.3em] mt-1 font-black">Veganic Member</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-10">
                <div className="group relative">
                  <label className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">Full Name</label>
                  <div className="flex items-center gap-4 mt-2 border-b border-gray-100 dark:border-white/5 pb-2 group-focus-within:border-[#77cd3af2]/50 transition-all duration-300">
                    <User size={18} className="text-gray-300 group-focus-within:text-[#77cd3af2] transition-colors" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-transparent w-full outline-none text-base font-light dark:text-white placeholder:opacity-20"
                    />
                  </div>
                </div>

                <div className="group relative">
                  <label className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">Email Address</label>
                  <div className="flex items-center gap-4 mt-2 border-b border-gray-100 dark:border-white/5 pb-2 group-focus-within:border-[#77cd3af2]/50 transition-all duration-300">
                    <Mail size={18} className="text-gray-300 group-focus-within:text-[#77cd3af2] transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-transparent w-full outline-none text-base font-light dark:text-white placeholder:opacity-20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full py-4 rounded-xl bg-[#77cd3af2] text-white dark:text-gray-950 font-bold text-[10px] uppercase tracking-[0.3em] hover:opacity-90 active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
                >
                  {isUpdatingProfile ? "Processing..." : "Save Changes"}
                </button>
              </form>

              <div className="space-y-4">
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">Security</p>
                <button onClick={() => setView("security")} className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50/50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 hover:border-[#77cd3af2]/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <Lock size={16} className="text-gray-400 group-hover:text-[#77cd3af2]" />
                    <span className="text-sm font-light dark:text-gray-200">Manage Password</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </>
          ) : (
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
          )}
        </div>

        <div className="p-12 pt-8 border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.01]">
          <button
            onClick={() => {
              dispatch(logout());
              dispatch({ type: "RESET_APP" });
              localStorage.removeItem("token");
              handleClose();
            }}
            className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-black text-red-500 hover:text-red-600 transition-all"
          >
            <LogOut size={16} />
            <span className="border-b border-transparent group-hover:border-red-500">Sign Out Account</span>
          </button>
          <div className="mt-4 flex items-center gap-2 opacity-30 italic text-[9px] dark:text-gray-400 tracking-wider">
            <ShieldCheck size={10} />
            <span>Encrypted data protected by Veganic Mart</span>
          </div>
        </div>
      </aside >
    </>
  );
};

export default ProfilePanel;