import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Carrot,
  Salad,
  Citrus,
  Cherry,
  Leaf,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toggleAuthPopup } from "../../store/slices/popupSlice";
import {
  login,
  register,
  forgotPassword,
  resetPassword,
} from "../../store/slices/authSlice";
import toast from "react-hot-toast";

const LoginModal = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { authUser, isSigningUp, isLoggingIn, isRequestingForToken } =
    useSelector((state) => state.auth);
  const { isAuthPopupOpen } = useSelector((state) => state.popup);

  // MẶC ĐỊNH LÀ SIGNIN (LOGIN)
  const [mode, setMode] = useState("signin");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const activeColor = "#77cd3af2";

  const vegies = [
    { Icon: Carrot, size: 90, top: "5%", left: "-5%", delay: 0, rotate: 15 },
    { Icon: Salad, size: 130, top: "65%", left: "-10%", delay: 2, rotate: -20 },
    { Icon: Citrus, size: 80, top: "10%", right: "-5%", delay: 4, rotate: 45 },
    {
      Icon: Cherry,
      size: 70,
      bottom: "10%",
      right: "0%",
      delay: 1,
      rotate: -10,
    },
    { Icon: Leaf, size: 110, top: "40%", right: "-15%", delay: 3, rotate: 10 },
  ];

  // Xử lý logic mode dựa trên URL (Chỉ dành cho Reset Password)
  useEffect(() => {
    if (location.pathname.startsWith("/password/reset/")) {
      setMode("reset");
      if (!isAuthPopupOpen) dispatch(toggleAuthPopup());
    } else {
      // Nếu không phải URL reset, mỗi lần popup mở lại nên là signin
      if (isAuthPopupOpen) setMode("signin");
    }
  }, [location.pathname, isAuthPopupOpen, dispatch]);

  const handleClose = () => dispatch(toggleAuthPopup());
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      email: formData.email,
      password: formData.password,
    };
    if (mode === "signup") {
      payload.name = formData.name;
    }

    if (mode === "forgot") {
      dispatch(forgotPassword({ email: formData.email })).then(() =>
        setMode("signin"),
      );
      return;
    }

    if (mode === "reset") {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Confirm Password does not match! Please check again.", {
          style: { borderRadius: "10px", background: "#333", color: "#fff" },
        });
        return;
      }

      try {
        const token = location.pathname.split("/").pop();
        dispatch(
          resetPassword({
            token,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
          }),
        ).unwrap();
        dispatch(toggleAuthPopup());
        navigate("/");
      } catch (error) {
        console.error("Reset Failed:", error);
      }
      return;
    }
    mode === "signup" ? dispatch(register(payload)) : dispatch(login(payload));
  };

  if (!isAuthPopupOpen || authUser) return null;
  const isLoading = isSigningUp || isLoggingIn || isRequestingForToken;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        {/* OVERLAY */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/20 dark:bg-black/60 backdrop-blur-md cursor-pointer"
          onClick={handleClose}
        />

        {/* MODAL */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative w-full max-w-[480px] bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/5 overflow-hidden pointer-events-auto"
        >
          {/* DECOR VEGIES */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {vegies.map((item, index) => (
              <motion.div
                key={index}
                style={{
                  position: "absolute",
                  top: item.top,
                  left: item.left,
                  right: item.right,
                  bottom: item.bottom,
                }}
                animate={{
                  y: [0, 15, 0],
                  rotate: [item.rotate, item.rotate + 10, item.rotate],
                  opacity: [0.15, 0.25, 0.15],
                }}
                transition={{
                  duration: 6 + index,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <item.Icon
                  size={item.size}
                  strokeWidth={0.6}
                  style={{ color: activeColor }}
                />
              </motion.div>
            ))}
          </div>

          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-[#77cd3af2] transition-transform hover:scale-110 z-20"
          >
            <X size={22} />
          </button>

          <div className="relative z-10 p-10 md:p-14">
            {/* HEADER */}
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <img
                  src="/hahahaha.png"
                  alt="logo"
                  className="w-5 h-5 object-contain"
                />
                <span className="uppercase tracking-[0.3em] text-[10px] font-black text-[#025c37] dark:text-[#77cd3af2]">
                  Veggies Mart
                </span>
              </div>

              <h2 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight">
                {mode === "signin" ? (
                  <>
                    Welcome{" "}
                    <span className="font-serif italic text-[#77cd3af2]">
                      Back
                    </span>
                  </>
                ) : mode === "signup" ? (
                  <>
                    Join the{" "}
                    <span className="font-serif italic text-[#77cd3af2]">
                      Green
                    </span>
                  </>
                ) : mode === "forgot" ? (
                  <>
                    Recover{" "}
                    <span className="font-serif italic text-[#77cd3af2]">
                      Path
                    </span>
                  </>
                ) : (
                  "Reset Password"
                )}
              </h2>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <div className="relative group border-b border-gray-200 dark:border-white/10 focus-within:border-[#77cd3af2] transition-colors">
                  <User
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#77cd3af2] transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    className="w-full bg-transparent py-4 pl-8 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 font-light"
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
              {/* 2. TRƯỜNG EMAIL: Hiện khi Đăng nhập, Đăng ký, Quên mật khẩu. ẨN khi Reset */}
              {mode !== "reset" && (
                <div className="relative group border-b border-gray-200 dark:border-white/10 focus-within:border-[#77cd3af2] transition-colors">
                  <Mail
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#77cd3af2] transition-colors"
                    size={18}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    className="w-full bg-transparent py-4 pl-8 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 font-light"
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              {/* 3. CÁC TRƯỜNG PASSWORD: Hiện khi KHÔNG PHẢI mode forgot */}
              {mode !== "forgot" && (
                <>
                  {/* Ô Mật khẩu mới/chính */}
                  <div className="relative group border-b border-gray-200 dark:border-white/10 focus-within:border-[#77cd3af2] transition-colors">
                    <Lock
                      className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#77cd3af2] transition-colors"
                      size={18}
                    />
                    <input
                      type="password"
                      name="password"
                      placeholder={
                        mode === "reset" ? "New Password" : "Password"
                      }
                      className="w-full bg-transparent py-4 pl-8 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 font-light"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Ô Xác nhận mật khẩu: Chỉ hiện khi Signup hoặc Reset */}
                  {mode === "reset" && (
                    <div className="relative group border-b border-gray-200 dark:border-white/10 focus-within:border-[#77cd3af2] transition-colors">
                      <Lock
                        className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#77cd3af2] transition-colors"
                        size={18}
                      />
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        className="w-full bg-transparent py-4 pl-8 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 font-light"
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}
                </>
              )}

              {/* Quên mật khẩu: Chỉ hiện khi Signin */}
              {mode === "signin" && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#77cd3af2] transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-4 bg-gray-900 dark:bg-[#77cd3af2] text-white dark:text-gray-950 rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 group hover:shadow-xl hover:shadow-[#77cd3af2]/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <span>
                      {mode === "signin"
                        ? "Sign In"
                        : mode === "signup"
                          ? "Get Started"
                          : mode === "forgot"
                            ? "Send Email"
                            : "Confirm"}
                    </span>
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>

            {/* FOOTER */}
            <div className="mt-10 text-center">
              <p className="text-sm text-gray-400 font-light italic font-serif">
                {mode === "signin" ? "New to the garden?" : "Already a member?"}
                <button
                  onClick={() =>
                    setMode(mode === "signin" ? "signup" : "signin")
                  }
                  className="ml-2 not-italic font-sans font-bold text-gray-900 dark:text-white hover:text-[#77cd3af2] transition-colors uppercase text-[10px] tracking-widest"
                >
                  {mode === "signin" ? "Join Now" : "Login"}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoginModal;
