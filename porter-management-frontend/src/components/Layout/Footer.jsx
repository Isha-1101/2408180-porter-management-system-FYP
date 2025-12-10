import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-darkmode relative z-1 border-t border-dark_border px-6">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid md:grid-cols-12 grid-cols-1 sm:grid-cols-12">
          
          {/* LEFT SECTION */}
          <div className="md:col-span-4 sm:col-span-6 col-span-12 sm:border-r border-b border-solid border-dark_border flex items-center sm:border-b-0 sm:min-h-25 py-10 shrink-0">
            <div className="sm:content-normal sm:text-start text-center content-center sm:w-auto w-full">
              <Link to="/" className="md:block flex justify-center">
                <img
                  src="assests/Images/logo.png"
                  alt="logo"
                  width="160"
                  style={{ height: "auto" }}
                />
              </Link>
              <h2 className="text-white py-10 text-[40px] leading-tight font-bold">
                Ready to get started?
              </h2>
              <Link
                to="#"
                className="px-9 py-3 rounded-lg bg-primary text-white hover:bg-blue-700 hover:shadow-none"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* SUPPORT SECTION */}
          <div className="md:col-span-4 sm:col-span-6 col-span-12 sm:flex items-center sm:min-h-25 py-10 justify-center shrink-0 md:border-r border-b sm:border-b-0 border-solid border-dark_border">
            <div className="flex flex-col md:items-start items-center">
              <span className="text-lg font-bold text-white pb-4 inline-block">
                Support
              </span>

              <div className="pb-5 sm:block flex">
                <p className="text-base font-bold text-white">Phone</p>
                <a
                  href="tel:+(690) 2560 0020"
                  className="text-2xl text-white/50 hover:text-white"
                >
                  +(690) 2560 0020
                </a>
              </div>

              <div className="sm:block flex items-center gap-3">
                <p className="text-base font-bold text-white">Email</p>
                <a
                  href="mailto:info@venus.com"
                  className="text-2xl text-white/50 hover:text-white"
                >
                  info@Venus.com
                </a>
              </div>

              {/* SOCIAL ICONS */}
              <div>
                <ul className="flex items-center gap-3 mt-[1.875rem]">
                  {/* Icon 1 */}
                  <li className="group">
                    <Link to="#">
                      <svg
                        width="25"
                        height="25"
                        viewBox="0 0 25 25"
                        fill="#A3BBD1"
                        xmlns="http://www.w3.org/2000/svg"
                        className="group-hover:fill-primary"
                      >
                        <g clipPath="url(#clip0_1_343)">
                          <path d="M22.9128 0.769043H2.06165C1.34768 0.769472 0.7689 ..." />
                        </g>
                        <defs>
                          <clipPath id="clip0_1_343">
                            <rect width="25" height="25" />
                          </clipPath>
                        </defs>
                      </svg>
                    </Link>
                  </li>

                  {/* Icon 2 */}
                  <li className="group">
                    <Link to="#">
                      <svg
                        width="23"
                        height="23"
                        viewBox="0 0 23 23"
                        fill="#A3BBD1"
                        xmlns="http://www.w3.org/2000/svg"
                        className="group-hover:fill-primary"
                      >
                        <g clipPath="url(#clip0_1_345)">
                          <path d="M21.3412 0H1.65878C0.742615 0 0 ..." />
                        </g>
                        <defs>
                          <clipPath id="clip0_1_345">
                            <rect width="23" height="23" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </Link>
                  </li>

                  {/* Icon 3 */}
                  <li className="group">
                    <Link to="#">
                      <svg
                        width="22"
                        height="23"
                        viewBox="0 0 22 23"
                        fill="#A3BBD1"
                        xmlns="http://www.w3.org/2000/svg"
                        className="group-hover:fill-primary"
                      >
                        <g clipPath="url(#clip0_1_347)">
                          <path d="M20.4133 0H1.58665C0.710327 0 0 ..." />
                        </g>
                        <defs>
                          <clipPath id="clip0_1_347">
                            <rect width="22" height="23" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* SUBSCRIBE SECTION */}
          <div className="md:col-span-4 col-span-12 border-t md:border-none border-solid border-dark_border sm:flex items-center justify-end md:min-h-25 py-10 shrink-0">
            <div className="md:w-3/4 w-full sm:text-start text-center">
              <span className="font-bold text-white pb-4 inline-block text-2xl">
                Subscribe newsletter
              </span>
              <p className="text-MistyBlue text-base pb-7 text-white/50">
                To be updated with all the latest trends and product
              </p>

              <form className="newsletter-form flex rounded-lg sm:w-full w-3/4 sm:mx-0 mx-auto">
                <input
                  type="email"
                  placeholder="Email*"
                  className="p-4 text-base rounded-s-lg outline-0 w-[calc(100%_-_137px)] bg-white dark:bg-midnight_text dark:text-white"
                />
                <button
                  type="submit"
                  className="p-[0.625rem] text-base font-medium bg-primary text-white rounded-e-lg w-[8.5625rem] hover:bg-blue-700"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER */}
      <div className="text-center gap-4 md:gap-0 flex-wrap p-7 border-t border-solid border-dark_border">
        <ul className="flex justify-center mb-4 items-center sm:gap-7 gap-3">
          <li className="text-base text-white/50">
            <Link to="/#about" className="hover:text-primary">About</Link>
          </li>
          <li className="text-base text-white/50">
            <Link to="/#services" className="hover:text-primary">Services</Link>
          </li>
          <li className="text-base text-white/50">
            <Link to="/portfolio" className="hover:text-primary">Portfolio</Link>
          </li>
          <li className="text-base text-white/50">
            <Link to="/blog" className="hover:text-primary">Blog</Link>
          </li>
          <li className="text-base text-white/50">
            <Link to="/contact" className="hover:text-primary">Contact</Link>
          </li>
        </ul>

        <p className="text-base text-white/50">
          © All rights reserved. Made by{" "}
          <a
            href="https://getnextjstemplates.com/"
            target="_blank"
            className="hover:text-primary"
          >
            GetNextJs Templates
          </a>{" "}
          • Distributed by{" "}
          <a
            href="https://themewagon.com/"
            target="_blank"
            className="hover:text-primary"
          >
            ThemeWagon
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
