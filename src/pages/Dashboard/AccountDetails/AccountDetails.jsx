import React, { useState } from 'react';
import useUserInfo from '../../../hooks/useUserInfo';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import toast from 'react-hot-toast';

const AccountDetails = () => {
  const [userFromDB, isUserLoading, refetch] = useUserInfo();
  const [axiosSecure] = useAxiosSecure();
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  React.useEffect(() => {
    if (userFromDB?.name) setName(userFromDB.name);
    // Seed from whatever is stored, including nothing — a customer who signed
    // up before this field existed sees an empty box they can fill in.
    setEmail(userFromDB?.email || '');
  }, [userFromDB]);

  const handleSaveDetails = (e) => {
    e.preventDefault();

    const trimmed = email.trim();
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Enter a valid email address');
      return;
    }
    setEmailError(null);

    setIsSaving(true);
    // Always send `email`, unlike signup: here an empty string is meaningful.
    // It is how someone removes an address they previously saved, which the
    // server turns into an $unset rather than storing a blank value.
    axiosSecure
      .patch('/users/me', { name, email: trimmed })
      .then((res) => {
        if (res.data.success) {
          toast.success('Account details saved');
          refetch();
        }
      })
      .catch((error) => {
        const message = error.response?.data?.error || 'Failed to save changes';
        // A collision is about the email specifically — show it against the
        // field rather than only as a toast that disappears.
        if (error.response?.status === 409) setEmailError(message);
        toast.error(message);
      })
      .finally(() => setIsSaving(false));
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsChangingPassword(true);
    axiosSecure
      .patch('/users/me/password', { currentPassword, newPassword })
      .then((res) => {
        if (res.data.success) {
          toast.success('Password updated successfully');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setShowPasswordFields(false);
        }
      })
      .catch((error) => {
        toast.error(error.response?.data?.error || 'Failed to update password');
      })
      .finally(() => setIsChangingPassword(false));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <h2 className="font-headline-md text-headline-md text-primary mb-2">Account Details</h2>
        <p className="font-body-base text-on-surface-variant">Manage your personal profile and security preferences.</p>
      </div>

      <form className="space-y-10" onSubmit={handleSaveDetails}>
        {/* Form Group: Identity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <div className="space-y-1">
            <label className="font-label-caps text-label-caps text-outline uppercase block">Full Name</label>
            <input
              className="border-0 border-b border-outline-variant bg-transparent w-full py-3 transition-colors outline-none focus:ring-0 focus:border-primary font-body-base text-on-surface"
              placeholder="Your full name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="font-label-caps text-label-caps text-outline uppercase block" htmlFor="account-phone">
              Phone Number
            </label>
            <input
              id="account-phone"
              className="border-0 border-b border-outline-variant bg-transparent w-full py-3 transition-colors outline-none focus:ring-0 focus:border-primary font-body-base text-on-surface"
              placeholder="Your contact number"
              type="tel"
              defaultValue={userFromDB?.phone || ''}
              disabled
            />
            <p className="text-[12px] text-on-surface-variant/70 pt-1">
              This is how you sign in, so it can't be changed here.
            </p>
          </div>
        </div>

        {/* Email — optional contact detail, not a sign-in method */}
        <div className="space-y-1">
          <label className="font-label-caps text-label-caps text-outline uppercase block" htmlFor="account-email">
            Email <span className="normal-case text-on-surface-variant/60">(optional)</span>
          </label>
          <input
            id="account-email"
            className={`border-0 border-b bg-transparent w-full py-3 transition-colors outline-none focus:ring-0 font-body-base text-on-surface ${
              emailError ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'
            }`}
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
            aria-invalid={Boolean(emailError)}
            aria-describedby="account-email-help"
          />
          <p id="account-email-help" className="text-[12px] pt-1">
            {emailError ? (
              <span className="text-error font-semibold">{emailError}</span>
            ) : (
              <span className="text-on-surface-variant/70">
                For order updates. You'll still sign in with your phone number.
                Leave blank to remove it.
              </span>
            )}
          </p>
        </div>

        {/* Form Group: Communication */}
        <div className="space-y-1">
          <label className="font-label-caps text-label-caps text-outline uppercase block">Email Address</label>
          <input
            className="border-0 border-b border-outline-variant bg-transparent w-full py-3 transition-colors outline-none focus:ring-0 focus:border-primary font-body-base text-on-surface opacity-70 cursor-not-allowed"
            placeholder="email@example.com"
            type="email"
            value={userFromDB?.email || ''}
            disabled
          />
        </div>

        {/* Action Footer */}
        <div className="pt-2 flex flex-col md:flex-row items-center gap-6">
          <button
            className="w-full md:w-auto bg-primary text-white font-button-text text-button-text px-12 py-4 rounded-none hover:scale-[1.02] active:scale-95 transition-ui duration-300 shadow-sm disabled:opacity-60"
            type="submit"
            disabled={isSaving || isUserLoading}
          >
            {isSaving ? 'SAVING…' : 'SAVE CHANGES'}
          </button>
        </div>
      </form>

      {/* Decorative Divider */}
      <div className="py-8 flex justify-center">
        <div className="w-16 h-[1px] bg-outline-variant"></div>
      </div>

      {/* Security Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Security</h3>
            <p className="text-body-base text-on-surface-variant text-sm">Manage your account access and credentials.</p>
          </div>
          <button
            className="text-primary font-bold text-sm hover:underline transition-ui"
            onClick={() => setShowPasswordFields(!showPasswordFields)}
            type="button"
          >
            Change Password
          </button>
        </div>

        {/* Expandable Password Fields */}
        {showPasswordFields && (
          <form onSubmit={handleChangePassword} className="space-y-8 mt-4 animate-in fade-in duration-500">
            <div className="space-y-1">
              <label className="font-label-caps text-label-caps text-outline uppercase block">Current Password</label>
              <input
                className="border-0 border-b border-outline-variant bg-transparent w-full py-3 transition-colors outline-none focus:ring-0 focus:border-primary font-body-base text-on-surface"
                placeholder="••••••••"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="space-y-1">
                <label className="font-label-caps text-label-caps text-outline uppercase block">New Password</label>
                <input
                  className="border-0 border-b border-outline-variant bg-transparent w-full py-3 transition-colors outline-none focus:ring-0 focus:border-primary font-body-base text-on-surface"
                  placeholder="Min. 6 characters"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-label-caps text-label-caps text-outline uppercase block">Confirm New Password</label>
                <input
                  className="border-0 border-b border-outline-variant bg-transparent w-full py-3 transition-colors outline-none focus:ring-0 focus:border-primary font-body-base text-on-surface"
                  placeholder="Repeat new password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-primary text-white font-button-text text-button-text px-10 py-3 hover:scale-[1.02] active:scale-95 transition-ui duration-300 disabled:opacity-60"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'UPDATING…' : 'UPDATE PASSWORD'}
            </button>
          </form>
        )}
      </div>

      {/* Secondary Info Cards (Bento style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-section-gap-sm">
        <div className="p-8 border border-outline-variant/30 bg-surface-container-low">
          <span className="material-symbols-outlined text-primary mb-4">verified_user</span>
          <h4 className="font-headline-sm text-headline-sm text-on-surface mb-2">Two-Factor Auth</h4>
          <p className="text-body-base text-on-surface-variant text-sm mb-6">Enhance your account security with an extra layer of protection.</p>
          <span className="text-label-caps text-on-surface-variant/60 uppercase tracking-widest font-label-caps text-[10px] cursor-not-allowed">COMING SOON</span>
        </div>
        <div className="p-8 border border-outline-variant/30 bg-surface-container-low">
          <span className="material-symbols-outlined text-primary mb-4">mail</span>
          <h4 className="font-headline-sm text-headline-sm text-on-surface mb-2">Preferences</h4>
          <p className="text-body-base text-on-surface-variant text-sm mb-6">Manage how you receive updates on our latest artisanal collections.</p>
          <span className="text-label-caps text-on-surface-variant/60 uppercase tracking-widest font-label-caps text-[10px] cursor-not-allowed">COMING SOON</span>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
