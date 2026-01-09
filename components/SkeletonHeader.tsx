export default function SkeletonHeader() {
  return (
    <div className="animate-pulse flex justify-between items-center p-4 bg-white shadow">
      <div className="h-6 w-40 bg-gray-300 rounded"></div>
      <div className="flex gap-4">
        <div className="h-4 w-16 bg-gray-300 rounded"></div>
        <div className="h-4 w-16 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}
