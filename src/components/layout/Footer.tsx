import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MessageCircle, Globe } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10">
          
          {/* Branding & Social */}
          <div className="md:col-span-1">
            <Link to="/" className="text-xl font-bold block mb-3">
              College<span className="text-accent">Connect</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              The student marketplace to buy, sell, and exchange items within your campus.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <ul className="text-sm space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/listings" className="text-gray-400 hover:text-white transition-colors">Browse Listings</Link></li>
              <li><Link to="/listings/create" className="text-gray-400 hover:text-white transition-colors">Sell an Item</Link></li>
              <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/sitemap" className="text-gray-400 hover:text-white transition-colors">Sitemap</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Legal</h3>
            <ul className="text-sm space-y-2">
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact</h3>
            <ul className="text-sm space-y-4">
              <li className="flex items-start">
                <Mail className="mr-2 mt-0.5 h-5 w-5 text-gray-400" />
                <a href="mailto:abhilasha@collegeconnect.com" className="text-gray-400 hover:text-white transition-colors">abhilasha@collegeconnect.com</a>
              </li>
              <li className="flex items-start">
                <Phone className="mr-2 mt-0.5 h-5 w-5 text-gray-400" />
                <a href="tel:+918757313099" className="text-gray-400 hover:text-white transition-colors">+91 8757313099</a>
              </li>
              <li className="flex items-start">
                <MessageCircle className="mr-2 mt-0.5 h-5 w-5 text-emerald-400" />
                <a
                  href="https://wa.me/918757313099"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  WhatsApp: +91 8757313099
                </a>
              </li>
              <li className="flex items-start">
                <Globe className="mr-2 mt-0.5 h-5 w-5 text-gray-400" />
                <a
                  href="https://www.technoindiauniversity.ac.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  College Website
                </a>
              </li>
              <li>
                <a
                  href="https://www.technoindiauniversity.ac.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Student Services
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Stay Updated</h3>
            <p className="text-sm text-gray-400 mb-4">Subscribe to our newsletter for updates and promotions.</p>
            <form className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="w-full rounded-md px-3 py-2 text-sm text-black focus:outline-none"
              />
              <button type="submit" className="bg-accent text-white px-4 py-2 rounded-md text-sm hover:bg-opacity-90 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          &copy; {currentYear} CollegeConnect. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
