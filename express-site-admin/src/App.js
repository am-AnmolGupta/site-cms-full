import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'

// We use those styles to show code examples, you should remove them in your application.
import './scss/examples.scss'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import("./views/pages/login/Login"));
const Register = React.lazy(() => import("./views/pages/register/Register"));
const Page404 = React.lazy(() => import("./views/pages/page404/Page404"));
const Page403 = React.lazy(() => import("./views/pages/page403/Page403"));
const Page500 = React.lazy(() => import("./views/pages/page500/Page500"));
const ForgotPassword = React.lazy(() => import("./views/pages/forgotPassword/ForgotPassword"));
const UpdatePassword = React.lazy(() => import("./views/pages/forgotPassword/UpdatePassword"));
const PageThankYou = React.lazy(() => import("./views/pages/pageThankYou/pageThankYou"));

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  const isAuthTokenSet = () => {
    const authToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='));
    return authToken ? true : false;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
        <Route
            exact
            path="/login"
            element={isAuthTokenSet() ? <Navigate to="/" /> : <Login />}
          />
          <Route
            exact
            path="/register"
            element={isAuthTokenSet() ? <Navigate to="/" /> : <Register />}
          />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/403" name="Page 403" element={<Page403 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
          <Route exact path="/thankyou" name="Page Thank You" element={<PageThankYou />} />
          <Route
            exact
            path="/forgot-password"
            name="Forgot Password"
            element={<ForgotPassword />}
          />
          <Route
            exact
            path="/admin/update/password/:email/:timestamp"
            name="Update Password"
            element={<UpdatePassword />}
          />
          <Route
            path="*"
            element={
              isAuthTokenSet() ? <DefaultLayout /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter >
  )
}

export default App
