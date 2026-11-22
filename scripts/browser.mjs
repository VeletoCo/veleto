import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
export const origin=process.env.VELOTO_TEST_URL||'http://127.0.0.1:5174';
export async function launchBrowser(options={}){
  const candidates=[process.env.VELOTO_CHROME_PATH,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'];
  const executablePath=candidates.find(p=>p&&existsSync(p));
  return chromium.launch({headless:true,...(executablePath?{executablePath}:{}),...options});
}
