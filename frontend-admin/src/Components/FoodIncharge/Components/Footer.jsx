import React, { useState } from "react";
import Modal from "react-modal";
import { Link } from "react-router-dom";
import '../Styles/Style.css';

// Modal setup for accessibility
Modal.setAppElement('#root');

const Footer = () => {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Content for Privacy Policy Modal
  const privacyContent = (
    <div>
      <p><strong>Effective Date:</strong> March 2025</p>
      <p>At <strong>Food Incharge</strong>, we value your privacy. This policy outlines the data we collect, how it is used, and the steps we take to ensure its protection.</p>
      <h3 className="mt-4 text-lg font-semibold">Information We Collect</h3>
      <ul className="list-disc pl-5 mt-2">
        <li><strong>Personal Information:</strong> Name, email, phone number, payment details.</li>
        <li><strong>Order Details:</strong> Food items, quantities, preferences, and payment status.</li>
        <li><strong>Location Data:</strong> For order tracking based on your QR code scan.</li>
      </ul>
      <h3 className="mt-4 text-lg font-semibold">How We Use Your Information</h3>
      <ul className="list-disc pl-5 mt-2">
        <li>To process orders effectively and send updates.</li>
        <li>To offer personalized promotions and improve the customer experience.</li>
      </ul>
      <h3 className="mt-4 text-lg font-semibold">Data Protection</h3>
      <p>We use encryption and security best practices to protect your data. However, no system is entirely secure, and we cannot guarantee the absolute security of your information.</p>
    </div>
  );

  // Content for Terms & Conditions Modal
  const termsContent = (
    <div>
      <p><strong>Effective Date:</strong> March 2025</p>
      <p>By using the **Food Incharge System**, you agree to these Terms and Conditions, which govern your use of the service.</p>
      <h3 className="mt-4 text-lg font-semibold">Order Process</h3>
      <p>After scanning the QR code, you can browse the menu, select your items, and place an order. Once confirmed, your food is processed and assigned for preparation.</p>
      <h3 className="mt-4 text-lg font-semibold">Payment</h3>
      <p>Once your order is ready, you’ll receive an update and can proceed to the cashier for payment.</p>
      <h3 className="mt-4 text-lg font-semibold">Liabilities</h3>
      <p>Food Incharge is not responsible for system errors or food allergies. Please double-check your order and let us know about any special requests or concerns.</p>
    </div>
  );

  return (
    <footer className="bg-gray-800 text-white pt-4 items-center">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h2 className="text-xl font-bold text-red-500">Restaurant Management</h2>
          <p className="text-sm mt-2">
            Efficient food ordering with QR scan technology.
          </p>
        </div>

        <div className="flex gap-9 text-sm">
          <Link to="/dashboard/home" className="hover:text-red-500 transition">
            Home
          </Link>
          <Link to="/dashboard/menu" className="hover:text-red-500 transition">
            Menu
          </Link>
          <Link to="/dashboard/booking" className="hover:text-red-500 transition">
            Booking
          </Link>
          <Link to="/dashboard/support" className="hover:text-red-500 transition">
            Support
          </Link>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-600 bg-gray-800 text-center pt-4 text-sm">
        <button
          className="hover:text-red-500 transition"
          onClick={() => setIsPrivacyModalOpen(true)}
        >
          Privacy Policy
        </button>{" "}
        |{" "}
        <button
          className="hover:text-red-500 transition ml-2"
          onClick={() => setIsTermsModalOpen(true)}
        >
          Terms & Conditions
        </button>
        <p className="mt-2 pb-3">
          © 2025 Food Incharge System | Developed with Crave Corner
        </p>
      </div>

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={isPrivacyModalOpen}
        onRequestClose={() => setIsPrivacyModalOpen(false)}
        contentLabel="Privacy Policy"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-red-500">Privacy Policy</h2>
          <button
            className="text-2xl text-gray-600 hover:text-red-500"
            onClick={() => setIsPrivacyModalOpen(false)}
          >
            &times;
          </button>
        </div>
        <div className="modal-body overflow-y-auto max-h-[70vh]">{privacyContent}</div>
      </Modal>

      {/* Terms & Conditions Modal */}
      <Modal
        isOpen={isTermsModalOpen}
        onRequestClose={() => setIsTermsModalOpen(false)}
        contentLabel="Terms and Conditions"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-red-500">Terms & Conditions</h2>
          <button
            className="text-2xl text-gray-600 hover:text-red-500"
            onClick={() => setIsTermsModalOpen(false)}
          >
            &times;
          </button>
        </div>
        <div className="modal-body overflow-y-auto max-h-[70vh]">{termsContent}</div>
      </Modal>
    </footer>
  );
};

export default Footer;
