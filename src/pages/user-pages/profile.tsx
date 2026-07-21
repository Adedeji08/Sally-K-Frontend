import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { Camera, CircleCheck } from "lucide-react";
import Navbar from "../../layouts/navbar";
import { useAuth } from "../../context/auth-context";
import ChangePasswordModal from "../../components/profile/change-password-modal";

interface ProfileFormValues {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
}

const fieldClass =
  "w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-700 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all";

const MAX_PHOTO_BYTES = 1024 * 1024;

export default function Profile() {
  const navigate = useNavigate();
  const { isAuthenticated, user, openLoginModal, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl);
  const [photoError, setPhotoError] = useState("");
  const [saved, setSaved] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const { control, handleSubmit, reset } = useForm<ProfileFormValues>({
    defaultValues: {
      fullName: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      dateOfBirth: user?.dateOfBirth ?? "",
      gender: user?.gender ?? "",
      address: user?.address ?? "",
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal("Sign in to view your profile.");
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate, openLoginModal]);

  if (!user) return null;

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("File must be under 1MB.");
      return;
    }

    setPhotoError("");
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile({
      name: values.fullName,
      email: values.email,
      phone: values.phone,
      dateOfBirth: values.dateOfBirth,
      gender: values.gender,
      address: values.address,
      avatarUrl: avatarPreview,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCancel = () => {
    reset();
    setAvatarPreview(user.avatarUrl);
    setPhotoError("");
  };

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 mb-1">
          Profile Settings
        </h1>
        <p className="text-sm text-stone-400 mb-8">
          Manage your personal information and account settings.
        </p>

        {saved && (
          <div className="flex items-center gap-2 bg-rose-50 text-rose-600 text-sm font-medium rounded-xl px-4 py-3 mb-6">
            <CircleCheck className="w-4 h-4 shrink-0" strokeWidth={2} />
            Your profile has been updated.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-stone-100 flex items-center justify-center shrink-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-semibold text-stone-400">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={handlePhotoClick}
                className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-4 py-2.5 rounded-full text-sm transition-colors"
              >
                <Camera className="w-4 h-4" strokeWidth={2} />
                Change Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/gif"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <p className="text-xs text-stone-400 mt-2">JPG, GIF or PNG. 1MB max.</p>
              {photoError && <p className="text-xs text-rose-500 mt-1">{photoError}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Controller
              name="fullName"
              control={control}
              rules={{ required: "Full name is required" }}
              render={({ field, fieldState }) => (
                <div>
                  <label className="text-sm font-medium text-stone-700 mb-1.5 block">
                    Full Name
                  </label>
                  <input {...field} className={fieldClass} />
                  {fieldState.error && (
                    <p className="text-xs text-rose-500 mt-1">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Enter a valid email",
                },
              }}
              render={({ field, fieldState }) => (
                <div>
                  <label className="text-sm font-medium text-stone-700 mb-1.5 block">Email</label>
                  <input {...field} type="email" className={fieldClass} />
                  {fieldState.error && (
                    <p className="text-xs text-rose-500 mt-1">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="text-sm font-medium text-stone-700 mb-1.5 block">
                    Phone Number
                  </label>
                  <input {...field} placeholder="+1 (555) 123-4567" className={fieldClass} />
                </div>
              )}
            />

            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="text-sm font-medium text-stone-700 mb-1.5 block">
                    Date of Birth
                  </label>
                  <input {...field} type="date" className={fieldClass} />
                </div>
              )}
            />

            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="text-sm font-medium text-stone-700 mb-1.5 block">Gender</label>
                  <select {...field} className={fieldClass}>
                    <option value="">Select...</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              )}
            />

            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-stone-700 mb-1.5 block">
                    Delivery Address
                  </label>
                  <textarea
                    {...field}
                    rows={3}
                    placeholder="Street address, city, state"
                    className={fieldClass}
                  />
                  <p className="text-xs text-stone-400 mt-1">
                    Used to prefill shipping at checkout.
                  </p>
                </div>
              )}
            />
          </div>

          <div className="mt-6 pt-5 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setPasswordModalOpen(true)}
              className="text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
            >
              Change password
            </button>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 rounded-full text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </main>

      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </>
  );
}
