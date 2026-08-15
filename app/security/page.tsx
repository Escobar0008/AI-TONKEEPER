"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ArrowLeft,
  Shield,
  Lock,
  KeyRound,
  Mail,
  Smartphone,
  Fingerprint,
  MonitorSmartphone,
  History,
  LogOut,
  Trash2,
  ChevronRight,
  X,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
} from "lucide-react";

type ModalType =
  | "password"
  | "pin"
  | "email"
  | "device"
  | "biometric"
  | "twoFactor"
  | "devices"
  | "activity"
  | "lock"
  | "logoutAll"
  | "delete"
  | null;

type Device = {
  id: string;
  name?: string;
  deviceName?: string;
  browser?: string;
  os?: string;
  ip?: string;
  lastActive?: string;
  createdAt?: string;
  current?: boolean;
  isCurrent?: boolean;
};

type SecurityActivity = {
  id: string;
  title?: string;
  action?: string;
  description?: string;
  ip?: string;
  createdAt?: string;
  timestamp?: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  devices?: Device[];
  activities?: SecurityActivity[];
  data?: {
    devices?: Device[];
    activities?: SecurityActivity[];
  };
};

export default function SecurityPage() {
  const [modal, setModal] = useState<ModalType>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeSent, setEmailCodeSent] = useState(false);

  const [devices, setDevices] = useState<Device[]>([]);
  const [activities, setActivities] = useState<SecurityActivity[]>([]);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const closeModal = () => {
    if (loading) return;

    setModal(null);
    setMessage("");
    setError("");
    setShowPassword(false);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");

    setNewEmail("");
    setEmailCode("");
    setEmailCodeSent(false);
  };

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const parseResponse = async (
    response: Response
  ): Promise<ApiResponse> => {
    try {
      return await response.json();
    } catch {
      return {
        success: false,
        message: "Invalid server response.",
      };
    }
  };

  const getErrorMessage = (
    data: ApiResponse,
    fallback: string
  ) => {
    return (
      data.message ||
      data.error ||
      fallback
    );
  };

  /*
   * ============================================================
   * CHANGE PASSWORD
   * ============================================================
   */

  const handlePasswordChange = async () => {
    clearMessages();

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setError(
        "Please complete all password fields."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "The new password must be different from the current password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/security/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data =
        await parseResponse(response);

      if (!response.ok || !data.success) {
        setError(
          getErrorMessage(
            data,
            "Unable to change your password."
          )
        );
        return;
      }

      setMessage(
        data.message ||
          "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(
        "SECURITY_PASSWORD_ERROR:",
        err
      );

      setError(
        "A server error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * CHANGE PIN
   * ============================================================
   */

  const handlePinChange = async () => {
    clearMessages();

    if (
      !currentPin ||
      !newPin ||
      !confirmPin
    ) {
      setError(
        "Please complete all PIN fields."
      );
      return;
    }

    if (!/^\d{4,6}$/.test(currentPin)) {
      setError(
        "Current PIN must contain 4 to 6 digits."
      );
      return;
    }

    if (!/^\d{4,6}$/.test(newPin)) {
      setError(
        "New PIN must contain 4 to 6 digits."
      );
      return;
    }

    if (currentPin === newPin) {
      setError(
        "The new PIN must be different from the current PIN."
      );
      return;
    }

    if (newPin !== confirmPin) {
      setError("New PINs do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/security/change-pin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            currentPin,
            newPin,
          }),
        }
      );

      const data =
        await parseResponse(response);

      if (!response.ok || !data.success) {
        setError(
          getErrorMessage(
            data,
            "Unable to change your PIN."
          )
        );
        return;
      }

      setMessage(
        data.message ||
          "PIN changed successfully."
      );

      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    } catch (err) {
      console.error(
        "SECURITY_PIN_ERROR:",
        err
      );

      setError(
        "A server error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * CHANGE EMAIL
   * ============================================================
   */

  const handleEmailChange = async () => {
    clearMessages();

    const email =
      newEmail.trim().toLowerCase();

    if (!email) {
      setError(
        "Please enter your new email address."
      );
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/security/change-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            newEmail: email,
            action: "send",
          }),
        }
      );

      const data =
        await parseResponse(response);

      if (!response.ok || !data.success) {
        setError(
          getErrorMessage(
            data,
            "Unable to send the verification code."
          )
        );
        return;
      }

      setEmailCodeSent(true);

      setMessage(
        data.message ||
          "Verification code sent to your new email address."
      );
    } catch (err) {
      console.error(
        "SECURITY_EMAIL_SEND_ERROR:",
        err
      );

      setError(
        "A server error occurred while sending the verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * VERIFY EMAIL
   * ============================================================
   */

  const handleEmailVerification = async () => {
    clearMessages();

    const code = emailCode.trim();

    if (!/^\d{6}$/.test(code)) {
      setError(
        "The verification code must contain 6 digits."
      );
      return;
    }

    const email =
      newEmail.trim().toLowerCase();

    setLoading(true);

    try {
      const response = await fetch(
        "/api/security/change-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            newEmail: email,
            code,
            action: "verify",
          }),
        }
      );

      const data =
        await parseResponse(response);

      if (!response.ok || !data.success) {
        setError(
          getErrorMessage(
            data,
            "Unable to verify the email address."
          )
        );
        return;
      }

      setMessage(
        data.message ||
          "Email address changed successfully."
      );

      setNewEmail("");
      setEmailCode("");
      setEmailCodeSent(false);
    } catch (err) {
      console.error(
        "SECURITY_EMAIL_VERIFY_ERROR:",
        err
      );

      setError(
        "A server error occurred while verifying the email."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * NEW DEVICE VERIFICATION
   * ============================================================
   */

  const handleDeviceVerification = async () => {
    clearMessages();
    setLoading(true);

    try {
      const response = await fetch(
        "/api/security/new-device",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            action: "request",
          }),
        }
      );

      const data =
        await parseResponse(response);

      if (!response.ok || !data.success) {
        setError(
          getErrorMessage(
            data,
            "Unable to start device verification."
          )
        );
        return;
      }

      setMessage(
        data.message ||
          "Device verification has been started."
      );
    } catch (err) {
      console.error(
        "SECURITY_DEVICE_ERROR:",
        err
      );

      setError(
        "Unable to start device verification."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * BIOMETRIC
   * ============================================================
   */

  const handleBiometric = async () => {
    clearMessages();

    if (
      typeof window === "undefined" ||
      !window.PublicKeyCredential
    ) {
      setError(
        "Biometric authentication is not supported on this device or browser."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/security/biometric",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            action: biometricEnabled
              ? "disable"
              : "begin",
          }),
        }
      );

      const data =
        await parseResponse(response);

      if (!response.ok || !data.success) {
        setError(
          getErrorMessage(
            data,
            "Unable to configure biometric authentication."
          )
        );
        return;
      }

      setBiometricEnabled(
        !biometricEnabled
      );

      setMessage(
        data.message ||
          (biometricEnabled
            ? "Biometric authentication disabled."
            : "Biometric authentication enabled.")
      );
    } catch (err) {
      console.error(
        "SECURITY_BIOMETRIC_ERROR:",
        err
      );

      setError(
        "Unable to configure biometric authentication."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * 2FA
   * ============================================================
   */

  const handleTwoFactor = async () => {
    clearMessages();
    setLoading(true);

    try {
      const response = await fetch(
        "/api/security/2fa",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            action: twoFactorEnabled
              ? "disable"
              : "enable",
          }),
        }
      );

      const data =
        await parseResponse(response);

      if (!response.ok || !data.success) {
        setError(
          getErrorMessage(
            data,
            "Unable to update two-factor authentication."
          )
        );
        return;
      }

      setTwoFactorEnabled(
        !twoFactorEnabled
      );

      setMessage(
        data.message ||
          (twoFactorEnabled
            ? "Two-factor authentication disabled."
            : "Two-factor authentication enabled.")
      );
    } catch (err) {
      console.error(
        "SECURITY_2FA_ERROR:",
        err
      );

      setError(
        "Unable to update two-factor authentication."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * LOAD DEVICES
   * ============================================================
   */

  const loadDevices = async () => {
    setLoading(true);
    clearMessages();

    try {
      const response = await fetch(
        "/api/security/devices",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data =
        await parseResponse(response);

      if (!response.ok || !data.success) {
        setError(
          getErrorMessage(
            data,
            "Unable to load connected devices."
          )
        );
        return;
      }

      setDevices(
        data.devices ||
          data.data?.devices ||
          []
      );
    } catch (err) {
      console.error(
        "SECURITY_DEVICES_ERROR:",
        err
      );

      setError(
        "Unable to load connected devices."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * LOAD SECURITY ACTIVITY
   * ============================================================
   */

  const loadActivities = async () => {
    setLoading(true);
    clearMessages();

    try {
      const response = await fetch(
        "/api/security/activity",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data =
        await parseResponse(response);

      if (!response.ok || !data.success) {
        setError(
          getErrorMessage(
            data,
            "Unable to load security activity."
          )
        );
        return;
      }

      setActivities(
        data.activities ||
          data.data?.activities ||
          []
      );
    } catch (err) {
      console.error(
        "SECURITY_ACTIVITY_ERROR:",
        err
      );

      setError(
        "Unable to load security activity."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * LOCK ACCOUNT
   * ============================================================
   */

  const handleLockAccount = async () => {
    clearMessages();
    setLoading(true);

    try {
      const response = await fetch(
        "/api/security/lock-account",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            action: "lock",
          }),
        }
      );

      const data =
        await parseResponse(response);

      if (!response.ok || !data.success) {
        setError(
          getErrorMessage(
            data,
            "Unable to lock your account."
          )
        );
        return;
      }

      setMessage(
        data.message ||
          "Your account has been locked."
      );
    } catch (err) {
      console.error(
        "SECURITY_LOCK_ERROR:",
        err
      );

      setError(
        "Unable to lock your account."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * LOGOUT ALL DEVICES
   * ============================================================
   */

  const handleLogoutAll = async () => {
    clearMessages();
    setLoading(true);

    try {
      const response = await fetch(
        "/api/security/logout-all",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data =
        await parseResponse(response);

      if (!response.ok || !data.success) {
        setError(
          getErrorMessage(
            data,
            "Unable to log out all devices."
          )
        );
        return;
      }

      setMessage(
        data.message ||
          "All other active sessions have been logged out."
      );
    } catch (err) {
      console.error(
        "SECURITY_LOGOUT_ALL_ERROR:",
        err
      );

      setError(
        "Unable to log out all devices."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * DELETE ACCOUNT
   * ============================================================
   */

  const handleDeleteAccount = async () => {
    clearMessages();
    setLoading(true);

    try {
      const response = await fetch(
        "/api/security/delete-account",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            action: "request",
          }),
        }
      );

      const data =
        await parseResponse(response);

      if (!response.ok || !data.success) {
        setError(
          getErrorMessage(
            data,
            "Unable to start account deletion."
          )
        );
        return;
      }

      setMessage(
        data.message ||
          "Account deletion request has been started."
      );
    } catch (err) {
      console.error(
        "SECURITY_DELETE_ERROR:",
        err
      );

      setError(
        "Unable to start account deletion."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * OPEN MODAL
   * ============================================================
   */

  const openModal = (
    type: ModalType
  ) => {
    clearMessages();
    setModal(type);

    if (type === "devices") {
      void loadDevices();
    }

    if (type === "activity") {
      void loadActivities();
    }
  };

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-[#050B18] text-white">
      <div className="max-w-md mx-auto px-5 py-6 pb-28">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-8">
          <Link href="/settings">
            <button
              type="button"
              className="w-12 h-12 rounded-2xl border border-slate-800 bg-[#101A2C] flex items-center justify-center"
            >
              <ArrowLeft size={22} />
            </button>
          </Link>

          <div className="text-center">
            <h1 className="text-2xl font-bold">
              Security Center
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Protect your AI TONKEEPER account
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl border border-slate-800 bg-[#101A2C] flex items-center justify-center">
            <Shield
              size={22}
              className="text-cyan-400"
            />
          </div>
        </div>

        {/* SECURITY CARD */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Account Security
              </h2>

              <p className="mt-2 text-cyan-100">
                Manage your security settings in one place.
              </p>
            </div>

            <Shield
              size={46}
              className="text-white"
            />
          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-4">
            <p className="text-sm text-cyan-100">
              Security Status
            </p>

            <p className="mt-2 text-2xl font-bold">
              Protected
            </p>
          </div>
        </div>

        {/* BASIC SECURITY */}

        <div className="mt-8 space-y-4">
          <SecurityButton
            icon={
              <Lock
                size={28}
                className="text-blue-400"
              />
            }
            iconBg="bg-blue-500/10"
            title="Change Password"
            description="Update your account password."
            onClick={() =>
              openModal("password")
            }
          />

          <SecurityButton
            icon={
              <KeyRound
                size={28}
                className="text-cyan-400"
              />
            }
            iconBg="bg-cyan-500/10"
            title="Change PIN"
            description="Change your account security PIN."
            onClick={() =>
              openModal("pin")
            }
          />

          <SecurityButton
            icon={
              <Mail
                size={28}
                className="text-green-400"
              />
            }
            iconBg="bg-green-500/10"
            title="Change Email"
            description="Update your email address."
            onClick={() =>
              openModal("email")
            }
          />

          <SecurityButton
            icon={
              <Smartphone
                size={28}
                className="text-purple-400"
              />
            }
            iconBg="bg-purple-500/10"
            title="New Device Verification"
            description="Verify access from a new device."
            onClick={() =>
              openModal("device")
            }
          />
        </div>

        {/* ADVANCED SECURITY */}

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">
            Advanced Security
          </h2>

          <div className="space-y-4">
            <SecurityButton
              icon={
                <Fingerprint
                  size={28}
                  className="text-orange-400"
                />
              }
              iconBg="bg-orange-500/10"
              title="Biometric Login"
              description={
                biometricEnabled
                  ? "Biometric authentication is enabled."
                  : "Face ID / Fingerprint authentication."
              }
              onClick={() =>
                openModal("biometric")
              }
            />

            <SecurityButton
              icon={
                <Shield
                  size={28}
                  className="text-cyan-400"
                />
              }
              iconBg="bg-cyan-500/10"
              title="Two-Factor Authentication"
              description={
                twoFactorEnabled
                  ? "Two-factor authentication is enabled."
                  : "Enable 2FA for extra protection."
              }
              onClick={() =>
                openModal("twoFactor")
              }
            />

            <SecurityButton
              icon={
                <MonitorSmartphone
                  size={28}
                  className="text-green-400"
                />
              }
              iconBg="bg-green-500/10"
              title="Connected Devices"
              description="Manage active account sessions."
              onClick={() =>
                openModal("devices")
              }
            />

            <SecurityButton
              icon={
                <History
                  size={28}
                  className="text-purple-400"
                />
              }
              iconBg="bg-purple-500/10"
              title="Security Activity"
              description="View recent security events."
              onClick={() =>
                openModal("activity")
              }
            />
          </div>
        </div>

        {/* EMERGENCY */}

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">
            Emergency Actions
          </h2>

          <div className="space-y-4">
            <EmergencyButton
              icon={
                <Shield
                  size={28}
                  className="text-orange-400"
                />
              }
              iconBg="bg-orange-500/20"
              title="Lock Account"
              description="Temporarily lock your account."
              border="border-orange-500/30"
              background="bg-orange-500/10"
              hover="hover:bg-orange-500/20"
              onClick={() =>
                openModal("lock")
              }
            />

            <EmergencyButton
              icon={
                <LogOut
                  size={28}
                  className="text-yellow-400"
                />
              }
              iconBg="bg-yellow-500/20"
              title="Log Out All Devices"
              description="Sign out from all active sessions."
              border="border-yellow-500/30"
              background="bg-yellow-500/10"
              hover="hover:bg-yellow-500/20"
              onClick={() =>
                openModal("logoutAll")
              }
            />

            <EmergencyButton
              icon={
                <Trash2
                  size={28}
                  className="text-red-400"
                />
              }
              iconBg="bg-red-500/20"
              title="Delete Account"
              description="Permanently delete your account."
              border="border-red-500/30"
              background="bg-red-500/10"
              hover="hover:bg-red-500/20"
              onClick={() =>
                openModal("delete")
              }
            />
          </div>
        </div>

        {/* FOOTER */}

        <div className="mt-10 text-center">
          <p className="text-sm text-slate-500">
            AI TONKEEPER Security Center
          </p>

          <p className="mt-2 font-semibold text-cyan-400">
            ai-tonkeeper.xyz
          </p>

          <p className="mt-6 text-xs text-slate-600">
            © 2026 AI TONKEEPER. All rights reserved.
          </p>
        </div>
      </div>

      {/* MODAL */}

      {modal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-[#101A2C] p-6 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">
                  {modal === "password" &&
                    "Change Password"}

                  {modal === "pin" &&
                    "Change PIN"}

                  {modal === "email" &&
                    "Change Email"}

                  {modal === "device" &&
                    "New Device Verification"}

                  {modal === "biometric" &&
                    "Biometric Login"}

                  {modal === "twoFactor" &&
                    "Two-Factor Authentication"}

                  {modal === "devices" &&
                    "Connected Devices"}

                  {modal === "activity" &&
                    "Security Activity"}

                  {modal === "lock" &&
                    "Lock Account"}

                  {modal === "logoutAll" &&
                    "Log Out All Devices"}

                  {modal === "delete" &&
                    "Delete Account"}
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  AI TONKEEPER Security
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="w-10 h-10 rounded-xl bg-[#050B18] border border-slate-800 flex items-center justify-center disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* PASSWORD */}

            {modal === "password" && (
              <div className="space-y-4">
                <InputField
                  label="Current Password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  icon={<Lock size={18} />}
                  right={
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  }
                />

                <InputField
                  label="New Password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={setNewPassword}
                  icon={<KeyRound size={18} />}
                />

                <InputField
                  label="Confirm New Password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  icon={<KeyRound size={18} />}
                />

                <ActionButton
                  onClick={
                    handlePasswordChange
                  }
                  text="Update Password"
                  loading={loading}
                />
              </div>
            )}

            {/* PIN */}

            {modal === "pin" && (
              <div className="space-y-4">
                <InputField
                  label="Current PIN"
                  type="password"
                  inputMode="numeric"
                  value={currentPin}
                  onChange={setCurrentPin}
                  icon={<KeyRound size={18} />}
                />

                <InputField
                  label="New PIN"
                  type="password"
                  inputMode="numeric"
                  value={newPin}
                  onChange={setNewPin}
                  icon={<KeyRound size={18} />}
                />

                <InputField
                  label="Confirm New PIN"
                  type="password"
                  inputMode="numeric"
                  value={confirmPin}
                  onChange={setConfirmPin}
                  icon={<KeyRound size={18} />}
                />

                <ActionButton
                  onClick={handlePinChange}
                  text="Update PIN"
                  loading={loading}
                />
              </div>
            )}

            {/* EMAIL */}

            {modal === "email" && (
              <div className="space-y-4">
                <InputField
                  label="New Email Address"
                  type="email"
                  value={newEmail}
                  onChange={setNewEmail}
                  icon={<Mail size={18} />}
                />

                {!emailCodeSent ? (
                  <>
                    <p className="text-xs leading-5 text-slate-500">
                      A verification code will be
                      sent to your new email address.
                    </p>

                    <ActionButton
                      onClick={
                        handleEmailChange
                      }
                      text="Send Verification Code"
                      loading={loading}
                    />
                  </>
                ) : (
                  <>
                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                      <p className="text-sm text-cyan-100">
                        Verification code sent to:
                      </p>

                      <p className="mt-2 font-semibold break-all">
                        {newEmail}
                      </p>

                      <p className="mt-2 text-xs text-cyan-200/70">
                        The code expires after 10 minutes.
                      </p>
                    </div>

                    <InputField
                      label="Verification Code"
                      type="text"
                      inputMode="numeric"
                      value={emailCode}
                      onChange={(value) =>
                        setEmailCode(
                          value
                            .replace(/\D/g, "")
                            .slice(0, 6)
                        )
                      }
                      icon={
                        <KeyRound size={18} />
                      }
                    />

                    <ActionButton
                      onClick={
                        handleEmailVerification
                      }
                      text="Verify & Change Email"
                      loading={loading}
                    />

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setEmailCode("");
                        setEmailCodeSent(false);
                        clearMessages();
                      }}
                      className="w-full mt-2 py-3 rounded-2xl border border-slate-800 text-sm text-slate-300 hover:bg-[#16233D] transition"
                    >
                      Use a Different Email
                    </button>
                  </>
                )}
              </div>
            )}

            {/* NEW DEVICE */}

            {modal === "device" && (
              <div>
                <SecurityIcon
                  icon={
                    <Smartphone size={30} />
                  }
                />

                <p className="text-sm text-slate-300 leading-6">
                  Verify this device before it can
                  be trusted for future account access.
                </p>

                <ActionButton
                  onClick={
                    handleDeviceVerification
                  }
                  text="Start Verification"
                  loading={loading}
                />
              </div>
            )}

            {/* BIOMETRIC */}

            {modal === "biometric" && (
              <div>
                <SecurityIcon
                  icon={
                    <Fingerprint size={30} />
                  }
                />

                <p className="text-sm text-slate-300 leading-6">
                  Biometric login uses your device
                  security system. AI TONKEEPER does
                  not directly store your biometric data.
                </p>

                <div className="mt-5 rounded-2xl bg-[#050B18] border border-slate-800 p-4">
                  <p className="text-sm text-slate-400">
                    Status
                  </p>

                  <p
                    className={`mt-1 font-bold ${
                      biometricEnabled
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {biometricEnabled
                      ? "Enabled"
                      : "Not enabled"}
                  </p>
                </div>

                <ActionButton
                  onClick={handleBiometric}
                  text={
                    biometricEnabled
                      ? "Disable Biometric Login"
                      : "Enable Biometric Login"
                  }
                  loading={loading}
                />
              </div>
            )}

            {/* 2FA */}

            {modal === "twoFactor" && (
              <div>
                <SecurityIcon
                  icon={
                    <Shield size={30} />
                  }
                />

                <p className="text-sm text-slate-300 leading-6">
                  Two-factor authentication adds
                  another verification step when
                  accessing your account.
                </p>

                <div className="mt-5 rounded-2xl bg-[#050B18] border border-slate-800 p-4">
                  <p className="text-sm text-slate-400">
                    Current status
                  </p>

                  <p
                    className={`mt-1 font-bold ${
                      twoFactorEnabled
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {twoFactorEnabled
                      ? "Enabled"
                      : "Not configured"}
                  </p>
                </div>

                <ActionButton
                  onClick={handleTwoFactor}
                  text={
                    twoFactorEnabled
                      ? "Disable 2FA"
                      : "Set Up 2FA"
                  }
                  loading={loading}
                />
              </div>
            )}

            {/* DEVICES */}

            {modal === "devices" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <SecurityIcon
                    icon={
                      <MonitorSmartphone
                        size={30}
                      />
                    }
                  />

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      void loadDevices()
                    }
                    className="w-10 h-10 rounded-xl border border-slate-800 bg-[#050B18] flex items-center justify-center"
                  >
                    <RefreshCw
                      size={18}
                      className={
                        loading
                          ? "animate-spin"
                          : ""
                      }
                    />
                  </button>
                </div>

                {loading && devices.length === 0 ? (
                  <LoadingBox />
                ) : devices.length === 0 ? (
                  <EmptyBox text="No connected devices were found." />
                ) : (
                  <div className="space-y-3">
                    {devices.map(
                      (device) => (
                        <DeviceItem
                          key={device.id}
                          device={device}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ACTIVITY */}

            {modal === "activity" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <SecurityIcon
                    icon={
                      <History size={30} />
                    }
                  />

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      void loadActivities()
                    }
                    className="w-10 h-10 rounded-xl border border-slate-800 bg-[#050B18] flex items-center justify-center"
                  >
                    <RefreshCw
                      size={18}
                      className={
                        loading
                          ? "animate-spin"
                          : ""
                      }
                    />
                  </button>
                </div>

                {loading &&
                activities.length === 0 ? (
                  <LoadingBox />
                ) : activities.length === 0 ? (
                  <EmptyBox text="No security activity was found." />
                ) : (
                  <div className="space-y-3">
                    {activities.map(
                      (activity) => (
                        <ActivityItem
                          key={activity.id}
                          activity={activity}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* LOCK */}

            {modal === "lock" && (
              <div>
                <WarningBox>
                  Locking your account will prevent
                  normal access until the account is
                  recovered.
                </WarningBox>

                <ActionButton
                  onClick={handleLockAccount}
                  text="Lock My Account"
                  danger
                  loading={loading}
                />
              </div>
            )}

            {/* LOGOUT ALL */}

            {modal === "logoutAll" && (
              <div>
                <WarningBox>
                  This will invalidate all active
                  account sessions.
                </WarningBox>

                <ActionButton
                  onClick={handleLogoutAll}
                  text="Log Out All Devices"
                  danger
                  loading={loading}
                />
              </div>
            )}

            {/* DELETE */}

            {modal === "delete" && (
              <div>
                <WarningBox>
                  Account deletion is permanent.
                  Continue only if you really want
                  to delete your AI TONKEEPER account.
                </WarningBox>

                <ActionButton
                  onClick={handleDeleteAccount}
                  text="Continue to Account Deletion"
                  danger
                  loading={loading}
                />
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={20}
                    className="text-red-400 mt-0.5 shrink-0"
                  />

                  <p className="text-sm text-red-200 leading-5">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* SUCCESS */}

            {message && (
              <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="text-cyan-400 mt-0.5 shrink-0"
                  />

                  <p className="text-sm text-cyan-100 leading-5">
                    {message}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

/* ============================================================
   SECURITY BUTTON
============================================================ */

function SecurityButton({
  icon,
  iconBg,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-3xl border border-slate-800 bg-[#101A2C] p-5 hover:bg-[#16233D] transition"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center`}
          >
            {icon}
          </div>

          <div>
            <h3 className="font-bold text-lg">
              {title}
            </h3>

            <p className="text-sm text-slate-400">
              {description}
            </p>
          </div>
        </div>

        <ChevronRight className="text-slate-500 shrink-0" />
      </div>
    </button>
  );
}

/* ============================================================
   EMERGENCY BUTTON
============================================================ */

function EmergencyButton({
  icon,
  iconBg,
  title,
  description,
  border,
  background,
  hover,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  border: string;
  background: string;
  hover: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-3xl border ${border} ${background} p-5 ${hover} transition`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center`}
          >
            {icon}
          </div>

          <div>
            <h3 className="font-bold">
              {title}
            </h3>

            <p className="text-sm text-slate-300 mt-1">
              {description}
            </p>
          </div>
        </div>

        <ChevronRight className="text-slate-400 shrink-0" />
      </div>
    </button>
  );
}

/* ============================================================
   INPUT
============================================================ */

function InputField({
  label,
  type,
  value,
  onChange,
  icon,
  right,
  inputMode,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  inputMode?:
    | "numeric"
    | "text"
    | "email"
    | "tel"
    | "search"
    | "url";
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </div>

        <input
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full rounded-2xl border border-slate-800 bg-[#050B18] py-4 pl-11 pr-12 text-white outline-none focus:border-cyan-500"
        />

        {right && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
            {right}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   ACTION BUTTON
============================================================ */

function ActionButton({
  onClick,
  text,
  danger = false,
  loading = false,
}: {
  onClick: () => void;
  text: string;
  danger?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`w-full mt-5 rounded-2xl py-4 font-bold transition flex items-center justify-center gap-2 ${
        danger
          ? "bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30"
          : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90"
      } ${
        loading
          ? "opacity-60 cursor-not-allowed"
          : ""
      }`}
    >
      {loading && (
        <Loader2
          size={19}
          className="animate-spin"
        />
      )}

      {loading
        ? "Processing..."
        : text}
    </button>
  );
}

/* ============================================================
   SECURITY ICON
============================================================ */

function SecurityIcon({
  icon,
}: {
  icon: React.ReactNode;
}) {
  return (
    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5">
      {icon}
    </div>
  );
}

/* ============================================================
   WARNING
============================================================ */

function WarningBox({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle
          size={20}
          className="text-yellow-400 mt-0.5 shrink-0"
        />

        <p className="text-sm text-yellow-100 leading-5">
          {children}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   LOADING
============================================================ */

function LoadingBox() {
  return (
    <div className="rounded-2xl bg-[#050B18] border border-slate-800 p-6 flex items-center justify-center gap-3">
      <Loader2
        size={20}
        className="animate-spin text-cyan-400"
      />

      <span className="text-sm text-slate-400">
        Loading...
      </span>
    </div>
  );
}

/* ============================================================
   EMPTY
============================================================ */

function EmptyBox({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-[#050B18] border border-slate-800 p-6 text-center">
      <p className="text-sm text-slate-400">
        {text}
      </p>
    </div>
  );
}

/* ============================================================
   DEVICE ITEM
============================================================ */

function DeviceItem({
  device,
}: {
  device: Device;
}) {
  const name =
    device.name ||
    device.deviceName ||
    "Unknown device";

  const active =
    device.current ||
    device.isCurrent;

  return (
    <div className="rounded-2xl bg-[#050B18] border border-slate-800 p-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
          <MonitorSmartphone
            size={21}
            className="text-green-400"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {name}
          </p>

          {(device.browser ||
            device.os) && (
            <p className="text-xs text-slate-500 mt-1">
              {[device.browser, device.os]
                .filter(Boolean)
                .join(" • ")}
            </p>
          )}

          {device.ip && (
            <p className="text-xs text-slate-500 mt-1">
              IP: {device.ip}
            </p>
          )}

          {device.lastActive && (
            <p className="text-xs text-slate-500 mt-1">
              Last active:{" "}
              {device.lastActive}
            </p>
          )}

          {active && (
            <div className="mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />

              <span className="text-xs text-green-400">
                Current device
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ACTIVITY ITEM
============================================================ */

function ActivityItem({
  activity,
}: {
  activity: SecurityActivity;
}) {
  const title =
    activity.title ||
    activity.action ||
    "Security event";

  const description =
    activity.description;

  const time =
    activity.createdAt ||
    activity.timestamp ||
    "";

  return (
    <div className="rounded-2xl bg-[#050B18] border border-slate-800 p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
          <CheckCircle2
            size={18}
            className="text-cyan-400"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {title}
          </p>

          {description && (
            <p className="text-xs text-slate-500 mt-1">
              {description}
            </p>
          )}

          {activity.ip && (
            <p className="text-xs text-slate-600 mt-1">
              IP: {activity.ip}
            </p>
          )}

          {time && (
            <p className="text-xs text-slate-500 mt-2">
              {time}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}