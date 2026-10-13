import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import BookingForm from '../components/BookingForm';
import Fleet from '../components/Fleet';
import Advantages from '../components/Advantages';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <BookingForm />
      <Fleet />
      <Advantages />
      <Testimonials />
      <Footer />
    </div>
  );
}
