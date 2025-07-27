// client/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  // Define your footer categories and links
  const footerLinks = [
    {
      title: 'Categories',
      links: [
        { name: 'Graphics & Design', path: '/gigs?category=Graphics%20%26%20Design' },
        { name: 'Digital Marketing', path: '/gigs?category=Digital%20Marketing' },
        { name: 'Writing & Translation', path: '/gigs?category=Writing%20%26%20Translation' },
        { name: 'Video & Animation', path: '/gigs?category=Video%20%26%20Animation' },
        { name: 'Music & Audio', path: '/gigs?category=Music%20%26%20Audio' },
        { name: 'Programming & Tech', path: '/gigs?category=Programming%20%26%20Tech' },
        { name: 'AI Services', path: '/gigs?category=AI%20Services' },
        { name: 'Business', path: '/gigs?category=Business' },
        { name: 'Lifestyle', path: '/gigs?category=Lifestyle' },
        { name: 'Data', path: '/gigs?category=Data' },
        { name: 'Photography', path: '/gigs?category=Photography' },
        { name: 'Finance', path: '/gigs?category=Finance' },
      ],
    },
    {
      title: 'About',
      links: [
        { name: 'Careers', path: '#' },
        { name: 'Press & News', path: '#' },
        { name: 'Partnerships', path: '#' },
        { name: 'Privacy Policy', path: '#' },
        { name: 'Terms of Service', path: '#' },
        { name: 'Investor Relations', path: '#' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help & Support', path: '#' },
        { name: 'Trust & Safety', path: '#' },
        { name: 'Fiverr Guides', path: '#' },
        { name: 'Selling on Fiverr', path: '#' },
        { name: 'Buying on Fiverr', path: '#' },
      ],
    },
    {
      title: 'Community',
      links: [
        { name: 'Community Hub', path: '#' },
        { name: 'Forum', path: '#' },
        { name: 'Events', path: '#' },
        { name: 'Blog', path: '#' },
        { name: 'Affiliates', path: '#' },
      ],
    },
    {
      title: 'More From Fiverr',
      links: [
        { name: 'Fiverr Pro', path: '#' },
        { name: 'Fiverr Logo Maker', path: '#' },
        { name: 'Fiverr Guides', path: '#' },
        { name: 'ClearVoice', path: '#' },
        { name: 'Fiverr Learn', path: '#' },
        { name: 'Working Not Working', path: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-800 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        {/* Top Section: Link Columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 border-b border-gray-700 pb-8 mb-8">
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h4 className="text-white font-semibold text-lg mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link to={link.path} className="text-sm hover:text-fiverr-green transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section: Logo, Social, Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          {/* Logo and Copyright */}
          <div className="flex items-center mb-4 md:mb-0">
            <Link to="/" className="text-2xl font-bold text-fiverr-green flex items-center mr-2">
              <svg className="w-6 h-6 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-white">fiverr</span>
              <span className="text-fiverr-green text-3xl leading-none font-extrabold -ml-1">.</span>
            </Link>
            <span className="ml-4 text-gray-400">© Fiverr International Ltd. 2025</span>
          </div>

          {/* Social Icons (placeholders) */}
          <div className="flex space-x-6">
            {/* Facebook */}
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.042c-5.463 0-9.917 4.454-9.917 9.917 0 4.908 3.583 9 8.24 9.771V14.65h-2.909v-2.733h2.909V9.58c0-2.88 1.761-4.454 4.331-4.454 1.239 0 2.308.092 2.617.133v3.023h-1.794c-1.408 0-1.683.669-1.683 1.649v2.164h3.35l-.558 3.35h-2.792v7.712c4.657-.771 8.24-4.863 8.24-9.771 0-5.463-4.454-9.917-9.917-9.917z"/></svg></a>
            {/* LinkedIn */}
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.692v-8.66c0-2.076-1.115-3.076-2.588-3.076-1.716 0-2.433 1.151-2.433 3.016v8.72h-3.693V9.016H7.954v2.05h.06c.333-.518 1.173-1.29 2.456-1.29 2.597 0 4.545 1.706 4.545 5.378v8.66zm-12.724-11.204h3.692V7.016H7.723v2.232zm-1.815-4.228c0-1.206-.997-2.194-2.226-2.194S.954 3.784.954 5c0 1.196.997 2.193 2.226 2.193s2.226-.997 2.226-2.193z"/></svg></a>
            {/* Twitter */}
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 5.86c-.74.33-1.53.55-2.36.65.85-.51 1.5-1.24 1.8-2.16-.79.47-1.68.81-2.61.99-.75-.8-1.82-1.3-3.02-1.3-2.29 0-4.14 1.86-4.14 4.14 0 .32.04.63.1.92C8.61 9.4 5.75 7.82 3.86 5.32c-.32.55-.5 1.19-.5 1.87 0 1.44.73 2.7 1.84 3.44-.67-.02-1.3-.2-1.86-.5v.05c0 2 1.42 3.65 3.3 4.02-.34.1-.7.15-1.07.15-.26 0-.5-.03-.74-.07 1.47 1.83 3.6 3.17 6.07 3.23-1.42 1.11-3.21 1.78-5.15 1.78-.34 0-.68-.02-1.01-.06C3.42 20.3 5.75 21 8.24 21c9.89 0 15.29-8.19 15.29-15.29 0-.23-.01-.46-.02-.68.83-.6 1.55-1.36 2.12-2.2z"/></svg></a>
            {/* Instagram */}
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.042c-5.463 0-9.917 4.454-9.917 9.917 0 4.908 3.583 9 8.24 9.771V14.65h-2.909v-2.733h2.909V9.58c0-2.88 1.761-4.454 4.331-4.454 1.239 0 2.308.092 2.617.133v3.023h-1.794c-1.408 0-1.683.669-1.683 1.649v2.164h3.35l-.558 3.35h-2.792v7.712c4.657-.771 8.24-4.863 8.24-9.771 0-5.463-4.454-9.917-9.917-9.917z"/></svg></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;