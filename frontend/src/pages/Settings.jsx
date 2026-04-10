import { useMemo, useState } from "react";
import { api, extractResponseData } from "../lib/api.js";
import { useAppStore } from "../store/appStore.js";
import { useAuthStore } from "../store/authStore.js";

function Settings() {
  const user = useAuthStore((state) => state.user);
  const patchUser = useAuthStore((state) => state.patchUser);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const addToast = useAppStore((state) => state.addToast);

  const [fullname, setFullname] = useState(user?.fullname || "");
  const [email, setEmail] = useState(user?.email || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  const avatarPreview = useMemo(() => {
    if (!avatarFile) {
      return user?.avatar || "/logo.jpg";
    }

    return URL.createObjectURL(avatarFile);
  }, [avatarFile, user]);

  const submitProfile = async (event) => {
    event.preventDefault();
    setIsSavingProfile(true);

    try {
      const response = await api.patch("/api/v1/users/updateDetails", {
        fullname,
        email,
      });
      const updatedUser = extractResponseData(response);
      patchUser(updatedUser);
      addToast("success", "Profile updated");
    } catch (error) {
      addToast(
        "error",
        error?.response?.data?.message || "Unable to update profile"
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();

    if (!oldPassword || !newPassword) {
      addToast("error", "Both old and new passwords are required");
      return;
    }

    setIsSavingPassword(true);
    try {
      await api.post("/api/v1/users/change-password", {
        oldPassword,
        newPassword,
      });
      setOldPassword("");
      setNewPassword("");
      addToast("success", "Password changed");
    } catch (error) {
      addToast(
        "error",
        error?.response?.data?.message || "Unable to change password"
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  const submitAvatar = async (event) => {
    event.preventDefault();

    if (!avatarFile) {
      addToast("error", "Choose an avatar image first");
      return;
    }

    setIsSavingAvatar(true);
    try {
      const payload = new FormData();
      payload.append("avatar", avatarFile);

      const response = await api.patch("/api/v1/users/updateAvatar", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = extractResponseData(response);
      patchUser(updatedUser);
      await refreshUser();
      setAvatarFile(null);
      addToast("success", "Avatar updated");
    } catch (error) {
      addToast(
        "error",
        error?.response?.data?.message || "Unable to update avatar"
      );
    } finally {
      setIsSavingAvatar(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="glass-panel p-6">
        <h1 className="font-display text-3xl text-white">Account Settings</h1>
        <p className="mt-2 text-sm text-brand-muted">
          Manage your profile, security, and avatar from one place.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={submitProfile} className="glass-panel space-y-4 p-6">
          <h2 className="font-display text-xl text-white">Profile Details</h2>
          <input
            type="text"
            value={fullname}
            onChange={(event) => setFullname(event.target.value)}
            placeholder="Full name"
            className="w-full rounded-xl border border-white/15 bg-brand-surface px-4 py-3 text-sm text-white outline-none"
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-white/15 bg-brand-surface px-4 py-3 text-sm text-white outline-none"
          />
          <button
            type="submit"
            disabled={isSavingProfile}
            className="rounded-xl bg-brand-base px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {isSavingProfile ? "Saving..." : "Save Profile"}
          </button>
        </form>

        <form onSubmit={submitAvatar} className="glass-panel space-y-4 p-6">
          <h2 className="font-display text-xl text-white">Avatar</h2>
          <img
            src={avatarPreview}
            alt="Avatar preview"
            className="h-24 w-24 rounded-2xl border border-white/20 object-cover"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
            className="block w-full text-sm text-brand-muted"
          />
          <button
            type="submit"
            disabled={isSavingAvatar}
            className="rounded-xl bg-brand-accent px-4 py-2 text-sm text-black disabled:opacity-60"
          >
            {isSavingAvatar ? "Uploading..." : "Upload Avatar"}
          </button>
        </form>
      </div>

      <form onSubmit={submitPassword} className="glass-panel space-y-4 p-6">
        <h2 className="font-display text-xl text-white">Security</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="password"
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
            placeholder="Current password"
            className="w-full rounded-xl border border-white/15 bg-brand-surface px-4 py-3 text-sm text-white outline-none"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="New password"
            className="w-full rounded-xl border border-white/15 bg-brand-surface px-4 py-3 text-sm text-white outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSavingPassword}
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {isSavingPassword ? "Updating..." : "Change Password"}
        </button>
      </form>
    </section>
  );
}

export default Settings;

