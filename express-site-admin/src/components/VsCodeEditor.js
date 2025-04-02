import React, { useState } from "react";
import { Editor } from "@monaco-editor/react";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CFormSelect,
  CFormLabel
} from "@coreui/react";
import logo from 'src/assets/logo/vscode.svg';
const VsCodeEditor = ({ setValue, value, name }) => {
  const [theme, setTheme] = useState("vs-light");
  const [code, setCode] = useState("<!-- Write your HTML code here -->");

  const handleCodeChange = (value) => {
    setValue((prevFields) => ({ ...prevFields, [name]: value }));
  };

  // Theme options for the select dropdown
  const themeOptions = [
    { value: "vs-dark", label: "Dark" },
    { value: "vs-light", label: "Light" }
  ];

  return (
    <CCard className="border-0 shadow">
      <CCardHeader className="d-flex justify-content-between align-items-center bg-dark text-white">
        <div className="fw-medium">
          <img src={logo} alt="VS Code Icon" width="30" height="30" />
        </div>

        <div className="d-flex align-items-center">
          <CFormLabel htmlFor="theme-select" className="text-light me-2 mb-0">
            Theme:
          </CFormLabel>
          <CFormSelect
            id="theme-select"
            size="sm"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            options={themeOptions}
            className="bg-secondary text-white border-secondary"
            style={{ width: '120px' }}
          />
        </div>
      </CCardHeader>

      <CCardBody className="p-0">
        <Editor
          id={name}
          name={name}
          height="400px"
          language="html"
          value={value ?? code}
          theme={theme}
          onChange={handleCodeChange}
          options={{
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: "on",
            renderLineHighlight: "all",
            automaticLayout: true,
            padding: { top: 10 }
          }}
        />
      </CCardBody>
    </CCard>
  );
};

export default VsCodeEditor;