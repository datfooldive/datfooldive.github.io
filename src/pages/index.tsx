import PageContent from "../components/PageContent.js";

export default async function HomePage() {
  return <PageContent />;
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
