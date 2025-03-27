import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { cilCompass, cilShare } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { CCard, CCardHeader, CCardBody, CButton, CForm } from "@coreui/react";

const AddEditProfile = () => {
  const { profileId } = useParams();
  const url = import.meta.env.VITE_USERS_API_URL;
  const navigate = useNavigate();

  const [inputFields, setInputFields] = useState({
    profileId: null,
    title: "",
    slug: "",
    image: null,
    imagePreview: "",
    designation: "",
    company: "",
    type: "individual",
    email: '',
    industry: "",
    bio: "",
    location: "",
    website: "",
    priority: "",
    promoted: "false",
    status: "active",
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

  const getProfile = async () => {
    if (!profileId) return;

    try {
      const response = await axios.post(
        `${url}/admin/module/details`,
        { moduleType: "profile", moduleId: profileId },
        { headers: { Authorization: `Bearer token` } }
      );

      const data = response.data.data;
      setInputFields({
        profileId: data._id,
        title: data.title,
        slug: data.slug,
        designation: data.designation,
        company: data.company,
        type: data.type,
        email: data.email,
        industry: data.industry,
        bio: data.bio,
        location: data.location,
        website: data.website,
        priority: data.priority,
        promoted: data.promoted,
        image: null,
        imagePreview: data.image
          ? `${import.meta.env.VITE_IMAGE_URL}${data.image}`
          : null,
        status: data.deletedAt ? "inactive" : "active",
      });

      setIsEdit(true);
    } catch (error) {
      console.error("Error fetching channel:", error);
    }
  };

  const addEditProfile = async () => {
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

      var response = await axios.post(
        `${url}/admin/add-edit-profile`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data) {
        setMessage("Profile added successfully! 🎉");
        navigate("/profiles", {
          state: {
            message: isEdit
              ? "Profile updated successfully!"
              : "Profile added successfully!",
          },
        });
      }
    } catch (error) {
      console.error("Error adding profile:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateValues(inputFields);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      addEditProfile();
    }
  };

  const validateValues = (values) => {
    const errors = {};
    if (!values.title) errors.title = "Title is required.";
    if (!values.slug) errors.slug = "Slug is required.";
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) {
      errors.slug = "Invalid slug format.";
    }
    return errors;
  };

  useEffect(() => {
    if (profileId) getProfile();
  }, [profileId]);

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h4 className="m-0">{isEdit ? "Edit Profile" : "Add Profile"}</h4>
      </CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              name="title"
              value={inputFields.title}
              onChange={handleChange}
            />
            {errors.title && (
              <span className="text-danger">{errors.title}</span>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="type" className="form-label">
              Type <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              id="type"
              name="type"
              value={inputFields.type}
              onChange={handleChange}
            >
              <option value="individual">Individual</option>
              <option value="company">Company</option>
            </select>
            {errors.type && (
              <span className="text-danger">{errors.type}</span>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">
              Slug <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              name="slug"
              value={inputFields.slug}
              onChange={handleChange}
            />
            {errors.slug && <span className="text-danger">{errors.slug}</span>}
          </div>

          <div className="mb-3">
            <label className="form-label">Bio</label>
            <textarea
              className="form-control"
              name="bio"
              value={inputFields.bio}
              onChange={handleChange}
              rows="4"
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">
              Image <span className="text-danger">*</span>
            </label>
            {inputFields.imagePreview && (
              <img
                src={inputFields.imagePreview}
                alt="Image Preview"
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
            <label htmlFor="designation" className="form-label">
              Designation
            </label>
            <input
              type="text"
              className="form-control"
              id="designation"
              name="designation"
              value={inputFields.designation}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="company" className="form-label">
              Company
            </label>
            <input
              type="text"
              className="form-control"
              id="company"
              name="company"
              value={inputFields.company}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={inputFields.email}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="industry" className="form-label">
              Industry
            </label>
            <input
              type="text"
              className="form-control"
              id="industry"
              name="industry"
              value={inputFields.industry}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">
              Location
            </label>
            <input
              type="text"
              className="form-control"
              id="location"
              name="location"
              value={inputFields.location}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="website" className="form-label">
              Website
            </label>
            <input
              type="text"
              className="form-control"
              id="website"
              name="website"
              value={inputFields.website}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="priority" className="form-label">
              Priority
            </label>
            <input
              type="number"
              className="form-control"
              id="priority"
              name="priority"
              value={inputFields.priority}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="promoted" className="form-label">
              Promoted
            </label>
            <select
              className="form-select"
              id="promoted"
              name="promoted"
              value={inputFields.promoted}
              onChange={handleChange}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              className="form-select"
              id="status"
              name="status"
              value={inputFields.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </CForm>
      </CCardBody>
    </CCard>
  );
};

export default AddEditProfile;
