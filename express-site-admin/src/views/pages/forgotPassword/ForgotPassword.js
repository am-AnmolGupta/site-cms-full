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
import { cilCheckCircle } from "@coreui/icons";
import fullLogo from "../../../assets/logo/express-logo.png";

const Login = () => {
  const url = import.meta.env.VITE_USERS_API_URL;
  const [inputFields, setInputFields] = useState({
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const handleChange = (e) => {
    setInputFields({ ...inputFields, [e.target.name]: e.target.value });
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors(validateValues(inputFields));
    setSubmitting(true);
  };
  const validateValues = (inputValues) => {
    let emailRegex = /\S+@\S+\.\S+/;
    let errors = {};

    if (!inputValues.email) {
      errors.email = "Email is a required field";
    } else if (!emailRegex.test(inputValues.email)) {
      errors.email = "Invalid email format";
    }

    console.log(errors);
    return errors;
  };
  const checkLogin = async (inputValues) => {
    console.log(inputValues);
    try {
      const response = await fetch(`${url}/admin/forgot/password/`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputValues),
      });
      const json = await response.json();
      console.log(json);
      if (json.status_code === 200) {
        setMessage({success: "Link sent"})
        setInputFields({email:""})
      }
      else {
        setErrors("Not a user");
      }
    } catch (error) {
      console.error("Error fetching person:", error);
    }
  };

  useEffect(() => {

    if (!hasRun && Object.keys(errors).length === 0 && submitting) {

      checkLogin(inputFields);
      setHasRun(true);
    }
    // eslint-disable-next-line
  }, [errors, inputFields, submitting]);

  return (
    <>
      <div className="navbar navbar-expand-md navbar-light bg-white shadow-sm">
        <div className="container">
          <a className="navbar-brand" href="/">
            Reset Password
          </a>
        </div>
      </div>

      <div className="bg-light min-vh-100 d-flex flex-row">
        <CContainer style={{ marginTop: "3rem" }}>
          <CRow className="justify-content-center">
            <CCol md={6}>
              {message.success && (
                <CAlert color="success" className="d-flex align-items-center">
                  <CIcon icon={cilCheckCircle} className="flex-shrink-0 me-2" width={24} height={24} />
                  <div>The password link has been sent to your inbox.</div>
                </CAlert>
              )}
              <CCardGroup>
                <CCard className="p-4">
                  <CCardBody>
                    <form onSubmit={handleSubmit}>
                      <div className="my-2 align-items-center text-center">
                        <img
                          className="sidebar-brand-full"
                          src={fullLogo}
                          alt="logo"
                          width="70%"
                        />
                      </div>


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
                        />
                        {errors.email && (
                          <span className="error text-danger">{errors.email}</span>
                        )}
                      </div>
                      <div className="mb-3">
                        <button type="submit" color="primary" className="btn btn-primary px-4">
                          Send Password Reset Link
                        </button>
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
