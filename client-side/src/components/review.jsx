import { Star , User2} from "lucide-react";

const review = ({ reviewObj }) => {
  return (
    <div className="
      rounded-2xl 
      border border-gray-200 dark:border-[#25313a]
      bg-white dark:bg-[#071820] 
      p-6 
      shadow-sm
      transition-colors
    ">
      <div className="flex items-center gap-4 mb-3">
        
        <User2 className="dark:text-gray-100" />

        <div>
          <h4 className="font-bold text-gray-800 dark:text-gray-100">
            {reviewObj.user.name}
          </h4>

          <div className="flex text-yellow-400">
            {[...Array(reviewObj.rating)].map((_, index) => (
              <Star key={index} className="h-4 w-4 fill-yellow-400 " />
            ))}
          </div>
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300">
        {`"${reviewObj.comment}".`}
      </p>
    </div>
  );
};

export default review;
