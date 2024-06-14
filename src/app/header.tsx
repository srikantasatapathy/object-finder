import Image from 'next/image';
import logo from '../../public/ai-2.png';

const Header = () => {
  return (
    <header className="bg-white text-white py-4 px-6 flex items-center justify-between">
      {/* Logo on the left */}
      <div className="flex items-center">
        <div className="w-10 h-10 mr-2 flex">
          <Image src={logo} alt="Logo" width={500}/>
        </div>
      </div>
      {/* Name on the right */}
      <div className="hidden md:inline text-blue-800 ">Demo Demo</div>
    </header>
  );
};

export default Header;
