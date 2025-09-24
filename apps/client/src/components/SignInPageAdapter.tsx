import ButtonAdapter from "#ButtonAdapter";
import Field from "#components/Field";
import Image from "#components/Image";
import Login from "#components/Login";
import { Link } from "#router";
import { useState } from "react";

function SignInPageAdapter() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Login title="Sign in to Brainwave" image="/images/login-pic-2.jpg">
      <ButtonAdapter className="w-full gap-2" isPrimary>
        <Image
          className="size-6 opacity-100"
          src="/images/google.svg"
          width={24}
          height={24}
          alt="Google"
        />
        Sign in with Google
      </ButtonAdapter>
      <div className="my-6 text-center text-body-sm text-tertiary">
        Or sign in with email
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
        forgotPassword
      />
      <ButtonAdapter className="w-full !h-11" isSecondary as="link" href="/">
        Sign in
      </ButtonAdapter>
      <div className="mt-4 text-center">
        <Link
          className="text-body-sm text-secondary transition-colors hover:text-primary"
          to="/create-account"
        >
          Need an account?
        </Link>
      </div>
    </Login>
  );
}

export default SignInPageAdapter;
