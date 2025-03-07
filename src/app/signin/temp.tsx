import { redirect } from "next/navigation";
import { signIn, providerMap } from "../../lib/auth/auth";
import { AuthError } from "next-auth";
import { handleSignIn } from "./actions";

export default async function SignInPage(props: {
  searchParams: { callbackUrl: string | undefined };
}) {
  return (
    <>
      <div>Hello</div>
      <pre>{JSON.stringify(providerMap)}</pre>
      <div className="flex flex-col gap-2">
        {Object.values(providerMap).map((provider) => (
          <form
            key={provider.id}
            action={async () => {
              handleSignIn(provider, props.searchParams?.callbackUrl ?? "/");
            }}
          >
            <button type="submit">
              <span>Sign in with {provider.name}</span>
            </button>
          </form>
        ))}
      </div>
    </>
  );
}
