import React, { useState, useEffect } from "react";
import { X, Check, Mail, Lock, User as UserIcon, Sparkles, Phone, Key } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "../utils/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserAuthModal({ isOpen, onClose }: UserAuthModalProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup" | "phone">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  // Phone Auth State variables
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize reCAPTCHA verifier on component mount for phone auth
    if (!(window as any).recaptchaVerifier && typeof document !== 'undefined') {
      const container = document.getElementById("recaptcha-container");
      if (container) {
        try {
          const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible",
            callback: () => {
              // reCAPTCHA solved silently
            },
            "expired-callback": () => {
              setErrorMsg("reCAPTCHA expired. Please request the code again.");
            }
          });
          (window as any).recaptchaVerifier = verifier;
        } catch (e) {
          console.warn("Could not initialize reCAPTCHA verifier:", e);
        }
      }
    }

    // Cleanup any lingering recaptchaVerifier on unmount
    return () => {
      if ((window as any).recaptchaVerifier) {
        try {
          ((window as any).recaptchaVerifier).clear();
        } catch (e) {
          console.warn("Error cleaning recaptchaVerifier on unmount:", e);
        }
        (window as any).recaptchaVerifier = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setPhoneNumber("");
    setVerificationCode("");
    setConfirmationResult(null);
    setOtpSent(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all credentials.");
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccessMsg("Welcome back to Aura!");
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/operation-not-allowed") {
        setErrorMsg("Email/Password Sign-In is not enabled in your Firebase Console. Please go to your Firebase Console under 'Authentication' -> 'Sign-in method' and enable 'Email/Password' to authorize profiles.");
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setErrorMsg("Invalid email or credentials. Try registering a new profile.");
      } else {
        setErrorMsg(err.message || "Failed to sign in.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setErrorMsg("Please populate all profile details.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, {
        displayName: fullName
      });
      setSuccessMsg("Your Aura Profile has been secured!");
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/operation-not-allowed") {
        setErrorMsg("Email/Password Sign-In is not enabled in your Firebase Console. Please go to your Firebase Console under 'Authentication' -> 'Sign-in method' and enable 'Email/Password' to register new profiles.");
      } else if (err.code === "auth/email-already-in-use") {
        setErrorMsg("This email is already linked to an Aura profile.");
      } else {
        setErrorMsg(err.message || "Failed to register profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setErrorMsg(null);
    setLoading(true);
    const demoEmail = "patron@aura.com";
    const demoPass = "auraboutique";
    try {
      // Attempt sign in
      try {
        await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      } catch (signInErr) {
        // If not found, quickly create it
        const userCred = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
        await updateProfile(userCred.user, {
          displayName: "Aura Patron"
        });
      }
      setSuccessMsg("Access granted as Aura Patron!");
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/operation-not-allowed") {
        setErrorMsg("Email/Password Sign-In is not enabled in your Firebase Console. Please enable 'Email/Password' under the 'Sign-in method' tab to try out the demo account.");
      } else {
        setErrorMsg("Could not start demo profile. Try manual Sign Up.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setSuccessMsg("Logged in with Google successfully!");
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/operation-not-allowed") {
        setErrorMsg("Google Sign-In is not enabled in your Firebase Console. Please go to your Firebase Console under 'Authentication' -> 'Sign-in method' and enable 'Google' provider.");
      } else {
        setErrorMsg(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setErrorMsg("Please enter a valid phone number.");
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    // Format phone number to clean E.164 standard (strip spaces, hyphens, parentheses, etc.)
    const cleanedPhone = phoneNumber.trim().replace(/[\s\(\)\-\.]/g, "");
    if (!cleanedPhone.startsWith("+")) {
      setErrorMsg("Phone number must start with '+' and include the country code (e.g. +15551234567).");
      setLoading(false);
      return;
    }

    try {
      // Setup Recaptcha Verifier - always clear existing verifier first to avoid "already rendered" issues
      if ((window as any).recaptchaVerifier) {
        try {
          ((window as any).recaptchaVerifier).clear();
        } catch (e) {
          console.warn("Error clearing stale recaptchaVerifier:", e);
        }
        (window as any).recaptchaVerifier = null;
      }

      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved silently
        },
        "expired-callback": () => {
          setErrorMsg("reCAPTCHA expired. Please request the code again.");
        }
      });
      (window as any).recaptchaVerifier = verifier;

      const confirmation = await signInWithPhoneNumber(auth, cleanedPhone, verifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setSuccessMsg(`SMS verification code sent to ${cleanedPhone}! Check your device.`);
    } catch (err: any) {
      console.error("SMS Code Send Failure:", err);
      if (err.code === "auth/operation-not-allowed") {
        setErrorMsg("Phone Sign-In is not enabled in your Firebase Console. Please go to your Firebase Console under 'Authentication' -> 'Sign-in method' and enable 'Phone' to authorize profiles.");
      } else if (err.code === "auth/invalid-phone-number") {
        setErrorMsg("Invalid phone number format. Please use E.164 format (e.g. +15551234567).");
      } else {
        setErrorMsg(err.message || "Failed to send verification SMS.");
      }
      
      // Reset verifier on error
      if ((window as any).recaptchaVerifier) {
        try {
          ((window as any).recaptchaVerifier).clear();
        } catch (e) {
          console.error(e);
        }
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }
    if (!confirmationResult) {
      setErrorMsg("No active verification session. Please request a new code.");
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      await confirmationResult.confirm(verificationCode);
      setSuccessMsg("Welcome back to Aura! Phone authenticated successfully.");
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    } catch (err: any) {
      console.error("SMS Verification Failure:", err);
      if (err.code === "auth/invalid-verification-code") {
        setErrorMsg("Invalid code. Please double check and try again.");
      } else {
        setErrorMsg(err.message || "Failed to verify SMS code.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Main container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[95vh]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-10 p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all border border-gray-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Title & Brand logo */}
          <div className="p-8 pb-5 text-center bg-white">
            <h2 className="font-sans font-medium tracking-tight text-2xl text-gray-900">
              Welcome to Aura
            </h2>
            <p className="text-gray-500 text-xs mt-1.5 leading-relaxed max-w-xs mx-auto">
              Access your personal boutique wardrobe, track orders, and synchronize your curated shopping collections.
            </p>
          </div>

          {/* Custom Tabs Segmented Control */}
          <div className="px-8 pb-3">
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signin");
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  activeTab === "signin"
                    ? "bg-white text-gray-950 shadow-sm border border-gray-100 font-semibold"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signup");
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  activeTab === "signup"
                    ? "bg-white text-gray-950 shadow-sm border border-gray-100 font-semibold"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("phone");
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  activeTab === "phone"
                    ? "bg-white text-gray-950 shadow-sm border border-gray-100 font-semibold"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                SMS Code
              </button>
            </div>
          </div>

          <div className="p-8 pt-2 overflow-y-auto space-y-4">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-xs text-rose-700 leading-relaxed font-medium">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-700 leading-relaxed font-medium flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            {activeTab === "phone" ? (
              <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                {!otpSent ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Phone Number (E.164 format)
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+15551234567"
                        className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-mono"
                        disabled={loading}
                      />
                      <p className="text-[10px] text-gray-400 mt-1.5 leading-normal">
                        Include country code prefix (e.g. +1 for US, +91 for India).
                      </p>
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full py-3 bg-black hover:bg-gray-900 text-white rounded-xl text-xs font-medium tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Verification Code"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        6-Digit Verification Code
                      </label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black text-center tracking-[0.5em] font-mono text-lg font-semibold"
                        disabled={loading}
                      />
                      <p className="text-[10px] text-gray-400 mt-1.5 leading-normal">
                        Enter the verification code sent to {phoneNumber}
                      </p>
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setConfirmationResult(null);
                          setVerificationCode("");
                          setErrorMsg(null);
                        }}
                        className="w-1/3 py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-medium transition-all flex items-center justify-center cursor-pointer"
                        disabled={loading}
                      >
                        Change
                      </button>
                      
                      <button
                        type="submit"
                        className="w-2/3 py-3 bg-black hover:bg-gray-900 text-white rounded-xl text-xs font-medium tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
                        disabled={loading}
                      >
                        {loading ? "Verifying..." : "Confirm Code"}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            ) : (
              <form onSubmit={activeTab === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
                {activeTab === "signup" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                      disabled={loading}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane.doe@example.com"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    disabled={loading}
                  />
                  {activeTab === "signup" && (
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      Must be at least 6 characters long.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-black hover:bg-gray-900 text-white rounded-xl text-xs font-medium tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm mt-2"
                  disabled={loading}
                >
                  {loading ? "Please wait..." : activeTab === "signin" ? "Sign In" : "Register Account"}
                </button>
              </form>
            )}

            <div className="relative flex py-2.5 items-center">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-[10px] font-mono text-gray-300 uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold border border-gray-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm mb-2.5"
              disabled={loading}
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.514 5.514 0 0 1 8.5 13a5.514 5.514 0 0 1 5.491-5.514c1.4 0 2.627.527 3.564 1.386l3.127-3.127C18.82 3.964 16.482 3 14 3a10 10 0 0 0-10 10 10 10 0 0 0 10 10c5.345 0 9.764-3.864 9.764-10a11.134 11.134 0 0 0-.164-1.927l-11.36-.002z"
                />
              </svg>
              <span>Sign in with Google Account</span>
            </button>

            <button
              onClick={handleQuickDemo}
              className="w-full py-2.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 rounded-xl text-xs font-semibold border border-neutral-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              disabled={loading}
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Instant Login with Demo Patron Account</span>
            </button>
          </div>
          
          {/* Invisible container required for Firebase recaptcha verifier */}
          <div id="recaptcha-container"></div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
