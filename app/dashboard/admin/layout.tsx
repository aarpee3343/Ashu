export default function AdminLayout({ children }: any) {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-900 text-white p-4">
        <a href="/dashboard/admin">Dashboard</a>
        <a href="/dashboard/admin/specialists">Specialists</a>
        <a href="/dashboard/admin/bookings">Bookings</a>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
