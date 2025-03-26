import React, { useState } from "react";
import { Editor as TinyMceEditor } from "@tinymce/tinymce-react";

/* eslint-disable react/prop-types */
const Editor = ({ setFields, inputFieldDescription, name }) => {
  const handleDescriptionChange = (content, editor) => {
    var cleanContent = content.replace(/style(\s)*="[^"]*"/g, '');
    setFields((prevFields) => { return ({ ...prevFields, [name]: cleanContent }) })
  };
  const init = {
    menubar: '',
    plugins: "link image code lists table fullscreen wordcount preview",
    toolbar: "undo redo | styleselect | bold italic| bullist numlist | link image | fullscreen | preview",
  };
  return (
    <TinyMceEditor
      className="form-control"
      id={name}
      name={name}
      value={inputFieldDescription}
      onEditorChange={handleDescriptionChange}
      init={init}
    />

  )


}
export default Editor;