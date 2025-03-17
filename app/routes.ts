import { index, layout, route, RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default [
    
    route("login", "./routes/auth/login.tsx"),
    route("logout", "./routes/auth/logout.ts"),
    route("register", "./routes/auth/register.tsx"),
    route("profile","./routes/settings/profile.tsx",[ // Profile becomes a layout route
        index("./routes/settings/index.tsx"), // This is the default child route
      ]),

    // Other routes...
    ...(await flatRoutes())
] satisfies RouteConfig;