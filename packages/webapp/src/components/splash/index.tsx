import React from 'react';
import Image from 'next/image';
import Countdown, { CountdownRenderProps } from 'react-countdown';

export const Splash: React.FC = () => {
  const countdownRenderer = (props: CountdownRenderProps) => {
    return (
      <>
        <p className='text-center text-3xl my-4'>{props.days} days, {props.hours} hours, {props.minutes} minutes, {props.seconds} seconds</p>
      {/* <ul className='text-center text-2xl'>
        <li>
          {props.days} days 
        </li>
        <li>
          {props.hours} hours
        </li>
        <li>
          {props.minutes} minutes 
        </li>
        <li>
          {props.seconds} seconds
        </li>
      </ul> */}
      </>
      
    );
  };
  const launchDate = new Date('2023-02-01T00:00:00Z');
  console.log(launchDate);
  return <>
  <div className='flex flex-col items-center md:justify-center min-h-screen'>
    
    <div className='px-2 mt-5 text-center max-w-lg'>
      <div className='mx-auto' style={{
        maxWidth: '170px'
      }}> 
        <Image src="/ns-logo.png" alt="logo" width={433} height={250} />
      </div>
      <Countdown
          renderer={countdownRenderer}
          daysInHours={true}
          date={launchDate}
        />
        </div>
    <div className='max-w-3xl mx-auto my-5 md:my-10'> 
      <Image src="/splash-image.jpg" alt="splash image" width={1500} height={500} />
    </div>
    <div className='px-2 text-center max-w-lg'>
      <p className='text-lg leading-snug mb-2'>We have one year of comic strips that tells our story of the Nouns. We will release a strip every day for 365 days.🖖</p>
      <p className='text-lg leading-snug mb-2'>Every single day we will run an auction to sell the original 1/1 artwork for the comic strip. 👀</p>
      <p className='text-lg underline hover:no-underline'><a href="https://twitter.com/Nouns_sequitur/">follow along on twitter</a></p>
    </div>
      
  </div>
  </>;
};
