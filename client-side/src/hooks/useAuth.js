import {useEffect,useState} from 'react'
import userAPI from '../apis/user.api.js'

export function useAuth(){
    const [user,setUser] = useState(null)
    const [loading,setLoading] = useState(true)

    useEffect(()=>{
        userAPI.get('/authUser')
        .then((res)=>setUser(res.data))
        .catch(()=>setUser(null))
        .finally(()=>setLoading(false))
    },[])

    return [user,loading]

}