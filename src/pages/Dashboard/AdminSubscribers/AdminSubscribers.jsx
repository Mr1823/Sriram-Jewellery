import React from "react";
import { useQuery } from "react-query";
import toast from "react-hot-toast";
import useUserInfo from "../../../hooks/useUserInfo";
import useAuthContext from "../../../hooks/useAuthContext";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "—";

const AdminSubscribers = () => {
  const [userFromDB] = useUserInfo();
  const { user, isAuthLoading } = useAuthContext();
  const [axiosSecure] = useAxiosSecure();

  const { data: subscribers, isLoading } = useQuery({
    enabled:
      !isAuthLoading &&
      user !== null &&
      user !== undefined &&
      (userFromDB?.admin === true || userFromDB?.role === "ADMIN"),
    queryKey: ["newsletter-subscribers"],
    queryFn: async () => {
      const res = await axiosSecure.get("/newsletter");
      return res.data?.data || [];
    },
  });

  const handleCopyAll = async () => {
    const emails = (subscribers || []).map((s) => s.email).join(", ");
    if (!emails) return;
    try {
      await navigator.clipboard.writeText(emails);
      toast.success(`Copied ${subscribers.length} email${subscribers.length === 1 ? "" : "s"}`);
    } catch {
      // Clipboard access is denied outside a secure context, so fall back to a
      // selectable prompt rather than failing silently.
      window.prompt("Copy the subscriber emails:", emails);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <header className="h-20 flex items-center justify-between px-6 md:px-margin-desktop bg-background/80 backdrop-blur-md border-b border-outline-variant/30 z-40 shrink-0">
        <h2 className="font-display-lg text-headline-md text-primary">Subscribers</h2>
        <div className="flex items-center gap-4">
          <span className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-[0.1em]">
            {subscribers?.length || 0} total
          </span>
          <button
            type="button"
            onClick={handleCopyAll}
            disabled={!subscribers?.length}
            className="inline-flex items-center justify-center min-h-11 px-4 py-2 rounded border border-outline-variant/50 text-[12px] font-medium text-outline hover:text-primary hover:border-primary transition-ui disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Copy all emails
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-margin-desktop custom-scrollbar">
        <div className="bg-surface-dim border border-secondary/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-outline-variant/50 bg-surface-container-high/50">
                  <th className="px-6 py-4 font-label-caps text-outline text-[11px]">Email</th>
                  <th className="px-6 py-4 font-label-caps text-outline text-[11px] text-right">
                    Subscribed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {isLoading ? (
                  <tr>
                    <td colSpan="2" className="px-6 py-10 text-center text-outline">
                      Loading subscribers...
                    </td>
                  </tr>
                ) : subscribers?.length ? (
                  subscribers.map((s) => (
                    <tr key={s._id} className="hover:bg-white/40 transition-colors">
                      <td className="px-6 py-4">
                        <a href={`mailto:${s.email}`} className="text-[13px] text-primary hover:underline break-all">
                          {s.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-on-surface-variant text-right whitespace-nowrap">
                        {formatDate(s.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="px-6 py-10 text-center text-outline">
                      No subscribers yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscribers;
