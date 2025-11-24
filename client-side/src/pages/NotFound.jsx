export default function NotFound() {
  return (
    <div className="bg-gray-100 dark:bg-[#0d1a26] min-h-screen flex items-center justify-center p-4 font-inter">
      <div className="text-center bg-white dark:bg-[#0f1724] dark:text-gray-200 rounded-lg shadow-xl p-8 max-w-md w-full dark:border dark:border-[#1e293b]">
        {/* Illustration */}
        <div className="mb-6 flex justify-center items-center relative w-40 h-40 mx-auto">
          {/* Background circle */}
          <div className="absolute w-full h-full rounded-full bg-gray-200 dark:bg-[#1e293b] opacity-50"></div>

          {/* Number 404 */}
          <span className="absolute top-0 left-0 text-orange-500 text-4xl font-extrabold rotate-12 z-10">
            4
          </span>
          <span className="absolute top-4 right-4 text-orange-500 text-4xl font-extrabold -rotate-12 z-10">
            4
          </span>

          {/* Question mark as 0 */}
          <span className="absolute text-orange-600 text-8xl font-extrabold leading-none z-20">
            ?
          </span>

          {/* Dashed border (static) */}
          <div className="absolute w-full h-full rounded-full border-4 border-dashed border-orange-300 dark:border-orange-500"></div>

          {/* Dots */}
          <div className="absolute w-2 h-2 rounded-full bg-orange-400 -top-2 left-1/4"></div>
          <div className="absolute w-2 h-2 rounded-full bg-orange-400 top-1/4 -right-2"></div>
          <div className="absolute w-2 h-2 rounded-full bg-orange-400 -bottom-2 right-1/4"></div>
          <div className="absolute w-2 h-2 rounded-full bg-orange-400 bottom-1/4 -left-2"></div>
        </div>

        {/* Text */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Oops! Dish Not Found.
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          It seems this page got lost in the kitchen. Let's get you back to the
          menu!
        </p>

        {/* Button */}
        <button
          onClick={() => (window.location.href = "/")}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg transition duration-300"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
