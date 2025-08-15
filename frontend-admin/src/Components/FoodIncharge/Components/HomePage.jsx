import React from 'react';
import Homebg from '../Assets/HomeBG.jpg';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-gray-900 text-white">
      <main className="flex flex-col items-center justify-center">
        <div className="relative w-full">
          <img
            alt="Delicious food on a plate"
            src={Homebg}
            className="w-full max-h-[600px] object-cover"
          />
          {/* Gradient overlay for improved text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent"></div>
          {/* Content container aligned to the left */}
          <div className="absolute inset-0 flex flex-col items-start justify-center text-white pl-10 lg:pl-20 md:pl-16 sm:pl-8">
            <h1 className="text-4xl lg:text-5xl font-stylish font-extrabold mb-4 tracking-wide drop-shadow-lg">
              Welcome to Food Incharge <br/> Dashboard
            </h1>
            <p className="text-lg lg:text-xl mb-6 max-w-lg drop-shadow-sm">
              Manage orders, assign tasks, and ensure timely food preparation with our efficient platform.
            </p>
            <button
              className="bg-red-500 text-white py-3 px-8 rounded-2xl text-lg hover:bg-red-600 transition duration-300 shadow-lg"
              onClick={() => navigate("/menu")}
            >
              Explore Menu
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
