import PageContent from "../components/PageContent.js";
import WaveBackground from "../components/WaveBackground.js";

export default async function HomePage() {
  return (
    <>
      <WaveBackground />
      <PageContent />
    </>
  );
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
