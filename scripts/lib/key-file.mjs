// 바탕화면 API 키 파일(KEY=값 줄, # 주석) 읽기. 키 값은 절대 출력하지 않는다.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/** ~/Desktop 아래 키 파일 경로 */
export function desktopFile(...parts) {
  return path.join(os.homedir(), "Desktop", ...parts);
}

/** KEY=값 파일을 객체로. 파일이 없으면 빈 객체 (메모장 BOM·CRLF 허용) */
export function readKeyFile(file) {
  if (!fs.existsSync(file)) return {};
  const out = {};
  const text = fs.readFileSync(file, "utf8").replace(/^﻿/, "");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 1) continue;
    out[line.slice(0, i).trim()] = line
      .slice(i + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  }
  return out;
}

/** 환경 변수가 있으면 그 값, 없으면 키 파일 값. 빠진 키 이름을 알려 주며 멈춘다 */
export function loadKeys(names, file, hint) {
  const fromFile = readKeyFile(file);
  const keys = {};
  const missing = [];
  for (const name of names) {
    const value = process.env[name] || fromFile[name];
    if (value) keys[name] = value;
    else missing.push(name);
  }
  if (missing.length) {
    throw new Error(`${missing.join(", ")} 이(가) 없습니다. ${file} 파일에 넣어 주세요. ${hint ?? ""}`.trim());
  }
  return keys;
}
