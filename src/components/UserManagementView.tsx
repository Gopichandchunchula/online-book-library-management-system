import React, { useState, useEffect } from "react";
import { 
  Search, 
  UserPlus, 
  Edit2, 
  Trash2, 
  X, 
  RefreshCw, 
  CheckCircle, 
  ShieldAlert, 
  Mail, 
  Phone, 
  BookOpen, 
  Clock, 
  Activity, 
  Briefcase 
} from "lucide-react";
import { apiService } from "../lib/api";
import { UserProfile, UserRole } from "../types";

export const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"ADD" | "EDIT">("ADD");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formDepartment, setFormDepartment] = useState("");
  const [formRole, setFormRole] = useState<UserRole>("STUDENT");

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Selected User Activity Preview Drawer
  const [previewUser, setPreviewUser] = useState<any | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to load database users list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddDialog = () => {
    setDialogMode("ADD");
    setSelectedUser(null);
    setFormName("");
    setFormUsername("");
    setFormEmail("");
    setFormPassword("Password123");
    setFormPhone("");
    setFormDepartment("");
    setFormRole("STUDENT");
    setFormError(null);
    setFormSuccess(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (user: any) => {
    setDialogMode("EDIT");
    setSelectedUser(user);
    setFormName(user.name);
    setFormUsername(user.username);
    setFormEmail(user.email);
    setFormPassword(user.password || "");
    setFormPhone(user.profile?.phone || "");
    setFormDepartment(user.profile?.department || "");
    setFormRole(user.role);
    setFormError(null);
    setFormSuccess(null);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    const payload = {
      name: formName,
      username: formUsername,
      email: formEmail,
      password: formPassword,
      phone: formPhone,
      department: formDepartment,
      role: formRole
    };

    try {
      if (dialogMode === "ADD") {
        await apiService.addUser(payload);
        setFormSuccess("New member registered successfully in library directory!");
      } else {
        await apiService.updateUser(selectedUser.id, payload);
        setFormSuccess("Member records updated successfully!");
      }

      await fetchUsers();
      setTimeout(() => {
        setIsDialogOpen(false);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setFormError(err?.response?.data?.error || "Failed to process user credentials transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (!window.confirm(`Are you absolutely sure you want to purge and deactivate ${user.name}'s library account?`)) {
      return;
    }

    try {
      await apiService.deleteUser(user.id);
      await fetchUsers();
      if (previewUser?.id === user.id) {
        setPreviewUser(null);
      }
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to deactivate target user.");
    }
  };

  // Unique departments for filter list
  const departmentsList = Array.from(
    new Set(users.map(u => u.profile?.department || "").filter(Boolean))
  );

  // Computed display listings
  const filteredUsers = users.filter(user => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      user.name.toLowerCase().includes(term) ||
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      (user.profile?.member_id && user.profile.member_id.toLowerCase().includes(term));

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    const matchesDept = departmentFilter === "ALL" || user.profile?.department === departmentFilter;

    return matchesSearch && matchesRole && matchesDept;
  });

  const currentRole = localStorage.getItem("libramanage_role") as UserRole;

  if (currentRole !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Access Denied</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md">
          You do not have the required administrative permissions to view the registered users ledger or login activity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="user-management-panel">
      
      {/* Header and Counters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            🛡️ Administrative User Control Directory
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Securely register students, manage librarian permissions, alter department affiliations, and view checkout activity.
          </p>
        </div>

        <button
          onClick={handleOpenAddDialog}
          className="bg-indigo-650 hover:bg-slate-900 border border-indigo-700 hover:border-slate-850 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" /> Add Library Register
        </button>
      </div>

      {/* Directory Search Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        
        <div className="md:col-span-2 relative">
          <input 
            type="text" 
            placeholder="Search by full name, member identifier, username, or contact email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-800 text-xs py-2.5 pl-10 pr-4 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/50 text-slate-700 text-xs py-2.5 px-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-semibold"
          >
            <option value="ALL">All Roles (Student, Librarian, Admin)</option>
            <option value="STUDENT">👨‍🎓 Student Members Only</option>
            <option value="LIBRARIAN">👩‍💼 Librarians & Staff</option>
            <option value="ADMIN">🛡️ Executives & Admins</option>
          </select>
        </div>

        <div>
          <select 
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/50 text-slate-700 text-xs py-2.5 px-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-semibold"
          >
            <option value="ALL">All Departments</option>
            {departmentsList.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Database Listing Grid / Table */}
      {loading ? (
        <div className="bg-white p-16 rounded-2xl text-center border border-slate-200 shadow-xs flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-650" />
          <span className="text-slate-500 text-xs font-semibold">Synchronizing library membership roster database indexes...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-150 p-6 rounded-2xl text-rose-700 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold">Database Fetch Exception</p>
            <p className="opacity-90 mt-1">{error}</p>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl text-center border border-slate-200 shadow-xs text-slate-450 text-xs">
          No directory members matches your filtered credentials tags in database records.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-150">
                  <th className="p-4 pl-6">Directory Profile</th>
                  <th className="p-4">Membership ID</th>
                  <th className="p-4">Authority Role</th>
                  <th className="p-4">Dept / Contact</th>
                  <th className="p-4">Security Code</th>
                  <th className="p-4 text-right pr-6">Operator controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-900 text-white rounded-lg flex items-center justify-center font-bold text-xs select-none">
                          {user.profile?.avatar_seed || "??"}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 leading-tight">{user.name}</h4>
                          <p className="text-[10px] text-slate-450 mt-0.5">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-[11px] text-slate-600">
                      {user.profile?.member_id || "N/A"}
                    </td>
                    <td className="p-4">
                      {user.role === "ADMIN" ? (
                        <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Executive Admin
                        </span>
                      ) : user.role === "LIBRARIAN" ? (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Librarian / Staff
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Student Circle
                        </span>
                      )}
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-650 text-[11px]">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span>{user.profile?.department || "Unassigned"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-450 text-[10px]">
                        <Mail className="w-3 h-3 text-slate-350" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-slate-400 hover:text-slate-700 select-all transition-colors" title="Plain text password inside mock environment">
                      🔑 {user.password || "Password123"}
                    </td>
                    <td className="p-4 text-right pr-6 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setPreviewUser(user)}
                          className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-650 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Details Logs
                        </button>
                        <button
                          onClick={() => handleOpenEditDialog(user)}
                          className="bg-white hover:bg-slate-100 border border-slate-200 text-indigo-650 font-bold text-[10px] p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Edit member records"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="bg-white hover:bg-rose-50 border border-slate-200 hover:border-red-200 text-red-600 font-bold text-[10px] p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Purge de-register membership"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-between text-[11px] text-slate-500 font-medium">
            <span>Showing {filteredUsers.length} active database records profile listings</span>
            <span>Isolation layer: Mock DB session storage</span>
          </div>
        </div>
      )}

      {/* Side activity monitor drawer panel */}
      {previewUser && (
        <div className="bg-slate-800 text-white rounded-2xl p-6 border border-slate-700 shadow-lg space-y-4">
          <div className="flex justify-between items-start border-b border-slate-700 pb-3">
            <div>
              <h4 className="font-extrabold text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" /> Operational Metrics Monitor
              </h4>
              <p className="text-[10px] text-slate-400 mt-1">Detailed history profile metrics context for: <strong>{previewUser.name}</strong> (@{previewUser.username})</p>
            </div>
            <button 
              onClick={() => setPreviewUser(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-705 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700">
              <span className="text-[9px] text-slate-450 uppercase block font-bold leading-none mb-1">Registration stamp</span>
              <span>{previewUser.profile?.join_date || previewUser.profile?.join_date || "May 10, 2026"}</span>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700">
              <span className="text-[9px] text-slate-450 uppercase block font-bold leading-none mb-1">Contact Phone</span>
              <span className="font-mono">{previewUser.profile?.phone || "No phone added"}</span>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700">
              <span className="text-[9px] text-slate-450 uppercase block font-bold leading-none mb-1">Account reference key</span>
              <span className="font-mono text-[10px] text-indigo-300">{previewUser.id}</span>
            </div>
          </div>
        </div>
      )}

      {/* Form Dialog modal Overlay */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
            
            {/* Dialog Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm">
                  {dialogMode === "ADD" ? "Create New Member Profile" : "Modify Member Directory Record"}
                </h3>
                <p className="text-[10px] text-indigo-350 mt-1">Provide credentials parameters for library permissions catalogs</p>
              </div>
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-805 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dialog Form Form body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              
              {formError && (
                <div className="bg-rose-50 border border-rose-150 p-3.5 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span className="font-semibold leading-normal">{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="bg-emerald-50 border border-emerald-150 p-3.5 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span className="font-bold leading-normal">{formSuccess}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Gopichand NHCL"
                  className="w-full border border-slate-200 hover:border-slate-350 p-2.5 text-xs rounded-lg outline-none focus:border-indigo-500 text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Directory Username</label>
                  <input 
                    type="text" 
                    required
                    disabled={dialogMode === "EDIT"}
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="e.g. gopichand"
                    className="w-full border border-slate-200 hover:border-slate-350 p-2.5 text-xs rounded-lg outline-none focus:border-indigo-500 text-slate-800 font-medium disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase font-mono">Password Secure Token</label>
                  <input 
                    type="text" 
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Set authentication secret"
                    className="w-full border border-slate-200 hover:border-slate-350 p-2.5 text-xs rounded-lg outline-none focus:border-indigo-500 text-slate-800 font-mono"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Primary Contact Email</label>
                  <input 
                    type="email" 
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="gopichand@nhclindia.com"
                    className="w-full border border-slate-200 hover:border-slate-350 p-2.5 text-xs rounded-lg outline-none focus:border-indigo-500 text-slate-800 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Telephone Phone</label>
                  <input 
                    type="text" 
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 XXXX XXXX"
                    className="w-full border border-slate-200 hover:border-slate-350 p-2.5 text-xs rounded-lg outline-none focus:border-indigo-500 text-slate-800 font-medium"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Assigned System Role</label>
                  <select 
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full border border-slate-200 hover:border-slate-350 p-2.5 text-xs font-semibold rounded-lg outline-none focus:border-indigo-500 text-slate-800"
                  >
                    <option value="STUDENT">👨‍🎓 STUDENT MEMBER</option>
                    <option value="LIBRARIAN">👩‍💼 LIBRARIAN / STAFF</option>
                    <option value="ADMIN">🛡️ SYSTEM ADMIN</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase font-mono">Academic Department</label>
                  <input 
                    type="text" 
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full border border-slate-200 hover:border-slate-350 p-2.5 text-xs rounded-lg outline-none focus:border-indigo-500 text-slate-800 font-medium"
                  />
                </div>

              </div>

              {/* Action operations buttons */}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Discard Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-650 hover:bg-slate-900 border border-indigo-700 hover:border-slate-850 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-80"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Authorizing...
                    </>
                  ) : (
                    "Authorize Save"
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
