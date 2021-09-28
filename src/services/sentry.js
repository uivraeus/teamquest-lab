import * as Sentry from '@sentry/react';

const DSN = process.env.REACT_APP_SENTRY_DSN;
const active = !!DSN;

export const errorTracking = {
  init: () => active ? Sentry.init({ dsn: DSN }) : null,
  captureException: (...reset) => active ? Sentry.captureException(...reset) : null,
  captureMessage: (...reset) => active ? Sentry.captureMessage(...reset) : null,
  ErrorBoundary: (props) => active ? 
    <Sentry.ErrorBoundary fallback={props.fallback} showDialog>
      { props.children }
    </Sentry.ErrorBoundary> : 
    <>
      { props.children }
    </>
}
