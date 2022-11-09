import Interview from './components/pages/InterviewPage'
import LoadingPage from './components/pages/LoadingPage'
import LoginPage from './components/pages/LoginPage'
import PageNotFound from './components/pages/404'
import Profile from './components/pages/ProfilePage'
import SignupPage from './components/pages/SignupPage'
import UserContextProvider from './components/context/user-context'
import AboutPage from './components/home/AboutPage'
import Hero from './components/home/HeroPage'
import NavBar from './components/layouts/Navbar'
import DashBoard from './components/pages/DashboardPage'
import ExistingAuth from './components/routes/ExistingAuth'
import RequireAuth from './components/routes/RequireAuth'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  const isCookieEnabled = window.navigator.cookieEnabled
  if (!isCookieEnabled) alert('Please enable cookies for best user experience!')

  return (
    <UserContextProvider>
      <div className="App">
        <NavBar />
        <Router>
          <Routes>
            {/** Public routes */}
            <Route exact path="/" element={<Hero />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/loading" element={<LoadingPage />} />

            {/** Check for existing sessions */}
            <Route element={<ExistingAuth />}>
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/** Protected paths */}
            <Route element={<RequireAuth />}>
              {/**Add InterviewSession into another protected path iff has matching */}
              <Route
                path="/interview/:difficulty/:roomId"
                element={<Interview />}
                onLeave={() => alert('est')}
              />
              <Route path="/dashboard" element={<DashBoard />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
      </div>
    </UserContextProvider>
  )
}

export default App
