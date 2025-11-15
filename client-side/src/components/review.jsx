import { Star } from "lucide-react"

const review = ({reviewObj}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div  className="flex items-center gap-4 mb-3">
            <img src="" alt="" className="h-10 w-10 rounded-full"/>
                                        <div>
                                <h4 className="font-bold text-gray-800">Mike D.</h4>
                                <div className="flex text-yellow-400">
                                    {[...Array(reviewObj.rating)].map((_, index) => (
                                        <Star key={index} className="h-4 w-4"/>
                                    ))}
                                </div>
                            </div>
        </div>
        <p>{`"${reviewObj.comment}".`}</p>
    </div>
  )
}

export default review