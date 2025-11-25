import { useNavigate } from "react-router";
import showInputToast from "../utils/showInputToast";
import userAPI from "../apis/user.api";

export default function EmailVerification() {
  const navigator = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white px-6 font-poppins 
                    dark:bg-gradient-to-br dark:from-[#071018] dark:to-[#071426]">
      
      <div className="bg-white rounded-2xl shadow-lg text-center p-10 max-w-md w-full animate-[popIn_0.5s_ease-out]
                      dark:bg-[#071826] dark:border dark:border-[rgba(255,255,255,0.05)] dark:shadow-[0_10px_30px_rgba(2,6,23,0.6)]">
        
        {/* icon */}
        <div className="text-orange-500 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-20 h-20 mx-auto"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        </div>

        {/* title */}
        <h1 className="font-montserrat font-semibold text-2xl text-gray-800 mb-4 dark:text-gray-100">
          Check your inbox to verify your account.
        </h1>

        {/* text */}
        <p className="text-gray-600 text-base leading-relaxed mb-8 dark:text-gray-300">
          We’ve sent a verification link to your registered email address. Please click the link to complete your registration.
        </p>

        {/* buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={()=>{
            showInputToast(async (email) => {
              console.log(email);
              userAPI.post('/resend-verification', {email}).then(() => {
                console.log('resend request is sent');
              }).catch((err) => {
                console.log(err);
              })
            })
          }}
            className="border-2 border-orange-500 text-orange-500 font-semibold py-3 rounded-lg 
                       hover:bg-orange-50 hover:border-orange-600 hover:text-orange-600 transition-all duration-300
                       dark:border-orange-400 dark:text-orange-400 dark:hover:bg-[#0b1e2b] dark:hover:border-orange-300"
          >
            Resend Email
          </button>

          <button
            onClick={() => navigator("/login")}
            className="bg-orange-500 text-white font-semibold py-3 rounded-lg shadow-md 
                       hover:bg-orange-600 hover:shadow-lg transition-all duration-300"
          >
            I’ve Verified My Email
          </button>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
