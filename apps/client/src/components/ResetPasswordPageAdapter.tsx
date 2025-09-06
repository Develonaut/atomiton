"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import ButtonAdapter from "./ButtonAdapter";
import Login from "@/components/Login";
import Field from "@/components/Field";

function ResetPasswordPageAdapter() {
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
      <ButtonAdapter className="w-full !h-11" isSecondary>
        Check your inbox
      </ButtonAdapter>
      <div className="mt-4 text-center">
        <Link
          className="text-body-sm text-secondary transition-colors hover:text-primary"
          to="/sign-in"
        >
          Have your password? Login
        </Link>
      </div>
    </Login>
  );
}

export default ResetPasswordPageAdapter;
