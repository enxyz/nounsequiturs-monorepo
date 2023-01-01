// Splash page
import React from 'react';

import { Container, Header, Main, Footer, Cards, Splash } from '@components';
import Head from 'next/head';

const Home: React.FC = () => {
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
