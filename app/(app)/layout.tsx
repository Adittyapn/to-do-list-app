export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <main className='container mx-auto p-4 md:p-8'>{children}</main>;
}
