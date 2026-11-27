"use client";

import { useEffect, useState } from "react";

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
};

export default function DemoRewardsPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetch("/api/admin/users", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load users.");
        }

        setUsers(data.users ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load users."
        );
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  const selectedUser = users.find(
    (user) => user.id === selectedUserId
  );

  async function handleSend() {
    setMessage("");
    setError("");

    if (!selectedUserId) {
      setError("Please select a user.");
      return;
    }

    if (!selectedUser?.email) {
      setError("The selected user has no email address.");
      return;
    }

    const confirmed = window.confirm(
      `Send the rewards notification to ${selectedUser.email}?`
    );

    if (!confirmed) return;

    setSending(true);

    try {
      const response = await fetch("/api/admin/demo-rewards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUserId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Email sending failed.");
      }

      setMessage(`Notification sent to ${selectedUser.email}.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Email sending failed."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050B18] text-white px-4 py-10">
      <div className="max-w-xl mx-auto">
        <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-6">
          <h1 className="text-2xl font-bold">
            Demo Rewards Notifications
          </h1>

          <p className="text-sm text-gray-400 mt-2">
            Send a rewards notification to a manually selected registered user.
          </p>

          <div className="mt-7">
            <label className="block text-sm font-semibold mb-2">
              Select a user
            </label>

            {loading ? (
              <p className="text-gray-400">Loading users...</p>
            ) : (
              <select
                value={selectedUserId}
                onChange={(event) => {
                  setSelectedUserId(event.target.value);
                  setMessage("");
                  setError("");
                }}
                className="w-full bg-[#0B1220] border border-slate-700 rounded-xl p-3 text-white"
              >
                <option value="">Choose a user</option>

                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || "Unnamed user"} — {user.email || "No email"}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedUser && (
            <div className="mt-5 bg-[#0B1220] border border-slate-700 rounded-xl p-4">
              <p className="text-xs text-gray-400">Selected account</p>
              <p className="font-semibold mt-1">
                {selectedUser.name || "Unnamed user"}
              </p>
              <p className="text-sm text-cyan-400 mt-1">
                {selectedUser.email || "No email address"}
              </p>
            </div>
          )}

          <div className="mt-5 bg-[#0B1220] border border-slate-700 rounded-xl p-5">
            <p className="text-sm text-gray-400">
              Rewards notification
            </p>

            <p className="text-sm text-gray-300 mt-2">
              The notification will be sent to the email address of the
              user selected above.
            </p>

            <p className="text-sm text-gray-300 mt-4">
              Recipient selection: Manual
            </p>
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={sending || loading || !selectedUserId}
            className="w-full mt-6 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#050B18] font-bold rounded-xl py-3 transition"
          >
            {sending ? "Sending..." : "Send Rewards Notification"}
          </button>

          {message && (
            <p className="mt-4 text-green-400 text-sm">
              {message}
            </p>
          )}

          {error && (
            <p className="mt-4 text-red-400 text-sm">
              {error}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}