import { Navigate } from "react-router"
import { useAuth } from "../hooks/useAuth";
import Loading from './Loading'
import toast from "react-hot-toast";


const ProtectedRoute = ({children}) => {
  const [user,loading] = useAuth();
  if(loading){
    return <Loading/>
    // return <AuthLoading/>

  }
  if(!user){
    toast.error("You must be logged in to access this page",{ id:'Auth-Error', style:{
      borderRadius: '10px',
      background: '#fff',
      color: '#333',
    } });
    return <Navigate to='/login' replace />
  }
  
  return children
}

export default ProtectedRoute