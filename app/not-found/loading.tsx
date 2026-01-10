// app/not-found/loading.tsx (optional)
export default function NotFoundLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-32 h-32 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full mx-auto mb-8 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded-lg w-48 mx-auto animate-pulse"></div>
      </div>
    </div>
  );
}