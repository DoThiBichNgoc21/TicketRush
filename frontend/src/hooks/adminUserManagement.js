import { useCallback, useEffect, useState } from "react";
import {
  createUser,
  deleteUser,
  getUsers,
  getUserStats,
  updateUser,
  updateUserStatus,
} from "../api/userManagementApi.js";

export default function useUsers() {
  const [users, setUsers] = useState([]);

  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    activeRate: 0,
    genderStats: { Nam: 0, Nữ: 0, Khác: 0 },
    statusStats: { active: 0, blocked: 0 },
    ageStats: {
      "<18":  { count: 0, percent: 0 },
      "18-24": { count: 0, percent: 0 },
      "25-34": { count: 0, percent: 0 },
      "35-44": { count: 0, percent: 0 },
      "45+":  { count: 0, percent: 0 },
    },
  });

  const [keyword, setKeyword] = useState("");
  const [gender, setGender] = useState("Tất cả");
  const [status, setStatus] = useState("Tất cả");

  const [page, setPage] = useState(1);
  const [limit] = useState(4);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 4,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getUsers({
        keyword,
        gender,
        status,
        page,
        limit,
      });

      setUsers(result.data || []);
      setPagination(
        result.pagination || {
          total: 0,
          page: 1,
          limit,
          totalPages: 1,
        }
      );
    } catch (err) {
      setError(err.message || "Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  }, [keyword, gender, status, page, limit]);

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);

      const result = await getUserStats();

      setStats({
        totalUsers: result.totalUsers || 0,
        newUsers: result.newUsers || 0,
        activeRate: result.activeRate || 0,
        genderStats: result.genderStats || { Nam: 0, Nữ: 0, Khác: 0 },
        statusStats: result.statusStats || { active: 0, blocked: 0 },
        ageStats: result.ageStats || {
          "<18":  { count: 0, percent: 0 },
          "18-24": { count: 0, percent: 0 },
          "25-34": { count: 0, percent: 0 },
          "35-44": { count: 0, percent: 0 },
          "45+":  { count: 0, percent: 0 },
        },
      });
    } catch (err) {
      console.error("Không thể tải thống kê người dùng:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([loadUsers()]);
  }, [loadUsers]);

  const handleSearchChange = (value) => {
    setPage(1);
    setKeyword(value);
  };

  const handleGenderChange = (value) => {
    setPage(1);
    setGender(value);
    // ❌ không set stats, PieChart giữ nguyên
  };

  const handleStatusChange = (value) => {
    setPage(1);
    setStatus(value);
    // ❌ không set stats, PieChart giữ nguyên
  };

  const handleCreateUser = async (payload) => {
    await createUser(payload);
    setPage(1);
    await refresh();
  };

  const handleUpdateUser = async (id, payload) => {
    await updateUser(id, payload);
    await refresh();
  };

  const handleUpdateUserStatus = async (id, nextStatus) => {
    await updateUserStatus(id, nextStatus);
    await refresh();
  };

  const handleDeleteUser = async (id) => {
    await deleteUser(id);

    if (users.length === 1 && page > 1) {
      setPage((prev) => prev - 1);
    } else {
      await refresh();
    }
  };

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadStats();
  }, []);

  return {
    users,
    stats,
    setUsers,
    keyword,
    gender,
    status,
    page,
    limit,
    pagination,
    loading,
    statsLoading,
    error,

    setPage,
    handleSearchChange,
    handleGenderChange,
    handleStatusChange,
    handleCreateUser,
    handleUpdateUser,
    handleUpdateUserStatus,
    handleDeleteUser,
    refresh,
  };
}