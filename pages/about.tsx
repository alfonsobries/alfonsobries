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
          title: t("common:about.meta_title"),
          description: t("common:about.meta_description"),

          ogType: "profile",
        }}
        hreflangUrl={urls.about({
          locale: locale === "en" ? "es" : "en",
        })}
        t={t}
      >
        <Container>
          <div className="prose dark:prose-invert">
            {locale === "en" ? (
              <>
                <h1>About</h1>

                <h2>About this site</h2>

                <p>
                  I created this site to share a little about the topics that
                  interest me, the things I learn, and my thoughts on them. It
                  is also a place where I can share some of the projects and
                  experiments I am working on.
                </p>

                <p>
                  I intend to let people know more about who I am and what I do
                  and hopefully teaching and learning along the way.
                </p>

                <h2>About Me</h2>

                <p>
                  My name is Alfonso. I am a human being, a husband, and a
                  father of two.
                </p>

                <p>
                  I currently live in Mexico City, but I&apos;m planning to move
                  to{" "}
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
                  title and a paragraph, I am probably playing with my kids,
                  reading a book, and recently training for triathlons. Ok, ok,
                  also, maybe I am seeing a new tv series on some streaming
                  service (probably that).
                </p>

                <p>
                  In addition to software development, I&apos;m interested in
                  design and illustration (although I wouldn&apos;t say
                  it&apos;s something I practice). I also love memes and silly
                  comic strips.
                </p>

                <p>
                  Other topics that interest me are philosophy, psychology, and
                  everything about the human mind. Recently I have become very
                  interested in personal health issues.
                </p>

                <p>
                  Do you like the site? Let me know! I Would love to hear{" "}
                  <Link href={urls.contact({ locale: "en" })}>
                    <a>your thoughts.</a>
                  </Link>
                </p>
              </>
            ) : (
              <>
                <h1>Acerca de</h1>

                <h2>Acerca de este sitio</h2>

                <p>
                  Creé este sitio para compartir un poco sobre los temas que me
                  interesan, las cosas que aprendo y mis pensamientos al
                  respecto. También es un lugar donde puedo compartir algunos de
                  los proyectos y experimentos en los que estoy trabajando.
                </p>

                <p>
                  Mi intención es dar a conocer más sobre quién soy y lo que
                  hago, y con suerte enseñar y aprender en el camino.
                </p>

                <h2>Acerca de mí</h2>

                <p>
                  Mi nombre es Alfonso. Soy un ser humano, esposo y papá de dos
                  hijos.
                </p>

                <p>
                  Actualmente vivo en la Ciudad de México, pero estoy planeando
                  mudarme a{" "}
                  <a
                    href="https://www.google.com/search?q=merida+yucatan"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Mérida, Yucatán
                  </a>
                  .
                </p>

                <p>
                  Cuando no estoy decidiendo cuántos píxeles quiero utilizar
                  entre un título y un párrafo, probablemente estoy jugando con
                  mis hijos, leyendo un libro y recientemente entrenando para
                  triatlones. Ok, ok, también es posible que esté viendo una
                  nueva serie de televisión en algún servicio de streaming
                  (probablemente eso).
                </p>

                <p>
                  Además del desarrollo de software, me interesa el diseño y la
                  ilustración (aunque no diría que es algo que practico).
                  También me encantan los memes y las tiras cómicas divertidas.
                </p>

                <p>
                  Otros temas que me interesan son la filosofía, la psicología y
                  todo lo relacionado con la mente humana. Recientemente me he
                  interesado mucho en temas de salud personal.
                </p>

                <p>
                  ¿Te gusta el sitio? ¡Házmelo saber! Me encantaría escuchar{" "}
                  <Link href={urls.contact({ locale: "es" })}>
                    <a>tus comentarios.</a>
                  </Link>
                </p>
              </>
            )}
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
