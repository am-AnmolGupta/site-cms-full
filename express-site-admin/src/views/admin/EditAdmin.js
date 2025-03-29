import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { useParams, useLocation } from "react-router-dom";
import { getCookie } from '../../Helper/cookieHelper'

const AddBrand = () => {
  const { id } = useParams();
  const [hasSet, setHasSet] = useState(false);

  const location = useLocation();
  const url = import.meta.env.VITE_USERS_API_URL;
  const [person, setPerson] = useState([]);
  const [updatedPerson, setUpdatedPerson] = useState([]);

  const navigate = useNavigate();
  const [inputFields, setInputFields] = useState({
    name: "",
    email: "",
    roles: [],
    mobile: "",
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
  const handleRoleChange = (selectedOption, actionMeta) => {
    if (actionMeta && actionMeta.name === "roles") {
      setInputFields({ ...inputFields, roles: selectedOption });
    }
  };
  const handleChange = (e) => {
    setInputFields({ ...inputFields, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    const role = getCookie('authRole=');
    const rolesArray = role ? role.split(',') : [];
    const isSuperAdminOrAdmin = rolesArray.includes('superadmin');
    if (!isSuperAdminOrAdmin) {
      navigate("/403");
    }
  });
  const fetchPersons = async () => {
    try {
      const token = getCookie('authToken=');
      const response = await fetch(`${url}/admin/roles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
      });
      const json = await response.json();
      setPerson(json.data);
      updatePerson();
    } catch (error) {
      console.error("Error fetching persons:", error);
    }
  };
  const addPerson = async (inputValues) => {
    try {
      const token = getCookie('authToken=');
      const response = await fetch(`${url}/admin/add-admin`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(inputValues),
      });
      const json = await response.json();
      if (json) {
        navigate("/admins");
      }
    } catch (error) {
      console.error("Error fetching person:", error);
    }
  };
  const updatePerson = () => {
    const updatedPersons = person.map(person => ({
      value: person._id,
      label: person.role
    }));
    setUpdatedPerson(updatedPersons);
  }
  useEffect(() => {
    fetchPersons();
    if (!hasRun && Object.keys(errors).length === 0 && submitting) {
      const updatedRoles = inputFields.roles.map((type) => (type.label));

      const updatedInputFields = {
        ...inputFields,
        roles: updatedRoles,
        userId: id
      };
      addPerson(updatedInputFields);
      setHasRun(true);
      setMessage("User added successfully! 🎉");
    }
    // eslint-disable-next-line

    if (itemData && !hasSet) {
      setInputFields({
        name: itemData.name,
        email: itemData.email,
        phone: itemData.phone,
        roles: itemData.roles.map((role) => ({
          value: role,
          label: role
        })),
      });
      setHasSet(true);
    }
    // eslint-disable-next-line
  }, [itemData, errors, hasRun, inputFields, submitting, id, navigate, url]);

  const validateValues = (inputValues) => {
    let emailRegex = /\S+@\S+\.\S+/;
    let errors = {};
    if (inputValues.name.length === 0) {
      errors.name = "Name is required field";
    }
    if (inputValues.roles.length === 0) {
      errors.roles = "Role is required field";
    }
    if (!inputValues.email) {
      errors.email = "Email is a required field";
    } else if (!emailRegex.test(inputValues.email)) {
      errors.email = "Invalid email format";
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

        <h3>Admin User</h3>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={inputFields.name}
              onChange={handleChange}
            />
            {errors.name && (
              <span className="error text-danger">{errors.name}</span>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="email"
              name="email"
              value={inputFields.email}
              onChange={handleChange}
            />
            {errors.name && (
              <span className="error text-danger">{errors.email}</span>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="roles" className="form-label">
              Role
            </label>
            <Select
              isMulti
              id="roles"
              name="roles"
              options={updatedPerson}
              className="basic-multi-select"
              classNamePrefix="select"
              value={inputFields.roles}
              onChange={handleRoleChange}
            />
            {errors.type && (
              <span className="error text-danger">{errors.type}</span>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="mobile" className="form-label">
              Mobile
            </label>
            <input
              type="text"
              className="form-control"
              id="mobile"
              name="mobile"
              value={inputFields.mobile}
              onChange={handleChange}
            />
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
