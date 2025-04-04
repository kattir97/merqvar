import { NavLink, Outlet, useMatches } from "react-router";
import { Fragment } from "react/jsx-runtime";
import { z } from "zod";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Card } from "~/components/ui/card";
import { Spacer } from "~/components/ui/spacer";

export const handle = {
  breadcrumb: "Profile",
};

const BreadcrumbHandleMatch = z.object({
  handle: z.object({ breadcrumb: z.any() }),
});

export default function Profile() {
  const matches = useMatches();

  const breadcrumbs = matches
    .map((m) => {
      const result = BreadcrumbHandleMatch.safeParse(m);
      if (!result.success || !result.data.handle.breadcrumb) return null;
      return (
        <NavLink key={m.id} to={m.pathname} className="flex items-center">
          {result.data.handle.breadcrumb}
        </NavLink>
      );
    })
    .filter(Boolean);

  return (
    <div className="m-auto pb-24 mt-10 md:mt-16 max-w-3xl p-4">
      <div className="container">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((bc, i, arr) => {
              return (
                <Fragment key={i}>
                  <BreadcrumbItem
                    className={`${
                      i === arr.length - 1 ? "" : "text-muted-foreground"
                    }`}
                  >
                    {bc}
                  </BreadcrumbItem>
                  {arr.length - 1 > i ? <BreadcrumbSeparator /> : null}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Spacer size="3xs" />
      <Card className="mx-auto  px-6 py-8 md:container md:rounded-3xl">
        <Outlet />
      </Card>
    </div>
  );
}
