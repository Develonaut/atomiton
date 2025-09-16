import { useState } from "react";
import { Link } from "@/router";
import Button from "@/components/Button";
import Login from "@/components/Login";
import Image from "@/components/Image";
import Field from "@/components/Field";

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Login title="Sign in to Brainwave" image="/images/login-pic-2.jpg">
      <Button className="w-full gap-2" isPrimary>
        <Image
          className="size-6 opacity-100"
          src="/images/google.svg"
          width={24}
          height={24}
          alt="Google"
        />
        Sign in with Google
      </Button>
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
      <Button className="w-full !h-11" isSecondary as="link" href="/">
        Sign in
      </Button>
      <div className="mt-4 text-center">
        <Link
          className="text-body-sm text-secondary transition-colors hover:text-primary"
          href="/create-account"
        >
          Need an account?
        </Link>
      </div>
    </Login>
  );
}

export default SignInPage;
