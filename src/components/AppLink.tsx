import { forwardRef, type AnchorHTMLAttributes } from "react";
import { Link as RouterLink } from "react-router-dom";

type AppLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href?: string;
};

function isNative(href: string, target: string | undefined): boolean {
  return /^(https?:|mailto:|tel:)/i.test(href) || href.startsWith("#") || target === "_blank";
}

/** Bridge Kumo's `href` links onto React Router, and leave external URLs as anchors. */
export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(function AppLink({ href = "", target, ...rest }, ref) {
  if (isNative(href, target)) {
    return <a ref={ref} href={href} target={target} {...rest} />;
  }
  return <RouterLink ref={ref} to={href || "/"} target={target} {...rest} />;
});
