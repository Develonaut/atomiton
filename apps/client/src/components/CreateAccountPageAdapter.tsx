import { useState } from "react";
import { Link } from "react-router-dom";
import ButtonAdapter from "./ButtonAdapter";
import Login from "@/components/Login";
import Image from "@/components/Image";
import Field from "@/components/Field";

function CreateAccountPageAdapter() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Login title="Create your account" image="/images/login-pic-1.jpg">
      <ButtonAdapter className="w-full gap-2" isPrimary>
        <Image
          className="size-6 opacity-100"
          src="/images/google.svg"
          width={24}
          height={24}
          alt="Google"
        />
        Sign up with Google
      </ButtonAdapter>
      <div className="my-6 text-center text-body-sm text-tertiary">
        Or sign up with email
      </div>
      <Field
        className="mb-4"
        label="Email"
        placeholder="Enter email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Field
        className="mb-6"
        label="Password"
        placeholder="Enter password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <ButtonAdapter className="w-full !h-11" isSecondary as="link" href="/">
        Create account
      </ButtonAdapter>
      <div className="mt-4 text-center">
        <Link
          className="text-body-sm text-secondary transition-colors hover:text-primary"
          to="/sign-in"
        >
          Already have an account?
        </Link>
      </div>
    </Login>
  );
}

export default CreateAccountPageAdapter;
