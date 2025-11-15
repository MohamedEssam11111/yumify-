export default function SplashScreen() {
  return (
    <div className="relative min-h-screen overflow-hidden text-white antialiased"
         style={{
           fontFamily: "'Poppins', sans-serif",
           background: "linear-gradient(135deg, #ff8c42, #c83349)",
         }}
    >
      {/* icons */}
      <div className="icon-container absolute inset-0 pointer-events-none z-[1]">
        <svg className="food-icon icon-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 2C9.24 2 7 4.24 7 7C7 9.21 8.64 11.16 10.75 11.82L3.64 18.93L5.05 20.34L12.16 13.23C12.44 13.28 12.72 13.3 13 13.3C15.76 13.3 18 11.06 18 8.3C18 5.54 15.76 3.3 13 3.3C12.67 3.3 12.34 3.33 12.03 3.39L12 2Z M9 7C9 5.34 10.34 4 12 4C12.37 4 12.72 4.06 13.05 4.17L8.17 9.05C8.06 8.72 8 8.37 8 8C8 7.67 8.03 7.34 8.09 7.03L9 7Z"/></svg>
        <svg className="food-icon icon-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M19 13V11H5V13H19M19 5V7H5V5H19M19 17V15H5V17H19M21 9H3C2.45 9 2 9.45 2 10V14C2 14.55 2.45 15 3 15H5V17C5 18.1 5.9 19 7 19H17C18.1 19 19 18.1 19 17V15H21C21.55 15 22 14.55 22 14V10C22 9.45 21.55 9 21 9M17 13H7V11H17V13Z"/></svg>
        <svg className="food-icon icon-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M3,9H21V7H3V9M3,15H21V13H3V15M5,22C5,22 19,22 19,17C19,12 15,3 12,3C9,3 5,12 5,17C5,22 5,22 5,22Z" /></svg>
        <svg className="food-icon icon-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M18.82,9.33L17.88,4.76L19.2,4.44L20.14,9L18.82,9.33M16.5,10.27L15.56,5.7L16.88,5.38L17.82,9.95L16.5,10.27M13,11.5L12.06,7L13.38,6.69L14.32,11.17L13,11.5M6,22V8H11V22H6M4,7V22H2V7A2,2 0 0,1 4,5H13A2,2 0 0,1 15,7V22H13V7H4Z"/></svg>
        <svg className="food-icon icon-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M10,2L11,3.06V8.12L10,8.35V2M15,2V8.35L14,8.12V3.06L15,2M4,9L5,10V21.5C5,21.78 5.22,22 5.5,22H18.5C18.78,22 19,21.78 19,21.5V10L20,9V8H4V9Z"/></svg>
        <svg className="food-icon icon-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12M20 12C20 16.42 16.42 20 12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6Z"/></svg>
        <svg className="food-icon icon-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M2,14C2,15.11 2.9,16 4,16H18C19.11,16 20,15.11 20,14C20,13.33 19.62,12.75 19.08,12.42L18,12C18,10.16 16.5,8.5 14.5,8.18C14.17,5.18 11.83,3 9,3C6.17,3 3.83,5.18 3.5,8.18C3.17,8.28 2.86,8.44 2.59,8.65L2.2,8.91C2.07,9.54 2,10.2 2,10.88V14M4,14V11.19C4.33,10.56 5,10.14 5.76,10C6.05,7.17 8,5 10.5,5C13,5 15,7.17 15.24,10C16,10.14 16.67,10.56 17,11.19V14H4Z"/></svg>
        <svg className="food-icon icon-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12,2C10.68,2 9.6,2.84 9.2,4H6V2H4V4H3C2.45,4 2,4.45 2,5V9C2,10.65 3.35,12 5,12V20C5,21.1,5.9,22,7,22H17C18.1,22 19,21.1 19,20V12C20.65,12 22,10.65 22,9V5C22,4.45 21.55,4 21,4H20V2H18V4H14.8C14.4,2.84 13.32,2 12,2M12,4C12.55,4 13,4.45 13,5C13,5.55 12.55,6 12,6C11.45,6 11,5.55 11,5C11,4.45 11.45,4 12,4Z"/></svg>
      </div>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center p-4">
        {/* Yumify logo */}
        <div className="mb-4 w-24 h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zM4 6a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM4 14a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" />
          </svg>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold tracking-wider drop-shadow-md">
          Yumify
        </h1>

        <p className="mt-2 text-lg md:text-xl text-orange-100 font-light">
          Smart Restaurant Management.
        </p>

        {/* Loader */}
        <div className="loader mt-12"></div>
      </main>

      {/* Internal styles */}
      <style jsx="true">{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-25px) rotate(15deg); }
          100% { transform: translateY(0) rotate(0); }
        }
        .food-icon { position:absolute; opacity:0.2; animation: float 8s ease-in-out infinite; }
        .icon-1 { top:10%; left:15%; width:60px; animation-duration:7s; }
        .icon-2 { top:20%; right:10%; width:50px; animation-delay:-3s; }
        .icon-3 { bottom:15%; left:20%; width:70px; animation-duration:9s; animation-delay:-1s; }
        .icon-4 { bottom:25%; right:25%; width:45px; animation-delay:-5s; }
        .icon-5 { top:50%; left:5%; width:55px; animation-duration:10s; }
        .icon-6 { top:60%; right:8%; width:65px; animation-delay:-2s; }
        .icon-7 { top:8%; right:40%; width:40px; animation-duration:6s; }
        .icon-8 { bottom:5%; left:50%; width:60px; transform:translateX(-50%); animation-delay:-4s; }
        .loader {
          border:5px solid rgba(255,255,255,0.2);
          border-left-color:white;
          border-radius:50%;
          width:60px; height:60px;
          animation: spin 1.2s linear infinite;
        }
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
