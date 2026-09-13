import React, { useEffect, useState } from 'react';
import { Users, Shield, Trash2, CheckCircle2, UserCheck, ShieldAlert } from 'lucide-react';
import api from '../../../services/api.js';
import { User, UserRole } from '../../../types/index.js';
import { useToast } from '../../../components/common/Toast.js';
import { useAuth } from '../../../context/AuthContext.js';

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, confirmModal } = useToast();
  const { user: currentUser } = useAuth();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole, userName: string) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        toast.success('Role Updated', `${userName}'s role updated to ${newRole}.`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId || u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err: any) {
      toast.error('Failed', err.response?.data?.message || 'Could not update role.');
    }
  };

  const handleDeleteUser = (u: User) => {
    const targetId = u.id || u._id;
    if (targetId === currentUser?.id || targetId === currentUser?._id) {
      toast.warning('Action Blocked', 'You cannot delete your own active administrator account.');
      return;
    }

    confirmModal({
      title: 'Delete User Account?',
      message: `Are you sure you want to delete ${u.name} (${u.email})? This action cannot be undone.`,
      confirmText: 'Delete User',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await api.delete(`/admin/users/${targetId}`);
          if (res.data.success) {
            toast.success('Deleted', 'User account removed from database.');
            setUsers((prev) => prev.filter((userItem) => (userItem.id || userItem._id) !== targetId));
          }
        } catch (err: any) {
          toast.error('Failed', err.response?.data?.message || 'Could not delete user.');
        }
      },
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Access Control
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Manage Platform Users
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit user accounts, update RBAC authorization levels, or delete accounts.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs">No users registered yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Credits</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const userId = u.id || u._id || '';
                return (
                  <tr key={userId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.photoUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=7C3AED&color=fff`
                          }
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover bg-slate-100"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(userId, e.target.value as UserRole, u.name)}
                        className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold capitalize focus:outline-hidden focus:border-purple-500 cursor-pointer"
                      >
                        <option value="supporter">Supporter</option>
                        <option value="creator">Creator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-700">{u.credits} credits</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
