import { HashRouter, Route, Routes } from 'react-router'
import { AuthProvider } from './contexts/AuthContext'
import { APP_CONFIG } from './config/app.config'
import HomePage from './pages/Home'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import UserAccountPage from './pages/UserAccount'

// #region agent log
const _cfg = APP_CONFIG.getCurrentConfig();
fetch('http://127.0.0.1:7584/ingest/0149d283-503e-4f7c-81cd-6e34434810dd',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ae9ba4'},body:JSON.stringify({sessionId:'ae9ba4',location:'marketing-site/App.tsx:init',message:'Marketing app config at startup',data:{marketingUrl:_cfg.MARKETING_URL,mainAppUrl:_cfg.MAIN_APP_URL,apiUrl:_cfg.API_URL,nodeEnv:typeof process!=='undefined'?process.env.NODE_ENV:'unknown'},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
// #endregion

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/account" element={<UserAccountPage />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
