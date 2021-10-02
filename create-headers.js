/* Create the _headers file (according to Netlify's definitions) and adjust CSP parts
 * according environment variables.
 * The processing expects a _headers_template file in the PWD.
 */

const fs = require("fs")
const path = require("path")

console.log("\nManage CSP headers definition...")
// This script only deals with CSP headers, so if those aren't activated just skip it.
const useHeaders = process.env.CSP_HEADERS_ACTIVATED === "1"
if (!useHeaders) {
  console.log("-> Application not configured for CSP headers")
  process.exit(0)
}

async function main() {
  try {
    // Iteratively modify the content with search/replace steps
    let headersContent = await fs.promises.readFile("./_headers_template", "utf-8")

    // For Firebase's RTDB we use a pattern (without leading https, wss etc)
    const cspRtdbPattern = process.env.CSP_RTDB_PATTERN
    if (!cspRtdbPattern) throw new Error("CSP_RTDB_PATTERN not defined (or zero-length)")
    headersContent = headersContent.replace(/CSP_PLACEHOLDER_RTDB_PATTERN/g, cspRtdbPattern)
    console.log("- Configured CSP headers for RTDB access")

    // For Sentry, explicit and complete domain names are used (incl protocol)
    const useSentry = !!process.env.REACT_APP_SENTRY_DSN
    if (useSentry) {
      const cspSentryIngest = process.env.CSP_SENTRY_INGEST
      if (!cspSentryIngest) throw new Error("CSP_SENTRY_INGEST not defined (or zero-length)")
      headersContent = headersContent.replace(/CSP_PLACEHOLDER_SENTRY_INGEST/g, cspSentryIngest)
      console.log("- Configured CSP headers for Sentry ingest")

      const useSentryErrorPage = process.env.REACT_APP_SENTRY_ERROR_PAGE === "1"
      if (useSentryErrorPage) {
        const cspSentryErrorPage = process.env.CSP_SENTRY_ERROR_PAGE
        if (!cspSentryErrorPage) throw new Error("CSP_SENTRY_ERROR_PAGE not defined (or zero-length)")
        headersContent = headersContent.replace(/CSP_PLACEHOLDER_SENTRY_ERROR_PAGE/g, cspSentryErrorPage)
        console.log("- Configured CSP headers for Sentry error page")

      } else {
        console.log("- Application not configured for Sentry error page -> skip corresponding CSP headers")  
      }
    } else {
      console.log("- Application not configured for Sentry integration -> skip corresponding CSP headers")
    }

    //Any remaining CSP_PLACEHOLDERs correspond to "else"-branches above. Just remove all those
    headersContent = headersContent.replace(/CSP_PLACEHOLDER_SENTRY_INGEST/g, "")
    headersContent = headersContent.replace(/CSP_PLACEHOLDER_SENTRY_ERROR_PAGE/g, "")

    // Trim remaining (undesired) white-spaces
    // 1. Collapse all "multi" white-space to single 
    headersContent = headersContent.replace(/ +/g, " ")
    // 2. No whitespace before ";"
    headersContent = headersContent.replace(/ ;/g, ";")

    // Create the actual _headers file (under public/)
    const outFile = path.join("public", "_headers")
    await fs.promises.writeFile(outFile, headersContent, "utf-8")
    console.log("-> Wrote file: ", outFile, "\n")

  } catch(e) {
    console.error("ERROR:", e.message ? e.message : e, "\n")
    process.exit(1)
  }
}

try {
  main()
} catch(e) {
  console.error("ERROR:", e.message ? e.message : e, "\n")
  process.exit(1)
}