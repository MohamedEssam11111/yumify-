import React, { useState } from "react";
import Logo from "../components/logo";
import Button from "../components/Button";
import SmartRestaurant from "../components/SmartRestaurant";
import { Link, useNavigate } from "react-router-dom";
import userAPI from "../apis/user.api";
import toast from "react-hot-toast";

// prettier-ignore
const Login = () => {
  const navigator = useNavigate()
  const[logEmail,setLogEmail]=useState("");
  const[logPassword,setLogPassword]=useState("");
    // const [userRole, setUserRole] = useState('');
  const handleSubmit=(e)=>{
e.preventDefault();
userAPI.post('/login',{
  email:logEmail,
    password:logPassword
}).then((res)=>{
  console.log("Login successful:");
    const { role } = res.data;
    // setUserRole(role);
    if (role === 'owner') {
      navigator('/owner/dashboard'); // Redirect to owner dashboard
    } else {
      navigator('/'); // Redirect to home page for customers
    }
}).catch((err)=>{
  toast.error("Login failed. Please check your credentials.");
  console.error("Login failed:", err);
});
setLogEmail("");
setLogPassword("");

  }
  return (
    <>
      <div className={`login-body flex justify-center items-center min-h-[100vh] dark:bg-[#0b1220]`}>
        <div
          className={`login-container  bg-blur-[10px] rounded-[20px] shadow-[0_10px_30px_rgba(0,_0,_0,_0.1)] flex max-w-[900px] w-[90%] overflow-hidden min-height-[500px] max-md:flex-col min-h-[0] dark:bg-[#0b0f15] dark:shadow-[0_12px_40px_rgba(2,_6,_23,_0.6)]`}
        >

          {/* login card container */}

          <div className="login-form-section  bg-[#FBFCFD] flex-1 p-[40px] flex-col justify-center items-center text-center  max-md:p-[30px] max-md: min-h-[80%] dark:bg-[#0f1724] dark:text-[#e6eef8]">
            <Logo />
            <SmartRestaurant />
            <h1 className="text-[25px] font-[600] m-[25px_5px_15px_5px] dark:text-white">
              Welcome Back!
            </h1>
            <div className=" w-[100%] flex flex-col gap-[5px] justify-center ">

              {/* the form creation */}

              <form  onSubmit={handleSubmit} action="" className="flex flex-col gap-[20px] items-center p-[0px_35px]">

                <input
                className="p-[12px] rounded-[8px] border-[2px] border-[#E0E0E0] w-[100%] dark:bg-[#071018] dark:border-[#25313a] dark:text-[#e6eef8] dark:placeholder-gray-400" type="email" placeholder="Email"
                name="logEmail"
                value={logEmail}
                onChange={(e)=>setLogEmail(e.target.value)}
                autoComplete="off"
                />
                
                <input 
                className="p-[12px] rounded-[8px] border-[2px] border-[#E0E0E0] w-[100%] dark:bg-[#071018] dark:border-[#25313a] dark:text-[#e6eef8] dark:placeholder-gray-400" type="text" placeholder="Password"
                name="logPassword"
                value={logPassword}
                onChange={(e)=>setLogPassword(e.target.value)}
                autoComplete="off"
                />
                <div className="w-full">
                  {/* keep Button as-is; wrap to allow dark-aware container styling if needed */}
                  <Button buttonText={"Login"}/>
                </div>
              </form>

              <div className="mt-4 text-sm text-gray-600 pb-[15px] dark:text-gray-300">
                <Link to={'/forgotPassword'} className="w-auto font-[500] text-[#FF784E] no-underline hover:underline transform hover:text-red-500 transition duration-300 ease dark:text-[#FFB59A]">Forgot password?</Link>
              </div>
              {/* prettier-ignore */} 
              <div className="dark:text-gray-300"><span className="pr-[5px]">Don't have an account?</span><Link to="/register" className="font-[500] text-[#FF784E] no-underline hover:underline transform hover:text-red-500 transition duration-300 ease dark:text-[#FFB59A]">Register</Link></div>
            </div>
          </div>

          {/* img container */}
          {/* prettier-ignore */}
          <div className="rounded-tl-[0px] rounded-tr-[0px] rounded-bl-[0] md:flex-1 overflow-hidden bg-[linear-gradient(135deg,#FF7043_0%,#FFCCBB_100%)] flex justify-center items-center  relative max-md:max-h-[100px] md:max-h-none dark:bg-gradient-to-br dark:from-[#0b1220] dark:to-[#1f2937]">
            <img className="custom-img-animation max-w-[100%] h-[100%] animate-[rightToLeft_0.9s_ease-out_forwards] max-md:hidden" src="/berger.png" alt="" />
            <img className="custom-img-animation max-w-[100%] h-[100%] animate-[rightToLeft_0.9s_ease-out_forwards] md:hidden w-[100%] h-[600px]" src="/berger650.png" alt="" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
