import React from 'react'
import Navbar from './components/navbar';
import Hero from './components/hero';
import Features from './components/features';
import Footer from './components/footer';
import Testimonials from './components/testimonials';

export default function App() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Features />
      <Testimonials />
      <Footer />
    </div>
  )
}
