import Link from "next/link";
import Container from "../components/container";
import Layout from "../components/layout";
import urls from "../helpers/urls";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function About() {
  const { locale } = useRouter();

  const { t } = useTranslation();

  return (
    <>
      <Layout
        meta={{
          title: "About me and this site",
          description:
            "Created this site to discuss the topics that interest me, share some of the projects I am working and to hopefully teach and learn something along the way.",
          ogType: "profile",
        }}
        hreflangUrl={urls.about({
          locale: locale === "en" ? "es" : "en",
        })}
        t={t}
      >
        <Container>
          <div className="prose dark:prose-invert">
            <h1>About</h1>

            <h2>About this site</h2>

            <p>
              I created this site to share a little about the topics that
              interest me, the things I learn, and my thoughts on them. It is
              also a place where I can share some of the projects and
              experiments I am working on.
            </p>

            <p>
              I intend to let people know more about who I am and what I do and
              hopefully teaching and learning along the way.
            </p>

            <h2>About Me</h2>

            <p>
              My name is Alfonso. I am a human being, a husband, and a father of
              two.
            </p>

            <p>
              I currently live in Mexico City, but I&apos;m planning to move to{" "}
              <a
                href="https://www.google.com/search?q=merida+yucatan"
                target="_blank"
                rel="noreferrer"
              >
                Mérida Yucatán.
              </a>
            </p>

            <p>
              When I am not deciding how many pixels I want to use between a
              title and a paragraph, I am probably playing with my kids, reading
              a book, and recently training for triathlons. Ok, ok, also, maybe
              I am seeing a new tv series on some streaming service (probably
              that).
            </p>

            <p>
              In addition to software development, I&apos;m interested in design
              and illustration (although I wouldn&apos;t say it&apos;s something
              I practice). I also love memes and silly comic strips.
            </p>

            <p>
              Other topics that interest me are philosophy, psychology, and
              everything about the human mind. Recently I have become very
              interested in personal health issues.
            </p>

            <p>
              Do you like the site? Let me know! I Would love to hear{" "}
              <Link href={`/contact`}>
                <a>your thoughts.</a>
              </Link>
            </p>
          </div>
        </Container>
      </Layout>
    </>
  );
}

export const getStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
};
