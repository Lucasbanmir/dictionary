import { AppLayout } from '@/shared/layouts/AppLayout';
import { ProtectedRoute } from '@/shared/ProtectedRoute';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}
