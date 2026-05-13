import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Calendar, MapPin, Tag, Edit, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const raw = localStorage.getItem('admin_user');
    if (!token || !raw) {
      navigate('/admin/login');
      return;
    }
    try {
      setUser(JSON.parse(raw));
    } catch {
      navigate('/admin/login');
    }

    fetchEvents();
  }, [navigate]);

  async function fetchEvents() {
    setLoading(true);
    try {
      console.log('Admin: Fetching all events...');
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Admin Fetch Error:', error);
        throw error;
      }
      
      console.log('Admin Data:', data);
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      published: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      ended: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    const labels = {
      draft: 'Nháp',
      published: 'Đã xuất bản',
      cancelled: 'Đã hủy',
      ended: 'Đã kết thúc',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-card)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] flex items-center justify-center font-bold text-sm">
              TR
            </div>
            <h1 className="text-lg font-semibold">TicketRush Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-muted-foreground)] hidden md:inline">
              {user.first_name || ''} {user.last_name || ''} ({user.email})
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)] transition"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">Quản lý sự kiện</h2>
            <p className="text-[var(--color-muted-foreground)]">
              Danh sách tất cả các sự kiện trong hệ thống
            </p>
          </div>
          <button className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition">
            + Thêm sự kiện mới
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[var(--color-card)] p-4 rounded-xl border border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-muted-foreground)]">Tổng sự kiện</p>
            <p className="text-2xl font-bold">{events.length}</p>
          </div>
          <div className="bg-[var(--color-card)] p-4 rounded-xl border border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-muted-foreground)]">Đang diễn ra</p>
            <p className="text-2xl font-bold text-green-600">
              {events.filter(e => e.status === 'published').length}
            </p>
          </div>
          <div className="bg-[var(--color-card)] p-4 rounded-xl border border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-muted-foreground)]">Bản nháp</p>
            <p className="text-2xl font-bold text-gray-500">
              {events.filter(e => e.status === 'draft').length}
            </p>
          </div>
          <div className="bg-[var(--color-card)] p-4 rounded-xl border border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-muted-foreground)]">Nổi bật</p>
            <p className="text-2xl font-bold text-amber-500">
              {events.filter(e => e.is_featured).length}
            </p>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-primary)]"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--color-muted-foreground)]">Chưa có sự kiện nào được tạo.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/30">
                    <th className="px-6 py-4 text-sm font-semibold">Sự kiện</th>
                    <th className="px-6 py-4 text-sm font-semibold">Thông tin</th>
                    <th className="px-6 py-4 text-sm font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-sm font-semibold">Hiển thị</th>
                    <th className="px-6 py-4 text-sm font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-[var(--color-muted)]/10 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-[var(--color-muted)] overflow-hidden flex-shrink-0">
                            {event.image_url ? (
                              <img src={event.image_url} alt={event.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[var(--color-muted-foreground)]">
                                <Tag className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold line-clamp-1">{event.name}</div>
                            <div className="text-xs text-[var(--color-muted-foreground)]">{event.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(event.date).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(event.status)}
                      </td>
                      <td className="px-6 py-4">
                        {event.is_visible ? (
                          <span className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                            Hiện
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
                            Ẩn
                          </span>
                        )}
                        {event.is_featured && (
                          <span className="mt-1 block text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                            ★ Nổi bật
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-[var(--color-muted)] rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-[var(--color-muted)] rounded-lg text-[var(--color-muted-foreground)] hover:text-red-500 transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
