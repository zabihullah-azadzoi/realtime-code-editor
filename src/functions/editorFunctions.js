import axios from "axios";
import { toast } from "react-toastify";

export const codeCompileHandler = (code, getOutputHandler, setIsProcessing) => {
  setIsProcessing(true);
  const options = {
    method: "POST",
    url: process.env.REACT_APP_RAPID_API_URL,
    params: { base64_encoded: "true", fields: "*" },
    headers: {
      "content-type": "application/json",
      "Content-Type": "application/json",
      "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
      "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_SECRET,
    },
    data: JSON.stringify({
      language_id: 63,
      // encode source code in base64
      source_code: window.btoa(code),
      stdin: window.btoa(""),
    }),
  };

  axios
    .request(options)
    .then(function (response) {
      const token = response.data.token;
      checkStatus(token, getOutputHandler, setIsProcessing);
    })
    .catch((err) => {
      setIsProcessing(false);
      let error = err.response ? err.response.data : err;
      toast.error(error.message);
    });
};

const checkStatus = async (token, getOutputHandler, setIsProcessing) => {
  const options = {
    method: "GET",
    url: `${process.env.REACT_APP_RAPID_API_URL}/${token}`,
    params: { base64_encoded: "true", fields: "*" },
    headers: {
      "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
      "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_SECRET,
    },
  };
  try {
    let response = await axios.request(options);
    let statusId = response.data.status?.id;

    // Processed - we have a result
    if (statusId === 1 || statusId === 2) {
      // still processing
      setTimeout(() => {
        checkStatus(token);
      }, 2000);
      return;
    } else {
      //  console.log("response.data", window.atob(response.data.stdout));
      setIsProcessing(false);
      const finalOutput = getOutput(response.data);
      getOutputHandler(finalOutput);
      toast.success("Compiled successfully");
      return;
    }
  } catch (err) {
    setIsProcessing(false);
    let error = err.response ? err.response.data : err;
    console.log("err", error);
  }
};

const getOutput = (outputDetails) => {
  let statusId = outputDetails?.status?.id;

  if (statusId === 6) {
    // compilation error
    return window.atob(outputDetails?.compile_output);
  } else if (statusId === 3) {
    return window.atob(outputDetails.stdout) !== null
      ? `${window.atob(outputDetails.stdout)}`
      : null;
  } else if (statusId === 5) {
    return `Time Limit Exceeded`;
  } else {
    return window.atob(outputDetails?.stderr);
  }
};
