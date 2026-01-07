import { MainLayout } from '@/components/layout/main-layout';

export default function JuridicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
