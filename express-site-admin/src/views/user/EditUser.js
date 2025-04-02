import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { cilCompass, cilShare, cilAddressBook } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { CCard, CCardHeader, CCardBody, CButton, CForm } from "@coreui/react";

const EditUser = () => {
  const { userId } = useParams();
  const url = import.meta.env.VITE_USERS_API_URL;
  const navigate = useNavigate();

  const [inputFields, setInputFields] = useState({
    firstName: "",
    lastName: "",
    image: null,
    imagePreview: "",
    email: "",
    mobile: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const file = files[0];
      setInputFields((prevFields) => ({
        ...prevFields,
        [name]: file, // Store file for submission
        [`${name}Preview`]: URL.createObjectURL(file), // Preview URL
      }));
    } else {
      setInputFields((prevFields) => ({ ...prevFields, [name]: value }));
    }
  };

  const getUser = async () => {
    if (!userId) return;

    try {
      const response = await axios.post(
        `${url}/admin/module/details`,
        { moduleType: "user", moduleId: userId },
        { headers: { Authorization: `Bearer token` } }
      );

      const data = response.data.data;
      setInputFields({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobile: data.mobile,
        address: data.address,
        image: null,
        imagePreview: data.image
          ? `${import.meta.env.VITE_IMAGE_URL}${data.image}`
          : null
      });

      setIsEdit(true);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const addEditChannel = async () => {
    try {
      const formData = new FormData();
      Object.entries(inputFields).forEach(([key, value]) => {
        if (!key.includes("Preview")) {
          // For file inputs, ensure null values don't cause errors
          if (key === "image") {
            if (value instanceof File) {
              formData.append(key, value);
            } else {
              formData.append(key, "");
            }
          } else {
            formData.append(key, value ?? "");
          }
        }
      });
      formData.append('userId', userId);
      var response = await axios.post(
        `${url}/admin/add-edit-user`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data) {
        setMessage("User added successfully! 🎉");
        navigate("/users", {
          state: {
            message: isEdit
              ? "User updated successfully!"
              : "User added successfully!",
          },
        });
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateValues(inputFields);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      addEditChannel();
    }
  };

  const validateValues = (values) => {
    const errors = {};
    if (!values.email && !values.mobile) {
      errors.emailOrMobile = "Either email or mobile is required";
    } else {
      if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = "Invalid email format";
      }
      if (values.mobile && !/^\d{10}$/.test(values.mobile)) {
        errors.mobile = "Invalid mobile number format";
      }
    }
    return errors;
  };

  useEffect(() => {
    if (userId) getUser();
  }, [userId]);

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h4 className="m-0">{isEdit ? "Edit User" : "Add User"}</h4>
      </CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              First Name
            </label>
            <input
              type="text"
              className="form-control"
              name="firstName"
              value={inputFields.firstName}
              onChange={handleChange}
            />
            {errors.firstName && (
              <span className="text-danger">{errors.firstName}</span>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">
              Last Name
            </label>
            <input
              type="text"
              className="form-control"
              name="lastName"
              value={inputFields.lastName}
              onChange={handleChange}
            />
            {errors.lastName && (
              <span className="text-danger">{errors.lastName}</span>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={inputFields.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span className="text-danger">{errors.email}</span>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">
              Mobile
            </label>
            <input
              type="text"
              className="form-control"
              name="mobile"
              value={inputFields.mobile}
              onChange={handleChange}
            />
            {errors.mobile && (
              <span className="text-danger">{errors.mobile}</span>
            )}
          </div>
          {errors.emailOrMobile && (
            <span className="text-danger">{errors.emailOrMobile}</span>
          )}
          <div className="mb-3">
            <label className="form-label">
              Image
            </label>
            {inputFields.imagePreview && (
              <img
                src={inputFields.imagePreview}
                alt="Logo Preview"
                className="d-block mb-2"
                height="50"
              />
            )}
            <input
              type="file"
              className="form-control"
              name="image"
              onChange={handleChange}
              accept="image/*"
            />
            {errors.image && (
              <span className="text-danger">{errors.image}</span>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <input
              type="text"
              className="form-control"
              id="address"
              name="address"
              value={inputFields.address}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </CForm>
      </CCardBody>
    </CCard>
  );
};

export default EditUser;
