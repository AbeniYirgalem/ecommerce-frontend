// src/redux/api/uniBazzarApi.js
// WARNING: backward-compatibility shim - do not add logic here.
// All logic now lives in src/lib/axios.js.
// This file exists so that any component importing from
// "../redux/api/uniBazzarApi" or "../../redux/api/uniBazzarApi" continues to work.
export { injectStore } from "../../lib/axios";
export { default } from "../../lib/axios";
