import React from 'react';
import Nav from './Nav';
import Hero from './Hero';
import Features from './Features';
import LiveDemo from './LiveDemo';
import Pricing from './Pricing';
import FinalCTA from './FinalCTA';
import Footer from './Footer';
import { IntakeData } from './IntakeForm';

interface LandingProps {
  onStartVoiceDemo: () => void;
  onOpenRoi: () => void;
  onSubmitForm: (data: IntakeData) => Promise<boolean>;
}

// Lleva a la sección del formulario final.
const scrollToApply = () => document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });

export default function Landing({ onStartVoiceDemo, onOpenRoi, onSubmitForm }: LandingProps) {
  return (
    <div id="top">
      <Nav onOpenRoi={onOpenRoi} onBookDemo={scrollToApply} />
      <Hero onStartVoiceDemo={onStartVoiceDemo} onOpenRoi={onOpenRoi} />
      <Features />
      <LiveDemo />
      <Pricing onBookDemo={scrollToApply} />
      <FinalCTA onSubmit={onSubmitForm} />
      <Footer />
    </div>
  );
}
