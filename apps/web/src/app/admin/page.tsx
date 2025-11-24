"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "reports" | "payouts">("users");
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payoutStatus, setPayoutStatus] = useState<string>("");

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        if (res.data.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }
        loadData();
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router, activeTab]);

  const loadData = () => {
    if (activeTab === "users") {
      api.get("/admin/users").then((res) => {
        setUsers(res.data.users || []);
      });
    } else if (activeTab === "reports") {
      api.get("/admin/reports").then((res) => {
        setReports(res.data || []);
      });
    } else if (activeTab === "payouts") {
      const url = payoutStatus ? `/admin/payouts?status=${payoutStatus}` : "/admin/payouts";
      api.get(url).then((res) => {
        setPayouts(res.data || []);
      });
    }
  };

  const handleBan = async (userId: string) => {
    if (!confirm("Are you sure you want to ban this user?")) return;
    try {
      await api.post(`/admin/users/${userId}/ban`, { reason: "Banned by admin" });
      loadData();
      alert("User banned");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to ban user");
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/unban`);
      loadData();
      alert("User unbanned");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to unban user");
    }
  };

  const handleReportStatus = async (reportId: string, status: string) => {
    try {
      await api.put(`/admin/reports/${reportId}/status`, { status });
      loadData();
      alert("Report status updated");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update report");
    }
  };

  const handlePayoutAction = async (payoutId: string, action: string, txHash?: string) => {
    try {
      if (action === "processing") {
        await api.post(`/admin/payouts/${payoutId}/mark-processing`);
      } else if (action === "paid") {
        await api.post(`/admin/payouts/${payoutId}/mark-paid`, { txHash });
      } else if (action === "rejected") {
        const reason = prompt("Rejection reason (optional):");
        await api.post(`/admin/payouts/${payoutId}/mark-rejected`, { reason });
      }
      loadData();
      alert("Payout status updated");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update payout");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 ${activeTab === "users" ? "border-b-2 border-blue-600 font-semibold" : ""}`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 ${activeTab === "reports" ? "border-b-2 border-blue-600 font-semibold" : ""}`}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveTab("payouts")}
          className={`px-4 py-2 ${activeTab === "payouts" ? "border-b-2 border-blue-600 font-semibold" : ""}`}
        >
          Payouts
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">ID</th>
                <th className="text-left py-2">Email</th>
                <th className="text-left py-2">Username</th>
                <th className="text-left py-2">Role</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Created</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id} className="border-b">
                  <td className="py-3 text-sm">{user.id.substring(0, 8)}...</td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>
                    {user.isBanned ? (
                      <span className="text-red-600">Banned</span>
                    ) : (
                      <span className="text-green-600">Active</span>
                    )}
                  </td>
                  <td className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    {user.isBanned ? (
                      <button
                        onClick={() => handleUnban(user.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Unban
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBan(user.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Ban
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">ID</th>
                <th className="text-left py-2">Reporter</th>
                <th className="text-left py-2">Target</th>
                <th className="text-left py-2">Reason</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Created</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report: any) => (
                <tr key={report.id} className="border-b">
                  <td className="py-3 text-sm">{report.id.substring(0, 8)}...</td>
                  <td>{report.reporter?.username}</td>
                  <td>
                    {report.targetType}: {report.targetId.substring(0, 8)}...
                  </td>
                  <td className="max-w-xs truncate">{report.reason}</td>
                  <td>{report.status}</td>
                  <td className="text-sm">{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={report.status}
                      onChange={(e) => handleReportStatus(report.id, e.target.value)}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      <option value="NEW">New</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payouts Tab */}
      {activeTab === "payouts" && (
        <div>
          <div className="mb-4 flex gap-4 items-center">
            <label>Filter by status:</label>
            <select
              value={payoutStatus}
              onChange={(e) => {
                setPayoutStatus(e.target.value);
                setTimeout(() => loadData(), 100);
              }}
              className="px-3 py-2 border rounded"
            >
              <option value="">All</option>
              <option value="REQUESTED">Requested</option>
              <option value="PROCESSING">Processing</option>
              <option value="PAID">Paid</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Creator</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Method</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Created</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout: any) => (
                  <tr key={payout.id} className="border-b">
                    <td className="py-3">
                      <div>
                        <p className="font-semibold">{payout.creator?.displayName || payout.creator?.username}</p>
                        <p className="text-sm text-gray-600">{payout.creator?.email}</p>
                      </div>
                    </td>
                    <td>${Number(payout.amount).toFixed(2)}</td>
                    <td>{payout.payoutMethod}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          payout.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : payout.status === "PROCESSING"
                            ? "bg-yellow-100 text-yellow-800"
                            : payout.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {payout.status}
                      </span>
                    </td>
                    <td className="text-sm">{new Date(payout.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        {payout.status === "REQUESTED" && (
                          <>
                            <button
                              onClick={() => handlePayoutAction(payout.id, "processing")}
                              className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                            >
                              Processing
                            </button>
                            <button
                              onClick={() => {
                                const txHash = prompt("Transaction hash (optional):");
                                handlePayoutAction(payout.id, "paid", txHash || undefined);
                              }}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => handlePayoutAction(payout.id, "rejected")}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {payout.status === "PROCESSING" && (
                          <>
                            <button
                              onClick={() => {
                                const txHash = prompt("Transaction hash (optional):");
                                handlePayoutAction(payout.id, "paid", txHash || undefined);
                              }}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => handlePayoutAction(payout.id, "rejected")}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payouts.length === 0 && (
              <div className="text-center py-8 text-gray-600">No payouts found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

