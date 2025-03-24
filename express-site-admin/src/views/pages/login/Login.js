import React, { useState, useEffect } from "react";
import {
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CRow,
  CAlert,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilBurn } from "@coreui/icons";
import fullLogo from "../../../assets/logo/express-logo.png";

const Login = () => {
  const url = import.meta.env.VITE_USERS_API_URL;
  console.log(url);
  const [inputFields, setInputFields] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setInputFields({ ...inputFields, [e.target.name]: e.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateValues(inputFields);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setSubmitting(true);
    }
  };

  const validateValues = (inputValues) => {
    let emailRegex = /\S+@\S+\.\S+/;
    let errors = {};

    if (!inputValues.email) {
      errors.email = "Email is a required field";
    } else if (!emailRegex.test(inputValues.email)) {
      errors.email = "Invalid email format";
    }
    if (!inputValues.password) {
      errors.password = "Password is required field";
    }

    console.log(errors);
    return errors;
  };

  const checkLogin = async (inputValues) => {
    console.log(inputValues);
    try {
      const response = await fetch(`${url}/admin/login`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputValues),
      });
      const json = await response.json();
      console.log(json);
      if (json.status_code === 200) {
        const expirationDate = new Date();
        const roleExpirationDate = new Date();
        expirationDate.setTime(Date.now() + (500 * 60 * 60 * 1000)); // 500 hours
        roleExpirationDate.setTime(Date.now() + (365 * 24 * 60 * 60 * 1000));
        document.cookie = `authToken=${json.data.token}; expires=${expirationDate.toUTCString()}; path=/`;
        document.cookie = `authRole=${json.data.role}; expires=${roleExpirationDate.toUTCString()};`
        window.location.reload();
      } else {
        setMessage({ error: json.message });
      }
    } catch (error) {
      console.error("Error fetching person:", error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (submitting && Object.keys(errors).length === 0) {
      checkLogin(inputFields);
    }
    // eslint-disable-next-line
  }, [submitting, errors, inputFields]);

  return (
    <>
      <div className="navbar navbar-expand-md navbar-light bg-white shadow-sm">
        <div className="container">
          <a className="navbar-brand" href="/">
            Login to Continue
          </a>
        </div>
      </div>
      <div className="bg-light min-vh-100 d-flex flex-row">
        <CContainer style={{ marginTop: "3rem" }}>
          <CRow className="justify-content-center">
            <CCol md={6}>
              <CCardGroup>
                <CCard className="p-4">
                  <div className="my-2 align-items-center text-center">
                    <img
                      className="sidebar-brand-full"
                      src={fullLogo}
                      alt="logo"
                      width="80%"
                    />
                  </div>
                  <CCardBody>
                    {message.error && (
                      <CAlert color="danger" className="d-flex align-items-center">
                        <CIcon icon={cilBurn} className="flex-shrink-0 me-2" width={24} height={24} />
                        <div>{message.error}</div>
                      </CAlert>
                    )}
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                          E-Mail Address <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={inputFields.email}
                          onChange={handleChange}
                          autoComplete="username"
                        />
                        {errors.email && (
                          <span className="error text-danger">{errors.email}</span>
                        )}
                      </div>
                      <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                          Password <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="password"
                          name="password"
                          value={inputFields.password}
                          onChange={handleChange}
                          autoComplete="current-password"
                        />
                        {errors.password && (
                          <span className="error text-danger">{errors.password}</span>
                        )}
                      </div>
                      <div className="mb-3">
                        <button type="submit" color="primary" className="btn btn-primary px-4" style={{ marginRight: "1rem" }}>
                          Login
                        </button>
                        <a href="/forgot-password">Forgot Your Password?</a>
                      </div>
                    </form>
                  </CCardBody>
                </CCard>
                {/* <CCard
                className="text-white bg-primary py-5"
                style={{ width: "44%" }}
              >
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Create an Account Join our community of administrators and
                      start managing entertainment content today!
                    </p>
                    <Link to="/register">
                      <CButton
                        color="primary"
                        className="mt-3"
                        active
                        tabIndex={-1}
                      >
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard> */}
              </CCardGroup>
            </CCol>
          </CRow>
        </CContainer>
      </div>
    </>
  );
};

export default Login;
