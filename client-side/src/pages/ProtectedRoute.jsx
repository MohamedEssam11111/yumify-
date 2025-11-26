import { Navigate } from "react-router"
import { useAuth } from "../hooks/useAuth";
import AuthLoading from './AuthLoading'
import toast from "react-hot-toast";
import Loading from '../components/Loading'

const ProtectedRoute = ({children}) => {
  const [user,loading] = useAuth();
  if(loading){
    // return <AuthLoading/>
    return <loading />
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