import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Erişim Yok</h1>
      <p className="text-gray-500 mb-6">Bu sayfaya erişim yetkiniz bulunmuyor.</p>
      <Link href="/admin" className="text-amber-600 hover:underline">Ana panele dön</Link>
    </div>
  );
}
