import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import CssBaseline from "@mui/material/CssBaseline";

/**
 * =============================================================================
 * [파일 설명: main.tsx - 웹사이트 진입점]
 * =============================================================================
 * 이 파일은 프로젝트가 실행될 때 **가장 먼저** 읽히는 파일입니다.
 * 1. HTML 파일(index.html)에 있는 <div id="root">를 찾습니다.
 * 2. 그 안에 우리의 리액트 앱(<App />)을 집어넣어 실행시킵니다.
 * =============================================================================
 */

ReactDOM.createRoot(document.getElementById("root")!).render(
  // [StrictMode] 개발 중에 잠재적인 문제를 찾기 위해 검사하는 도구입니다. (배포 시 자동 무시됨)
  <React.StrictMode>
    {/* [CssBaseline] 
        브라우저(크롬, 사파리 등)마다 기본 스타일이 조금씩 다른데, 
        그걸 똑같게 맞춰주는 '평탄화 작업'을 합니다. (여백 제거, 폰트 통일 등) 
    */}
    <CssBaseline />
    {/* 여기가 바로 우리가 만든 웹사이트의 본체입니다. */}
    <App />
  </React.StrictMode>
);
