// Splash page
import React from 'react';

import { Container, Header, Main, Footer, Cards, Splash } from '@components';
import Head from 'next/head';
import { NextSeo } from 'next-seo';

const Home: React.FC = () => {
  const siteConfig = {
    title: "Noun Sequitur",
    description:
      "We have one year of comic strips that tells our story of the Nouns. We will release a strip every day for 365 days.",
    url: "https://nounsequitur.wtf",
    shareGraphic: "https://nounsequitur.wtf/splash-image.jpg",
  };
  return (
    <div style={{ backgroundColor: '#F6F1E5'}}>
    <Container>
      <Head>
        <title>Noun Sequitur</title>
        <meta name="" content="" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Londrina+Solid:wght@400;900&family=Source+Sans+Pro:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <NextSeo
        title={siteConfig.title}
        description={siteConfig.description}
        openGraph={{
          title: siteConfig.title,
          description: siteConfig.description,
          url: siteConfig.url,
          site_name: siteConfig.title,
          images: [
            {
              url: siteConfig.shareGraphic,
              width: 500,
              height: 500,
              alt: `${siteConfig.title} Share graphic`,
            },
          ],
        }}
        twitter={{
          cardType: "summary_large_image",
          site: siteConfig.url,
          handle: "",
        }}
      />
      {/* <Header /> */}
      <Splash />
      {/* <Main />
      <Cards /> */}
      {/* <Footer /> */}
    </Container>
    </div>
  );
};

export default Home;
