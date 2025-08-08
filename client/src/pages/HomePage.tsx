import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, Truck } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Delicious Food
              <span className="text-gradient"> Delivered</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Order your favorite meals online and get them delivered to your doorstep. 
              Fast, fresh, and convenient with mobile money payment options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/menu"
                className="btn btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
              >
                <span>Browse Menu</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/register"
                className="btn btn-outline text-lg px-8 py-3"
              >
                Sign Up Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose FoodHub?
            </h2>
            <p className="text-lg text-gray-600">
              We make food ordering simple, fast, and secure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Fast Delivery
              </h3>
              <p className="text-gray-600">
                Get your food delivered in 30-45 minutes or less
              </p>
            </div>

            <div className="text-center">
              <div className="bg-success-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-success-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Quality Food
              </h3>
              <p className="text-gray-600">
                Fresh ingredients and delicious meals prepared with care
              </p>
            </div>

            <div className="text-center">
              <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Mobile Money
              </h3>
              <p className="text-gray-600">
                Pay with Airtel Money or MTN Mobile Money securely
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Order?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of satisfied customers who love our food
          </p>
          <Link
            to="/menu"
            className="btn btn-primary text-lg px-8 py-3"
          >
            Start Ordering Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 