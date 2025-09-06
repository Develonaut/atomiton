"use client";

import { useState } from "react";
import Link from "@/router/Link";
import Button from "@/components/Button";
import Login from "@/components/Login";
import Field from "@/components/Field";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  return (
    <Login title="Reset password" image="/images/login-pic-2.jpg">
      <Field
        className="mb-6"
        label="Email"
        placeholder="Enter email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button className="w-full !h-11" isSecondary>
        Check your inbox
      </Button>
      <div className="mt-4 text-center">
        <Link
          className="text-body-sm text-secondary transition-colors hover:text-primary"
          href="/sign-in"
        >
          Have your password? Login
        </Link>
      </div>
    </Login>
  );
}

export default ForgotPasswordPage;
