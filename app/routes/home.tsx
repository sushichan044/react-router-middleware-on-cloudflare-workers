import type { Route } from "./+types/home";
import { cloudflareRRCtx } from "../entry.server";
import logoLight from "../welcome/logo-light.svg";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  const cf = context.get(cloudflareRRCtx);

  return { message: cf.VALUE_FROM_CLOUDFLARE };
}

const Message = ({ message }: { message: string }) => {
  return (
    <div className="rounded-3xl border border-gray-400 p-6 space-y-4">
      <p className="self-stretch p-3 leading-normal">{message}</p>
    </div>
  );
};

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <div className="w-[500px] max-w-[100vw] p-4">
            <img src={logoLight} alt="React Router" className="block w-full" />
          </div>
        </header>
        <div className="max-w-[600px] w-full space-y-6 px-4">
          <Message message={loaderData.message} />
        </div>
      </div>
    </main>
  );
}
