'use client';

// Re-exporting the component directly or wrapping it
// Since AdminDashboard is a client component, we can use it here.
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
        </div>
        <AdminDashboard />
      </div>
    </div>
  );
}
