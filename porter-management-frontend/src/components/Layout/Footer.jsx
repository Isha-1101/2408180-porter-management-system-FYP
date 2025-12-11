// components/Footer.jsx

const LINKS = [
  {
    title: "Company",
    items: ["About Us", "Careers", "Premium Tools", "Blog"],
  },
  {
    title: "Pages",
    items: ["Login", "Register", "Add List", "Contact"],
  },
  {
    title: "Legal",
    items: ["Terms", "Privacy", "Team", "About Us"],
  },
];

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="px-8 pt-24 pb-8">
      <div className="container max-w-6xl mx-auto flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-3 w-full">
          <div className="flex flex-col md:flex-row col-span-2 gap-10 mb-10 lg:mb-0 md:gap-36">
            {LINKS.map(({ title, items }) => (
              <ul key={title}>
                <h6 className="text-lg font-semibold text-gray-900 mb-4">
                  {title}
                </h6>

                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#!"
                      className="py-1 block text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            ))}
          </div>

          <div>
            <h6 className="text-lg font-semibold mb-3 text-left">Subscribe</h6>

            <p className="text-gray-500 mb-4 text-base">
              Get access to exclusive deals and be the first to receive updates
              about new offers.
            </p>

            <p className="font-medium mb-2 text-left text-gray-700">
              Your Email
            </p>

            <div className="flex flex-col lg:flex-row items-start gap-4 mb-3">
              <div className="w-full">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
                />

                <p className="text-sm text-gray-500 mt-3">
                  I agree to the{" "}
                  <a
                    href="#!"
                    className="font-semibold underline hover:text-gray-900"
                  >
                    Terms and Conditions
                  </a>
                </p>
              </div>

              <button className="w-full lg:w-fit bg-gray-800 text-white px-5 py-2 rounded-md hover:bg-gray-900 transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <p className="text-center mt-16 text-gray-700">
          &copy; {CURRENT_YEAR} Doko-Namlo.{" "}
          <a
            href="https://www.creative-tim.com"
            target="_blank"
            className="underline"
          >
          </a>{" "}
          | Made by{" "}
          <a
            href="https://heraldcollege.edu.np/"
            target="_blank"
            className="underline"
          >
            2408180 HCK
          </a>
        </p>
      </div>
    </footer>
  );
}
