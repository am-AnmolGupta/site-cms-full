import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
import { getCookie } from '../../Helper/cookieHelper';

const AddBrand = () => {
  const { id } = useParams();
  const [hasSet, setHasSet] = useState(false);

  const location = useLocation();
  const url = import.meta.env.VITE_USERS_API_URL;

  const navigate = useNavigate();
  const [inputFields, setInputFields] = useState({
    role: '',
  });
  const itemData = location.state?.itemData;
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors(validateValues(inputFields));
    setSubmitting(true);
  };
  const handleChange = (e) => {
    setInputFields({ ...inputFields, [e.target.name]: e.target.value });
  };

  const addPerson = async (inputValues) => {
    try {
      const token = getCookie('authToken=');
      const response = await fetch(`${url}/admin/add-role`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(inputValues),
      });
      const json = await response.json();
      if (json) {
        navigate("/roles");
      }
    } catch (error) {
      console.error("Error fetching person:", error);
    }
  };
  useEffect(() => {
    const role = getCookie('authRole=');
    const rolesArray = role ? role.split(',') : [];
    const isSuperAdminOrAdmin = rolesArray.includes('superadmin');
    if (!isSuperAdminOrAdmin) {
      navigate("/403");
    }
  });
  useEffect(() => {
    if (!hasRun && Object.keys(errors).length === 0 && submitting) {
      const updatedInputFields = {
        ...inputFields,
        roleId: id
      };
      addPerson(updatedInputFields);
      setHasRun(true);
      setMessage("Role updated successfully! 🎉");
    }
    // eslint-disable-next-line

    if (itemData && !hasSet) {
      setInputFields({
        role: itemData.role,
      });
      setHasSet(true);
    }
    // eslint-disable-next-line
  }, [itemData, errors, hasRun, inputFields, submitting, id, navigate, url, hasSet]);

  const validateValues = (inputValues) => {
    let errors = {};
    if (inputValues.role.length === 0) {
      errors.name = "Role is required field";
    }
    return errors;
  };

  return (
    <>
      {message && (
        <div className="alert alert-success" role="alert">
          {message}
        </div>
      )}
      <div className="container my-3" style={{ backgroundColor: "white", padding: "20px", border: "1px solid #e9ecef", borderRadius: "0.25rem" }}>

        <h3>Role</h3>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-3">
            <label htmlFor="role" className="form-label">
              Role <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="role"
              name="role"
              value={inputFields.role}
              onChange={handleChange}
            />
            {errors.name && (
              <span className="error text-danger">{errors.name}</span>
            )}
          </div>
          <button type="submit" className="btn btn-primary my-3">
            Submit
          </button>
        </form>
      </div>
    </>
  );
};
export default AddBrand;
