const fs = require("fs");
const path = require("path");
 
const root = process.cwd();
const proxyPath = path.join(root, "proxy.ts");
const middlewarePath = path.join(root, "middleware.ts");
 
function normalize() {
  const proxyExists = fs.existsSync(proxyPath);
  const middlewareExists = fs.existsSync(middlewarePath);
 
  if (!proxyExists && middlewareExists) {
    console.log("[prepare-cloudflare-build] middleware.ts already present, proxy.ts absent — nothing to do.");
    return;
  }
 
  if (!proxyExists && !middlewareExists) {
    console.log("[prepare-cloudflare-build] No proxy.ts or middleware.ts found — nothing to do.");
    return;
  }
 
  if (proxyExists && middlewareExists) {
    // A previous run already converted it and proxy.ts came back via merge.
    // Prefer regenerating middleware.ts from the current proxy.ts so staging's
    // logic changes aren't silently lost, then remove proxy.ts for this build.
    console.log("[prepare-cloudflare-build] Both files present — regenerating middleware.ts from proxy.ts.");
  }
 
  let content = fs.readFileSync(proxyPath, "utf8");
 
  // Rename the exported function: `export async function proxy(` / `export function proxy(`
  // Adjust this regex if your export style differs (e.g. `export const proxy = ...`).
  const renamed = content.replace(
    /export\s+(async\s+)?function\s+proxy\s*\(/,
    (match, asyncKeyword) => `export ${asyncKeyword || ""}function middleware(`
  );
 
  if (renamed === content) {
    console.warn(
      "[prepare-cloudflare-build] WARNING: no `export function proxy(` match found — " +
        "check proxy.ts's export style and update the regex in this script."
    );
  }
 
  fs.writeFileSync(middlewarePath, renamed, "utf8");
  fs.unlinkSync(proxyPath);
 
  console.log("[prepare-cloudflare-build] proxy.ts -> middleware.ts conversion complete.");
}
 
normalize();