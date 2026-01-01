'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { translations } from '@/lib/i18n';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Question } from '@/types';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  FiUsers,
  FiShield,
  FiUserCheck,
  FiBookOpen,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiMail,
  FiCalendar,
  FiUser,
  FiLoader,
  FiAlertCircle,
  FiFilter,
  FiSearch,
  FiChevronDown,
  FiEye,
  FiX,
  FiBarChart,
  FiFileText,
} from 'react-icons/fi';
import { 
  MdAdminPanelSettings,
  MdSchool,
  MdPerson,
} from 'react-icons/md';


const MySwal = withReactContent(Swal);

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface Quiz {
  id: string;
  slug: string;
  title: string;
  displayName: string;
  thumbnail: string;
  creatorName: string;
  questions: Question[];
  linkToken: string;
  createdAt: string;
  updatedAt: string;
  timeLimit: number;
  submissionsCount: number;
  averageScore: number;
}

export default function UsersPage() {
  const { user } = useAuthStore();
  const { language } = useUIStore();
  const router = useRouter();
  const t = translations[language];

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'createdAt',
    direction: 'desc'
  });

  // Teacher quizzes modal state
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [teacherQuizzes, setTeacherQuizzes] = useState<Quiz[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [showQuizzesModal, setShowQuizzesModal] = useState(false);
  const [selectedQuizForQuestions, setSelectedQuizForQuestions] = useState<Quiz | null>(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);

  const showSuccessAlert = (title: string, text?: string) => {
    MySwal.fire({
      icon: 'success',
      title,
      text,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: '#10b981',
      color: 'white',
      iconColor: 'white'
    });
  };

  const showErrorAlert = (title: string, text?: string) => {
    MySwal.fire({
      icon: 'error',
      title,
      text,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      background: '#ef4444',
      color: 'white',
      iconColor: 'white'
    });
  };

  const showConfirmAlert = (title: string, text: string): Promise<boolean> => {
    return MySwal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t.common.yes,
      cancelButtonText: t.common.cancel,
      background: '#1f2937',
      color: 'white',
      reverseButtons: true
    }).then((result) => result.isConfirmed);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error || t.admin.failedToLoadUsers);
        showErrorAlert(t.admin.error, data.error || t.admin.failedToLoadUsers);
      }
    } catch {
      setError(t.admin.failedToLoadUsers);
      showErrorAlert(t.admin.error, t.admin.failedToLoadUsers);
    } finally {
      setLoading(false);
    }
  }, [t.admin.failedToLoadUsers, t.admin.error]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchUsers();
  }, [user, router, fetchUsers]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setActionLoading(`role-${userId}`);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'changeRole',
          newRole,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUsers(users.map(u =>
          u.id === userId ? { ...u, role: newRole } : u
        ));
        showSuccessAlert(t.admin.success, t.admin.roleUpdated);
      } else {
        showErrorAlert(t.admin.error, data.error || t.admin.failedToUpdateRole);
      }
    } catch {
      showErrorAlert(t.admin.error, t.admin.failedToUpdateRole);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmed = await showConfirmAlert(
      t.admin.confirmDeleteTitle,
      t.admin.confirmDelete
    );
    
    if (!confirmed) return;

    try {
      setActionLoading(`delete-${userId}`);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setUsers(users.filter(u => u.id !== userId));
        showSuccessAlert(t.admin.success, t.admin.userDeleted);
      } else {
        showErrorAlert(t.admin.error, data.error || t.admin.failedToDeleteUser);
      }
    } catch {
      showErrorAlert(t.admin.error, t.admin.failedToDeleteUser);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (userId: string) => {
    const confirmed = await showConfirmAlert(
      t.admin.confirmResetPasswordTitle,
      t.admin.confirmResetPassword
    );
    
    if (!confirmed) return;

    try {
      setActionLoading(`reset-${userId}`);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'resetPassword',
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccessAlert(t.admin.success, t.admin.passwordReset);
      } else {
        showErrorAlert(t.admin.error, data.error || t.admin.failedToResetPassword);
      }
    } catch {
      showErrorAlert(t.admin.error, t.admin.failedToResetPassword);
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleStats = () => {
    const stats = {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      teachers: users.filter(u => u.role === 'teacher').length,
      students: users.filter(u => u.role === 'student').length,
    };
    return stats;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <MdAdminPanelSettings className="w-3 h-3 text-red-500" />;
      case 'teacher':
        return <MdSchool className="w-3 h-3 text-blue-500" />;
      case 'student':
        return <MdPerson className="w-3 h-3 text-green-500" />;
      default:
        return <FiUser className="w-3 h-3 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'teacher':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'student':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const handleViewTeacherQuizzes = async (teacher: User) => {
    setSelectedTeacher(teacher);
    setQuizzesLoading(true);
    setShowQuizzesModal(true);

    try {
      const response = await fetch(`/api/quiz/user/${teacher.id}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        setTeacherQuizzes(data.quizzes);
      } else {
        showErrorAlert(t.admin.error, data.error || 'Failed to load quizzes');
        setShowQuizzesModal(false);
      }
    } catch (error) {
      console.error(error);
      showErrorAlert(t.admin.error, 'Failed to load quizzes');
      setShowQuizzesModal(false);
    } finally {
      setQuizzesLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string, teacherId: string) => {
    const confirmed = await showConfirmAlert(
      t.admin.deleteQuiz,
      t.admin.deleteQuizConfirm
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/quiz/user/${teacherId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ quizId }),
      });

      const data = await response.json();

      if (data.success) {
        setTeacherQuizzes(teacherQuizzes.filter(q => q.id !== quizId));
        showSuccessAlert(t.admin.success, t.admin.quizDeleted);
      } else {
        showErrorAlert(t.admin.error, data.error || 'Failed to delete quiz');
      }
    } catch (error) {
      console.error(error);
      showErrorAlert(t.admin.error, 'Failed to delete quiz');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof User];
    const bValue = b[sortConfig.key as keyof User];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  if (!user || user.role !== 'admin') {
    return null;
  }

  const stats = getRoleStats();

  const SortableHeader = ({ children, sortKey }: { children: React.ReactNode; sortKey: string }) => (
    <th 
      className="text-left py-3 px-4 font-medium text-foreground/70 hover:text-foreground cursor-pointer transition-colors group text-sm"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1.5">
        {children}
        <FiChevronDown className={`w-3 h-3 transition-transform ${
          sortConfig.key === sortKey && sortConfig.direction === 'desc' ? 'rotate-180' : ''
        } opacity-0 group-hover:opacity-100 ${sortConfig.key === sortKey ? 'opacity-100' : ''}`} />
      </div>
    </th>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-linear-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 backdrop-blur-sm">
            <FiUsers className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {t.admin.userManagement}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t.admin.manageAllUsers}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchUsers}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            {t.admin.refresh}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            key: 'total', 
            label: t.admin.totalUsers, 
            value: stats.total, 
            icon: FiUsers, 
            color: 'primary',
            gradient: 'from-primary/20 to-primary/10'
          },
          { 
            key: 'admins', 
            label: t.admin.admins, 
            value: stats.admins, 
            icon: FiShield, 
            color: 'red',
            gradient: 'from-red-500/20 to-red-500/10'
          },
          { 
            key: 'teachers', 
            label: t.admin.teachers, 
            value: stats.teachers, 
            icon: FiUserCheck, 
            color: 'blue',
            gradient: 'from-blue-500/20 to-blue-500/10'
          },
          { 
            key: 'students', 
            label: t.admin.students, 
            value: stats.students, 
            icon: FiBookOpen, 
            color: 'green',
            gradient: 'from-green-500/20 to-green-500/10'
          }
        ].map((stat) => (
          <Card key={stat.key} className="p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <h3 className={`text-2xl font-bold mt-1 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                  {stat.value}
                </h3>
                <div className="mt-2">
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-${stat.color}-500 rounded-full transition-all duration-700`}
                      style={{ width: `${(stat.value / stats.total) * 100 || 0}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className={`p-2.5 rounded-lg bg-linear-to-br ${stat.gradient}`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t.admin.searchUsers}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-border dark:border-gray-800 rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRole('all')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 text-xs ${
                selectedRole === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-card hover:bg-card-hover text-foreground border border-border'
              }`}
            >
              <FiUsers className="w-3.5 h-3.5" />
              {t.admin.all}
            </button>
            <button
              onClick={() => setSelectedRole('admin')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 text-xs ${
                selectedRole === 'admin'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-card hover:bg-card-hover text-foreground border border-border'
              }`}
            >
              <FiShield className="w-3.5 h-3.5" />
              {t.admin.admins}
            </button>
            <button
              onClick={() => setSelectedRole('teacher')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 text-xs ${
                selectedRole === 'teacher'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-card hover:bg-card-hover text-foreground border border-border'
              }`}
            >
              <FiUserCheck className="w-3.5 h-3.5" />
              {t.admin.teachers}
            </button>
            <button
              onClick={() => setSelectedRole('student')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 text-xs ${
                selectedRole === 'student'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'bg-card hover:bg-card-hover text-foreground border border-border'
              }`}
            >
              <FiBookOpen className="w-3.5 h-3.5" />
              {t.admin.students}
            </button>
          </div>
        </div>
      </Card>

      {/* Users Table Card */}
      <Card className="p-0 overflow-hidden border border-border/50 dark:border-gray-800 shadow-sm max-w-full">
        <div className="p-4 border-b border-border/50 dark:border-gray-800 bg-card/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {t.admin.userList}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {sortedUsers.length} {t.admin.usersFound} • {stats.total} {t.admin.totalUsers.toLowerCase()}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FiFilter className="w-3.5 h-3.5" />
              <span>{t.admin.sortedBy}: {sortConfig.key} ({sortConfig.direction})</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-12 h-12 border-3 border-primary/10 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{t.admin.loadingUsers}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="p-3 rounded-full bg-red-500/10">
              <FiAlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
            <Button onClick={fetchUsers} className="mt-4" variant="outline" size="sm">
              <FiRefreshCw className="w-3.5 h-3.5 mr-1.5" />
              {t.admin.retry}
            </Button>
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-3 rounded-full bg-muted/50">
              <FiUsers className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{t.admin.noUsers}</p>
            {(searchTerm || selectedRole !== 'all') && (
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRole('all');
                }}
                variant="ghost" 
                size="sm"
                className="mt-3"
              >
                {t.admin.clearFilters}
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-250">
              <thead>
                <tr className="bg-muted/30 dark:bg-gray-800/30 text-xs">
                  <th className="py-3 px-4 font-medium text-foreground/70 text-left w-8">#</th>
                  <SortableHeader sortKey="name">
                    <div className="flex items-center gap-1.5">
                      <FiUser className="w-3.5 h-3.5" />
                      <span>{t.admin.userName}</span>
                    </div>
                  </SortableHeader>
                  <SortableHeader sortKey="email">
                    <div className="flex items-center gap-1.5">
                      <FiMail className="w-3.5 h-3.5" />
                      <span>{t.admin.userEmail}</span>
                    </div>
                  </SortableHeader>
                  <SortableHeader sortKey="role">
                    <div className="flex items-center gap-1.5">
                      <FiShield className="w-3.5 h-3.5" />
                      <span>{t.admin.userRole}</span>
                    </div>
                  </SortableHeader>
                  <SortableHeader sortKey="createdAt">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <FiCalendar className="w-3.5 h-3.5" />
                      <span>{t.admin.registrationDate}</span>
                    </div>
                  </SortableHeader>
                  <th className="py-3 px-4 font-medium text-foreground/70 text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <FiEdit2 className="w-3.5 h-3.5" />
                      <span>{t.dashboard.actions}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 dark:divide-gray-800">
                {sortedUsers.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-card-hover/50 transition-colors duration-150 group"
                  >
                    <td className="py-3 px-4 text-sm text-muted-foreground">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-primary">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-37.5">
                          <div className="text-sm font-medium text-foreground truncate">
                            {user.name}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono truncate">
                            {user.id.slice(0, 6)}...{user.id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 min-w-50">
                      <div className="flex items-center gap-2">
                        <FiMail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground truncate">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 min-w-37.5">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                            {user.role.toUpperCase()}
                          </div>
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            disabled={actionLoading === `role-${user.id}`}
                            className="text-xs p-1.5 border border-border dark:border-gray-700 rounded-lg bg-card hover:bg-card-hover focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all duration-200 w-24"
                          >
                            <option value="admin">{t.admin.admin}</option>
                            <option value="teacher">{t.admin.teacher}</option>
                            <option value="student">{t.admin.student}</option>
                          </select>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 min-w-35">
                      <div className="flex items-center gap-1.5 text-sm text-foreground">
                        <FiCalendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs">
                          {new Date(user.createdAt).toLocaleDateString(
                            language === 'ar' ? 'ar-EG' : 'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1 flex-nowrap">
                        {user.role === 'teacher' && (
                          <Button
                            onClick={() => handleViewTeacherQuizzes(user)}
                            variant="ghost"
                            size="xs"
                            className="h-7 w-7 p-0 bg-purple-500/10 text-purple-600 dark:hover:text-purple-400"
                          >
                            <FiEye className="w-3 h-3" />
                            
                          </Button>
                        )}
                        <Button
                          onClick={() => handleResetPassword(user.id)}
                          disabled={actionLoading === `reset-${user.id}`}
                          variant="ghost"
                          size="xs"
                          className="h-7 w-7 p-0 bg-blue-500/10 text-blue-600 dark:hover:text-blue-400"
                        >
                          {actionLoading === `reset-${user.id}` ? (
                            <FiLoader className="w-3 h-3 animate-spin" />
                          ) : (
                            <FiRefreshCw className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={actionLoading === `delete-${user.id}`}
                          variant="ghost"
                          size="xs"
                          className="h-7 w-7 p-0 bg-red-500/10 text-red-600 dark:hover:text-red-400"
                        >
                          {actionLoading === `delete-${user.id}` ? (
                            <FiLoader className="w-3 h-3 animate-spin" />
                          ) : (
                            <FiTrash2 className="w-3 h-3" />
                          )}
                        </Button>
                        

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && !error && sortedUsers.length > 0 && (
          <div className="p-3 border-t border-border/50 dark:border-gray-800 bg-card/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <FiUsers className="w-3.5 h-3.5" />
                <span>
                  {sortedUsers.length} {t.admin.usersDisplayed} • {t.admin.totalUsers}: {stats.total}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>{t.admin.students}: {stats.students}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>{t.admin.teachers}: {stats.teachers}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>{t.admin.admins}: {stats.admins}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Teacher Quizzes Modal */}
      {showQuizzesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-3xl shadow-2xl border border-border/50 w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <div>
                <h3 className="text-2xl font-bold bg-linear-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  {selectedTeacher?.name}&apos;s Quizzes
                </h3>
                <p className="text-lg text-foreground/80 mt-1">
                  {selectedTeacher?.email} • {teacherQuizzes.length} quizzes
                </p>
              </div>
              <button
                onClick={() => {
                  setShowQuizzesModal(false);
                  setSelectedTeacher(null);
                  setTeacherQuizzes([]);
                }}
                className="p-3 rounded-full hover:bg-muted/50 transition-colors"
              >
                <FiX className="w-6 h-6 text-foreground/70 hover:text-foreground" />
              </button>
            </div>

            <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              {quizzesLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="w-12 h-12 border-3 border-primary/10 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{t.admin.loadingUsers}</p>
                </div>
              ) : teacherQuizzes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 rounded-full bg-muted/50">
                    <FiFileText className="w-12 h-12 text-muted-foreground" />
                  </div>
                <h4 className="text-lg font-semibold mt-4">{t.admin.noQuizzesFound}</h4>
                  <p className="text-muted-foreground text-center mt-2">
                    {t.admin.teacherNoQuizzes}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {teacherQuizzes.map((quiz) => (
                    <Card key={quiz.id} className="p-6 hover:shadow-lg transition-all duration-300 border border-border/50">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1">
                          <div className="shrink-0 w-16 h-16 bg-linear-to-br from-primary/20 to-primary-dark/20 rounded-xl flex items-center justify-center shadow-md">
                            <FiFileText className="w-8 h-8 text-primary" />
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <h4 className="text-xl font-semibold">{quiz.title}</h4>
                              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                {quiz.questions.length} questions
                              </span>
                              {quiz.timeLimit && (
                                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                                  {quiz.timeLimit} min
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <FiCalendar className="w-4 h-4" />
                                Created: {new Date(quiz.createdAt).toLocaleDateString()}
                              </div>
                              {quiz.submissionsCount > 0 && (
                                <>
                                  <div className="flex items-center gap-2">
                                    <FiBarChart className="w-4 h-4" />
                                    {quiz.submissionsCount} submissions
                                  </div>
                                  {quiz.averageScore && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-green-600 dark:text-green-400 font-medium">
                                        Avg: {quiz.averageScore}%
                                      </span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => {
                              setSelectedQuizForQuestions(quiz);
                              setShowQuestionsModal(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <FiFileText className="w-4 h-4" />
                            {t.admin.viewQuestions}
                          </Button>
                          <Button
                            onClick={() => window.open(`/quiz/${quiz.slug || quiz.id}`, '_blank')}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <FiEye className="w-4 h-4" />
                            {t.common.view}
                          </Button>
                          <Button
                            onClick={() => router.push(`/quiz/${quiz.slug || quiz.id}/edit`)}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <FiEdit2 className="w-4 h-4" />
                            {t.common.edit}
                          </Button>
                          <Button
                            onClick={() => selectedTeacher && handleDeleteQuiz(quiz.id, selectedTeacher.id)}
                            variant="danger"
                            size="sm"
                            className="gap-2"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            {t.admin.delete}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Questions Modal */}
      {showQuestionsModal && selectedQuizForQuestions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-3xl shadow-2xl border border-border/50 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <div>
                <h3 className="text-2xl font-bold bg-linear-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  {selectedQuizForQuestions.title}
                </h3>
                <p className="text-lg text-foreground/80 mt-1">
                  {t.admin.questionsCount.replace('{count}', selectedQuizForQuestions.questions.length.toString())}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowQuestionsModal(false);
                  setSelectedQuizForQuestions(null);
                }}
                className="p-3 rounded-full hover:bg-muted/50 transition-colors"
              >
                <FiX className="w-6 h-6 text-foreground/70 hover:text-foreground" />
              </button>
            </div>

            <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              <div className="space-y-6">
                {selectedQuizForQuestions.questions.map((question, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-6 border border-border/30">
                    <div className="flex items-start gap-4">
                      <span className="shrink-0 w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-foreground mb-4 text-lg">{question.questionText}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {question.choices.map((choice, choiceIndex) => (
                            <div
                              key={choiceIndex}
                              className={`p-3 rounded-lg border text-sm transition-all ${
                                choiceIndex === question.correctAnswer
                                  ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300 shadow-sm'
                                  : 'bg-card border-border/50 text-foreground/70'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm px-2 py-1 rounded ${
                                  choiceIndex === question.correctAnswer
                                    ? 'bg-green-500 text-white'
                                    : 'bg-muted text-muted-foreground'
                                }`}>
                                  {String.fromCharCode(65 + choiceIndex)}
                                </span>
                                <span className="flex-1">{choice}</span>
                                {choiceIndex === question.correctAnswer && (
                                  <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
