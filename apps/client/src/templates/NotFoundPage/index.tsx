import Button from "#components/Button";
import Image from "#components/Image";

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-02 p-8">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <Image
            className="size-64 mx-auto"
            src="/images/404.png"
            width={646}
            height={646}
            alt="404"
          />
        </div>

        <div className="bg-surface-01 rounded-2xl border border-s-01 shadow-popover p-8">
          <h1 className="text-h2 text-primary font-semibold mb-4">
            Page not found
          </h1>
          <p className="text-body-md text-secondary mb-8">
            Oh no! We couldn&apos;t find the page you&apos;re looking for.
          </p>

          <Button as="link" href="/" isPrimary className="inline-flex">
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
