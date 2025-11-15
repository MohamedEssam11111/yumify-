import React, { useState } from "react";
import Logo from "../components/logo";
import Button from "../components/Button";
import SmartRestaurant from "../components/SmartRestaurant";
import { Link  ,useNavigate } from "react-router-dom";
import userAPI from "../apis/user.api";
import toast from "react-hot-toast";

// prettier-ignore
const Login = ({backgroundColor = "bg-[linear-gradient(135deg,#f0f2f5_0%,#e0e5ec_100%)]"}) => {
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
      navigator('/profile'); // Redirect to owner dashboard
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
      <div className={`login-body flex justify-center items-center min-h-[100vh] ${backgroundColor}`}>
        <div
          className={`login-container  bg-blur-[10px] rounded-[20px] shadow-[0_10px_30px_rgba(0,_0,_0,_0.1)] flex max-w-[900px] w-[90%] overflow-hidden min-height-[500px] max-md:flex-col min-h-[0]`}
        >

          {/* login card container */}

          <div className="login-form-section  bg-[#FBFCFD] flex-1 p-[40px] flex-col justify-center items-center text-center  max-md:p-[30px] max-md: min-h-[80%]">
            <Logo />
            <SmartRestaurant />
            <h1 className="text-[25px] font-[600] m-[25px_5px_15px_5px]">
              Welcome Back!
            </h1>
            <div className=" w-[100%] flex flex-col gap-[5px] justify-center ">

              {/* the form creation */}

              <form  onSubmit={handleSubmit} action="" className="flex flex-col gap-[20px] items-center p-[0px_35px]">

                <input
                className="p-[12px] rounded-[8px] border-[2px] border-[#E0E0E0] w-[100%]" type="email" placeholder="Email"
                name="logEmail"
                value={logEmail}
                onChange={(e)=>setLogEmail(e.target.value)}
                autoComplete="off"
                />
                
                <input 
                className="p-[12px] rounded-[8px] border-[2px] border-[#E0E0E0] w-[100%]" type="text" placeholder="Password"
                name="logPassword"
                value={logPassword}
                onChange={(e)=>setLogPassword(e.target.value)}
                autoComplete="off"
                />
                <Button buttonText={"Login"}/>
              </form>

              <div className="mt-4 text-sm text-gray-600 pb-[15px]">
                <Link to={''} className="w-auto font-[500] text-[#FF784E] no-underline hover:underline transform hover:text-red-500 transition duration-300 ease">Forgot password?</Link>
              </div>
              {/* prettier-ignore */}
              <div><span className="pr-[5px]">Don't have an account?</span><Link to="/register" className="font-[500] text-[#FF784E] no-underline hover:underline transform hover:text-red-500 transition duration-300 ease">Register</Link></div>
            </div>
          </div>

          {/* img container */}
          {/* prettier-ignore */}
          <div className="max-md:  rounded-tl-[0px] rounded-tr-[0px] rounded-bl-[0] md:flex-1 overflow-hidden bg-[linear-gradient(135deg,#FF7043_0%,#FFCCBB_100%)] flex justify-center items-center  relative max-md:max-h-[100px] md:max-h-none">
            <img className="custom-img-animation max-w-[100%] h-[100%] animate-[rightToLeft_0.9s_ease-out_forwards max-md:hidden" src="/berger.png" alt="" />
            <img className="custom-img-animation max-w-[100%] h-[100%] animate-[rightToLeft_0.9s_ease-out_forwards md:hidden w-[100%] h-[600px]" src="/berger650.png" alt="" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;