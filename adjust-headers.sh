#!/bin/bash

# First fix the Firestore RTDB rules
if [ -z "$CSP_RTDB_PATTERN" ]; then
  >&2 echo Error: CSP_RTDB_PATTERN not defined.
  exit 1
else
  #Assume no / in pattern (nothing to escape)
  sed s/CSP_PLACEHOLDER_RTDB_PATTERN/$CSP_RTDB_PATTERN/g ./_headers_template > public/_headers
  echo - Configured RTDB part of CSP headers
fi

# If Sentry is used, fix rules for that as well
if [ -z "$REACT_APP_SENTRY_DSN" ]; then
  echo - Running without Sentry integration. Do not include corresponding CSP headers.
  sed -i s/CSP_PLACEHOLDER_SENTRY_INGEST//g public/_headers
  sed -i s/CSP_PLACEHOLDER_SENTRY_ERROR_PAGE//g public/_headers
else
  if [ -z "$CSP_SENTRY_INGEST" ]; then
    >&2 echo Error: CSP_SENTRY_INGEST not defined.
    exit 1
  else
    ESCAPED=$(echo $CSP_SENTRY_INGEST | sed 's/\//\\\//g')
    sed -i s/CSP_PLACEHOLDER_SENTRY_INGEST/$ESCAPED/g public/_headers
    echo - Configured Sentry ingest part of CSP headers
  fi
  
  if [ -z "$CSP_SENTRY_ERROR_PAGE" ]; then
    echo - Do not include the Sentry error page in the CSP headers.
    sed -i s/CSP_PLACEHOLDER_SENTRY_ERROR_PAGE//g public/_headers
  else
    ESCAPED=$(echo $CSP_SENTRY_ERROR_PAGE | sed 's/\//\\\//g')
    sed -i s/CSP_PLACEHOLDER_SENTRY_ERROR_PAGE/$ESCAPED/g public/_headers
    echo - Configured Sentry error reporting part of CSP headers
  fi
fi

sed -i s/\|/' '/g public/_headers
#hack...
sed -i s/' ;'/';'/g public/_headers
sed -i s/' ;'/';'/g public/_headers