export const LoadingSpinner = () => {
  return (
      <div className="fixed top-1/2  flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-500"></div>
      </div>
  );
};