import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { cilCompass, cilShare } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { CCard, CCardHeader, CCardBody, CButton, CForm } from "@coreui/react";
import VsCodeEditor from "../../components/VsCodeEditor";
const AddEditStaticPage = () => {
  const { channelId, staticPageId } = useParams();
  const url = import.meta.env.VITE_USERS_API_URL;
  const navigate = useNavigate();

  const [inputFields, setInputFields] = useState({
    channelId: channelId,
    staticPageId: null,
    title: "",
    slug: "",
    description: "",
    headerHtml: "",
    footerHtml: "",
    seoTitle: "",
    seoDescription: "",
    seoImage: null,
    seoImagePreview: "",
    seoKeywords: "",
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

  const getStaticPage = async () => {
    if (!staticPageId) return;

    try {
      const response = await axios.post(
        `${url}/admin/module/details`,
        { moduleType: "static-page", moduleId: staticPageId },
        { headers: { Authorization: `Bearer token` } }
      );

      const data = response.data.data;
      setInputFields({
        channelId: data.channelId,
        staticPageId: data._id,
        title: data.title,
        slug: data.slug,
        description: data.description,
        headerHtml: data.headerHtml,
        footerHtml: data.footerHtml,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
        seoImage: null,
        seoImagePreview: data.seoImage
          ? `${import.meta.env.VITE_IMAGE_URL}${data.seoImage}`
          : null,
        status: data.deletedAt ? "inactive" : "active",
      });

      setIsEdit(true);
    } catch (error) {
      console.error("Error fetching channel:", error);
    }
  };

  const addEditStaticPage = async () => {
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
        `${url}/admin/add-edit-static-page`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data) {
        setMessage("Static page added successfully! 🎉");
        navigate(`/channel/${channelId}/static-pages`, {
          state: {
            message: isEdit
              ? "Static page updated successfully!"
              : "Static page added successfully!",
          },
        });
      }
    } catch (error) {
      console.error("Error adding static page:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateValues(inputFields);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      addEditStaticPage();
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
    if (staticPageId) getStaticPage();
  }, [staticPageId]);

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h4 className="m-0">{isEdit ? "Edit Static Page" : "Add Static Page"}</h4>
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
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              name="description"
              value={inputFields.description}
              onChange={handleChange}
              rows="2"
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">Header HTML</label>
            <VsCodeEditor value={inputFields.headerHtml} setValue={setInputFields} name="headerHtml"></VsCodeEditor>
          </div>
          <div className="mb-3">
            <label className="form-label">Footer HTML</label>
            <VsCodeEditor value={inputFields.footerHtml} setValue={setInputFields} name="footerHtml"></VsCodeEditor>
          </div>
          <div className="mb-3">
            <label htmlFor="seoTitle" className="form-label">
              Seo Title
            </label>
            <input
              type="text"
              className="form-control"
              id="seoTitle"
              name="seoTitle"
              value={inputFields.seoTitle}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="seoDescription" className="form-label">
              Seo Description
            </label>
            <textarea
              className="form-control"
              id="seoDescription"
              name="seoDescription"
              value={inputFields.seoDescription}
              onChange={handleChange}
              rows={4}
            ></textarea>
            <p>
              <small>Suggested Word Limit: 160 Characters</small>
            </p>
          </div>

          <div className="mb-3">
            <label className="form-label">SEO Image</label>
            {inputFields.seoImagePreview && (
              <img
                src={inputFields.seoImagePreview}
                alt="SEO Image Preview"
                className="d-block mb-2"
                height="50"
              />
            )}
            <input
              type="file"
              className="form-control"
              name="seoImage"
              onChange={handleChange}
              accept="image/*"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="seoKeywords" className="form-label">
              Seo Keywords
            </label>
            <input
              type="text"
              className="form-control"
              id="seoKeywords"
              name="seoKeywords"
              value={inputFields.seoKeywords}
              onChange={handleChange}
            />
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

export default AddEditStaticPage;
