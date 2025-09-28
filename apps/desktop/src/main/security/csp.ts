import { session } from "electron";

export type CSPManager = {
  setupContentSecurityPolicy: (isDev: boolean) => void;
};

export function createCSPManager(): CSPManager {
  const setupContentSecurityPolicy = (isDev: boolean): void => {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      const responseHeaders = { ...details.responseHeaders };

      if (isDev) {
        responseHeaders["Content-Security-Policy"] = [
          [
            "default-src 'self' http://localhost:* ws://localhost:*",
            "script-src 'self' 'unsafe-inline' http://localhost:* chrome-extension://lmhkpmbekcpmknklioeibfkpmmfibljd",
            "style-src 'self' 'unsafe-inline' http://localhost:* https://fonts.googleapis.com",
            "img-src 'self' data: http://localhost:* chrome-extension://lmhkpmbekcpmknklioeibfkpmmfibljd",
            "connect-src 'self' ws://localhost:* http://localhost:* chrome-extension://lmhkpmbekcpmknklioeibfkpmmfibljd",
            "font-src 'self' data: https://fonts.gstatic.com",
          ].join("; "),
        ];
      } else {
        responseHeaders["Content-Security-Policy"] = [
          [
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: https:",
            "connect-src 'self' https:",
            "font-src 'self' data: https://fonts.gstatic.com",
          ].join("; "),
        ];
      }

      callback({ responseHeaders });
    });
  };

  return {
    setupContentSecurityPolicy,
  };
}
