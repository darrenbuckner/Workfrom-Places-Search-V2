import { MemberstackProvider as MSProvider } from "@memberstack/react";

const MEMBERSTACK_CONFIG = {
  publicKey: "YOUR_MEMBERSTACK_PUBLIC_KEY",
  checkoutRedirect: "/signup/checkout"
};

export const MemberstackProvider = ({ children }) => {
  return (
    <MSProvider config={MEMBERSTACK_CONFIG}>
      {children}
    </MSProvider>
  );
};