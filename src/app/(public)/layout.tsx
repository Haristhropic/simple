import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageViewTracker } from "@/components/public/page-view-tracker";

export const dynamic = "force-dynamic";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <PageViewTracker />
      <Header />
      <div className="mx-auto w-full max-w-[1400px] px-6 lg:px-10">
        <Breadcrumbs />
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
