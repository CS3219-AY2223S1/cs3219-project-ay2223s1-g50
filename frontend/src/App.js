import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SignupPage from './components/SignupPage'
import LoginPage from './components/LoginPage'
import NavBar from './components/layouts/Navbar'
import DashBoard from './components/Dashboard'
import RequireAuth from './components/protected-routes/RequireAuth'
import ExistingAuth from './components/protected-routes/ExistingAuth'
import UserContextProvider from './components/context/user-context'
import PageNotFound from './components/PageNotFound'
import LoadingPage from './components/LoadingPage'
import Hero from './components/home/HeroPage'
import Profile from './components/Profile'
import Interview from './components/Interview'
import AboutPage from './components/home/AboutPage'

function App() {
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
              />
              <Route path="/dashboard" element={<DashBoard />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/** TODO  */}
            {/** CHECK WHY VALUES IN CONTEXT IS REMOVED WHEN PATH="*"  */}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
      </div>
    </UserContextProvider>
  )
}

export default App
