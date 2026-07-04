import React, { useState, useEffect } from "react";
import { X, Check, Mail, Lock, User as UserIcon, Sparkles, Phone, Key } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "../utils/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber
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
          className="relative bg-[#faf9f6] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-[#e2e8f0] flex flex-col max-h-[90vh]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white hover:bg-black hover:text-white rounded-full transition-all border border-[#e2e8f0]"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Title & Brand logo */}
          <div className="p-6 pb-4 border-b border-[#e2e8f0] bg-white text-center">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100 mb-2">
              <Sparkles className="h-3 w-3" />
              <span>Durable Cloud Vault • Option B</span>
            </div>
            <h2 className="font-display font-bold text-xl text-gray-900">
              Aura Customer Portal
            </h2>
            <p className="text-gray-400 text-xs mt-1 leading-relaxed">
              Sign in to secure order history and synchronize shopping carts across devices.
            </p>
          </div>

          {/* Custom Tabs Navigation */}
          <div className="grid grid-cols-3 border-b border-[#e2e8f0] bg-white text-center">
            <button
              onClick={() => {
                setActiveTab("signin");
                setErrorMsg(null);
              }}
              className={`py-3.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === "signin"
                  ? "border-black text-black bg-[#faf9f6]"
                  : "border-transparent text-gray-400 hover:text-gray-600 bg-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab("signup");
                setErrorMsg(null);
              }}
              className={`py-3.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === "signup"
                  ? "border-black text-black bg-[#faf9f6]"
                  : "border-transparent text-gray-400 hover:text-gray-600 bg-white"
              }`}
            >
              Register
            </button>
            <button
              onClick={() => {
                setActiveTab("phone");
                setErrorMsg(null);
              }}
              className={`py-3.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === "phone"
                  ? "border-black text-black bg-[#faf9f6]"
                  : "border-transparent text-gray-400 hover:text-gray-600 bg-white"
              }`}
            >
              SMS Access
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-4">
            {errorMsg && (
              <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-xs text-red-700 leading-relaxed font-medium">
                ⚠️ {errorMsg}
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
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number (E.164 format)
                    </label>
                    <p className="text-[10px] text-gray-400 mb-2 leading-relaxed font-sans">
                      Enter complete number with country code prefix (e.g. +15551234567)
                    </p>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+15551234567"
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-black font-mono"
                        disabled={loading}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full mt-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-400"
                      disabled={loading}
                    >
                      {loading ? "Sending SMS Code..." : "Send Verification SMS"}
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      6-Digit Verification Code
                    </label>
                    <p className="text-[10px] text-gray-400 mb-2 leading-relaxed font-sans">
                      Enter the code received on your device for {phoneNumber}
                    </p>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-black text-center tracking-[0.5em] font-mono text-lg font-bold"
                        disabled={loading}
                      />
                    </div>

                    <div className="flex gap-2.5 mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setConfirmationResult(null);
                          setVerificationCode("");
                          setErrorMsg(null);
                        }}
                        className="w-1/3 py-2.5 border border-[#e2e8f0] hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center cursor-pointer"
                        disabled={loading}
                      >
                        Change
                      </button>
                      
                      <button
                        type="submit"
                        className="w-2/3 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-400"
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
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Your Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-black"
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane.doe@example.com"
                      className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-black"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-black"
                      disabled={loading}
                    />
                  </div>
                  {activeTab === "signup" && (
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">
                      Must be at least 6 characters long
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-400"
                  disabled={loading}
                >
                  {loading ? "Processing Secure Handshake..." : activeTab === "signin" ? "Sign In to Vault" : "Create Vault Profile"}
                </button>
              </form>
            )}

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-[10px] font-mono text-gray-400 uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button
              onClick={handleQuickDemo}
              className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold tracking-wide border border-indigo-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              disabled={loading}
            >
              <Sparkles className="h-4 w-4 text-indigo-500" />
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
