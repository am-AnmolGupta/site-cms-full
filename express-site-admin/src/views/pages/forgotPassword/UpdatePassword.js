import React, { useState, useEffect } from "react";
import {
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CRow,
} from "@coreui/react";
import fullLogo from "../../../assets/logo/express-logo.png";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";


const Login = () => {
  const { email, timestamp } = useParams();
  const navigate = useNavigate();
  const url = import.meta.env.VITE_USERS_API_URL;
  const [inputFields, setInputFields] = useState({
    password: "",
    cpassword: ""
  });
  const [errors, setErrors] = useState({});
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
    let errors = {};

    if (!inputValues.password) {
      errors.passwords = "Password is a required field";
    }

    if (!inputValues.cpassword) {
      errors.cpasswords = "Confirm Password is a required field";
    }

    if (inputValues.password && inputValues.cpassword && inputValues.password !== inputValues.cpassword) {
      errors.matchPassword = "Passwords do not match";
    }


    console.log(errors);
    return errors;
  };
  const checkLogin = async (inputValues) => {
    console.log(inputValues);
    try {
      const response = await fetch(`${url}/admin/update/password`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputValues),
      });
      const json = await response.json();
      console.log(json);
      if (json.status_code === 200) {
        navigate("/thankyou");
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
      const updatedInputFields = {
        email: email,
        timestamp: timestamp,
        password: inputFields.password,
      };
      checkLogin(updatedInputFields);
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
              <CCardGroup>
                <CCard className="p-4">
                  <CCardBody>
                    <div className="my-2 align-items-center text-center">
                      <img
                        className="sidebar-brand-full"
                        src={fullLogo}
                        alt="logo"
                        width="70%"
                      />
                    </div>
                    {errors.matchPassword && (
                      <span className="error text-danger">{errors.matchPassword}</span>
                    )}
                    <form onSubmit={handleSubmit}>
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
                          autoComplete="new-password"
                          aria-labelledby="passwordLabel"
                        />
                        {errors.passwords && (
                          <span className="error text-danger">{errors.passwords}</span>
                        )}
                      </div>
                      <div className="mb-3">
                        <label htmlFor="cpassword" className="form-label">
                          Confirm Password <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="cpassword"
                          name="cpassword"
                          value={inputFields.cpassword}
                          onChange={handleChange}
                          autoComplete="new-password"
                          aria-labelledby="passwordLabel"
                        />
                        {errors.cpasswords && (
                          <span className="error text-danger">{errors.cpasswords}</span>
                        )}
                      </div>
                      <div className="mb-3">
                        <button type="submit" color="primary" className="btn btn-primary px-4">
                          Save
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
