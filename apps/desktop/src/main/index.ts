import { createDesktopAppBootstrap } from "#main/bootstrap";

const bootstrap = createDesktopAppBootstrap();
bootstrap.start().catch(console.error);
